import { REPORT_DRAFT_STATE } from '@/features/reports/constants/reportDraftState';
import usePreserveBrigadeDraft from '@/features/reports/hooks/usePreserveBrigadeDraft';
import { validateReportValues } from '@/features/reports/lib/validateReportValues';
import { useCallback } from 'react';
import { areObjectsEqual } from '@/shared/lib/collections/areObjectsEqual';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getReportByTaskId,
    submitReport,
    addReportComment,
    createReport,
    deleteReportImage,
    updateReport,
    updateReportPdfAct,
    uploadReportImage,
    uploadReportPdfAct,
} from '@/features/reports/api/submitReportApi';
import useNetwork from '@/shared/hooks/offline/useNetwork';
import useReportDraftStore from '@/features/reports/store/useReportDraftStore';
import useReportsStore from '@/features/reports/store/useReportsStore';
import {
    REPORT_OPERATION_KEY,
    startReportOperation,
} from '@/features/reports/lib/reportOperation';
import { createClientId } from '@/features/reports/lib/createClientReportId';
import { prepareReportPhotoMetadata } from '@/features/reports/lib/reportPhotoMetadata';
import useStorePictures from '@/shared/store/useStorePictures';
import { REPORT_STATUS } from '@/features/reports/constants/reportStatus';
import {
    buildReportCommentPayload,
    buildReportImagesPayload,
    buildReportPayload,
    buildReportPdfActPayload,
    getRemovedReportImageIds,
} from '@/features/reports/lib/buildReportPayload';
import {
    buildReportUpsertRequest,
    selectReportForTask,
} from '@/features/reports/lib/reportUpsert';
import { validateReportUploadFiles } from '@/features/reports/lib/validateReportUploadFiles';
import { retryReportImageUpload } from '@/features/reports/lib/retryReportImageUpload';

const isReportSubmissionConfirmed = (report, submission) =>
    Boolean(submission?.clientReportId) &&
    Number(report?.id) === Number(submission?.reportId) &&
    Number(report?.task_id) === Number(submission?.taskId) &&
    report?.client_report_id === submission?.clientReportId &&
    [
        REPORT_STATUS.ON_REVIEW,
        REPORT_STATUS.ON_ADMIN,
        REPORT_STATUS.ACCEPTED,
    ].includes(report?.status);

const finalizeReportSubmission = async (submission) => {
    try {
        const report = await submitReport(submission.reportId);
        if (isReportSubmissionConfirmed(report, submission)) return report;
        throw new Error('Не удалось получить подтверждённый отчёт');
    } catch (error) {
        const status = error.response?.status;
        const ambiguous = !error.response || status === 408 || status >= 500;
        if (ambiguous) {
            try {
                const report = await getReportByTaskId(submission.taskId);
                if (isReportSubmissionConfirmed(report, submission))
                    return report;
            } catch {
                throw error;
            }
        }
        throw error;
    }
};

const prepareReportSubmission = async ({
    taskId,
    values,
    existingReport,
    photoMetadata,
    clientActId,
    buildReportSignaturesPayload,
}) => {
    const { isRefused } = values.actPdf;
    const reportPdfActPayload = !isRefused
        ? buildReportPdfActPayload(
              values,
              existingReport?.act?.client_act_id || clientActId
          )
        : null;
    await validateReportUploadFiles({
        imagesPayload: buildReportImagesPayload(
            values,
            existingReport?.images,
            photoMetadata
        ),
        actPayload: reportPdfActPayload,
        isExistingAct: Boolean(existingReport?.act?.client_act_id),
    });
    const reportPayload = buildReportPayload(
        { ...values, taskId },
        {
            includeEmptyOptionalFields: Boolean(existingReport),
            signaturePayload: buildReportSignaturesPayload(values.actPdf),
        }
    );
    const reportCommentPayload = buildReportCommentPayload(values);
    const upsertRequest = buildReportUpsertRequest({
        reportPayload,
        existingReport,
        resubmitRejectedReport: false,
    });
    return {
        reportPayload,
        reportPdfActPayload,
        reportCommentPayload,
        upsertRequest,
    };
};

const saveOfflineReportSubmission = async ({
    taskId,
    values,
    photoMetadata,
    clientActId,
    actRecord,
    actOperations,
}) => {
    const draftId = String(taskId);
    const { uri: actPdfUri, isRefused } = values.actPdf;
    const { savePdfToDocuments, saveAct } = actOperations;
    const { setDraft } = useReportDraftStore.getState();
    const cachedReport = selectReportForTask(
        useReportsStore.getState().reports,
        taskId
    );
    await validateReportUploadFiles({
        imagesPayload: buildReportImagesPayload(
            values,
            cachedReport?.images,
            photoMetadata
        ),
        actPayload: !isRefused
            ? buildReportPdfActPayload(values, clientActId)
            : null,
        offline: true,
    });
    const offlineValues = !isRefused
        ? {
              ...values,
              actPdf: {
                  ...values.actPdf,
                  uri: await savePdfToDocuments({
                      fileName: taskId.toString(),
                      sourceUri: actPdfUri,
                  }),
              },
          }
        : values;
    if (!isRefused) {
        saveAct(draftId, { ...actRecord, uri: offlineValues.actPdf.uri });
    }
    setDraft({
        draftId,
        values: {
            ...offlineValues,
            reportState: REPORT_DRAFT_STATE.PENDING,
            requiresManualSubmit: false,
        },
    });
    return { offline: true };
};

const uploadReportSubmission = async ({
    taskId,
    isTeamTask,
    values,
    photoMetadata,
    removedPhotoIds,
    upsertRequest,
    reportPdfActPayload,
    reportCommentPayload,
    trackSubmission,
}) => {
    const { uri: actPdfUri, isRefused } = values.actPdf;
    let reportResponse =
        upsertRequest.operation === 'update'
            ? await updateReport(upsertRequest.reportId, upsertRequest.payload)
            : await createReport(upsertRequest.payload);
    const reportId = reportResponse?.id;

    if (!reportId) {
        throw new Error('Не удалось получить идентификатор отчета');
    }

    trackSubmission(reportResponse);

    const reportImagesPayload = buildReportImagesPayload(
        values,
        reportResponse.images,
        photoMetadata
    );
    const removedImageIds = getRemovedReportImageIds({
        photos: values.photos,
        photoMetadata,
        removedPhotoIds,
        existingImages: reportResponse.images,
    });

    if (reportImagesPayload) {
        reportResponse = await retryReportImageUpload(() =>
            uploadReportImage(reportId, reportImagesPayload)
        );
        trackSubmission(reportResponse);
    }

    const serverActId = reportResponse?.act?.client_act_id;

    if (!isRefused && actPdfUri && reportPdfActPayload) {
        if (serverActId) {
            reportResponse = await updateReportPdfAct(
                reportId,
                reportPdfActPayload,
                serverActId
            );
        } else {
            reportResponse = await uploadReportPdfAct(
                reportId,
                reportPdfActPayload
            );
        }
        trackSubmission(reportResponse);
    }

    for (const clientImageId of removedImageIds) {
        await deleteReportImage(reportId, clientImageId);
        reportResponse = {
            ...reportResponse,
            images: (reportResponse.images ?? []).filter(
                (image) => image['client_image_id'] !== clientImageId
            ),
        };
        trackSubmission(reportResponse);
    }

    if (isTeamTask && removedImageIds.length) {
        const latestReport = await getReportByTaskId(taskId);
        if (latestReport?.id === reportId) {
            reportResponse = latestReport;
            trackSubmission(reportResponse);
        }
    }

    if (reportCommentPayload) {
        await addReportComment(reportId, reportCommentPayload);
    }

    return { reportId, reportResponse };
};

const useSubmitReport = ({
    getTasks,
    getTaskById,
    isTaskReportReadOnly,
    actOperations,
}) => {
    const {
        validateReportAct,
        getActRecord,
        getActId,
        clearTaskAct,
        buildReportSignaturesPayload,
    } = actOperations;
    const queryClient = useQueryClient();
    const preserveBrigadeDraft = usePreserveBrigadeDraft();
    const { isOnline, isChecked } = useNetwork();
    const setDraft = useReportDraftStore((state) => state.setDraft);
    const setUpdatedReports = useReportsStore(
        (state) => state.setUpdatedReports
    );

    const { mutateAsync, error, isPending } = useMutation({
        mutationKey: [...REPORT_OPERATION_KEY, 'submit'],
        networkMode: 'always',
        retry: false,
        onMutate: ({ taskId }) =>
            useReportDraftStore.getState().getDraft(String(taskId)),
        mutationFn: async ({ taskId, values, expectedDraft }) => {
            const draftId = String(taskId);
            const previousDraft = useReportDraftStore
                .getState()
                .getDraft(draftId);
            if (
                expectedDraft &&
                !areObjectsEqual(
                    expectedDraft,
                    useReportDraftStore.getState().getDraft(draftId)
                )
            ) {
                return { skipped: true };
            }
            if (previousDraft?.submissionFinalization && isOnline) {
                const recoveryActRecord = getActRecord(draftId);
                let report;
                try {
                    report = await getReportByTaskId(taskId);
                } catch (error) {
                    error.submittedDraft = previousDraft;
                    throw error;
                }
                if (
                    isReportSubmissionConfirmed(report, {
                        ...previousDraft.submissionFinalization,
                        taskId,
                    })
                ) {
                    return {
                        actRecord: recoveryActRecord,
                        reportId: report.id,
                        reportResponse: report,
                        operation: 'update',
                        submittedDraft: previousDraft,
                    };
                }
            }
            validateReportValues(values, taskId);
            try {
                await validateReportAct({ taskId, values });
            } catch (error) {
                error.code = 'REPORT_ACT_INVALID';
                throw error;
            }
            if (
                expectedDraft &&
                !areObjectsEqual(
                    expectedDraft,
                    useReportDraftStore.getState().getDraft(draftId)
                )
            ) {
                return { skipped: true };
            }
            const picturesState = useStorePictures.getState();
            const photoMetadata = prepareReportPhotoMetadata({
                photos: values.photos,
                photoMetadata:
                    picturesState.photoMetadata.report?.[draftId] ?? {},
                createId: createClientId,
            });
            picturesState.setEntityPhotoMetadata({
                entity: 'report',
                entityId: draftId,
                photoMetadata,
            });
            const removedPhotoIds =
                picturesState.removedPhotoIds.report?.[draftId] ?? [];
            const { uri: actPdfUri, isRefused } = values.actPdf;
            if (!isRefused && !actPdfUri) {
                throw new Error('Отсутствует цифровой акт');
            }
            const clientActId = !isRefused
                ? getActId(draftId, createClientId)
                : null;
            const actRecord = getActRecord(draftId);
            if (!isOnline && isChecked) {
                return saveOfflineReportSubmission({
                    taskId,
                    values,
                    photoMetadata,
                    clientActId,
                    actRecord,
                    actOperations,
                });
            }
            const task =
                getTasks()?.find(
                    (task) => Number(task.id) === Number(taskId)
                ) ?? (await getTaskById(taskId));
            const existingReport = await getReportByTaskId(taskId);
            if (
                isTaskReportReadOnly(
                    task,
                    existingReport,
                    useReportDraftStore.getState().getDraft(draftId)
                )
            ) {
                setUpdatedReports([existingReport]);
                if (task.is_team_task) {
                    preserveBrigadeDraft({ taskId, values, expectedDraft });
                }
                throw Object.assign(
                    new Error(
                        'Отчёт уже отправлен и недоступен для редактирования.'
                    ),
                    { code: 'REPORT_READ_ONLY' }
                );
            }
            const {
                reportPayload,
                reportPdfActPayload,
                reportCommentPayload,
                upsertRequest,
            } = await prepareReportSubmission({
                taskId,
                values,
                existingReport,
                photoMetadata,
                clientActId,
                buildReportSignaturesPayload,
            });
            let submittedDraft = expectedDraft ?? {
                ...values,
                ...(previousDraft?.submissionReport && {
                    submissionReport: previousDraft.submissionReport,
                }),
                reportState: REPORT_DRAFT_STATE.PENDING,
                serverReportSource: previousDraft?.serverReportSource,
                requiresManualSubmit: false,
            };
            if (!expectedDraft) {
                setDraft({ draftId, values: submittedDraft });
            }

            const trackSubmission = (report) => {
                if (!task.is_team_task) return;
                const nextDraft = {
                    ...submittedDraft,
                    submissionReport: {
                        id: report.id,
                        updatedAt: report.updated_at,
                    },
                };
                if (
                    areObjectsEqual(
                        submittedDraft,
                        useReportDraftStore.getState().getDraft(draftId)
                    )
                ) {
                    setDraft({ draftId, values: nextDraft });
                }
                submittedDraft = nextDraft;
            };

            try {
                let { reportId, reportResponse } = await uploadReportSubmission(
                    {
                        taskId,
                        isTeamTask: task.is_team_task,
                        values,
                        photoMetadata,
                        removedPhotoIds,
                        upsertRequest,
                        reportPdfActPayload,
                        reportCommentPayload,
                        trackSubmission,
                    }
                );

                const submissionFinalization = {
                    reportId,
                    taskId,
                    clientReportId:
                        reportResponse.client_report_id ??
                        reportPayload.client_report_id,
                };
                const nextDraft = { ...submittedDraft, submissionFinalization };
                if (
                    areObjectsEqual(
                        submittedDraft,
                        useReportDraftStore.getState().getDraft(draftId)
                    )
                ) {
                    setDraft({ draftId, values: nextDraft });
                }
                submittedDraft = nextDraft;
                reportResponse = await finalizeReportSubmission(
                    submissionFinalization
                );

                return {
                    actRecord,
                    reportId,
                    reportResponse,
                    operation: upsertRequest.operation,
                    submittedDraft,
                };
            } catch (error) {
                error.isTeamTask = task.is_team_task;
                error.submittedDraft = submittedDraft;
                throw error;
            }
        },
        onSuccess: async (_data, variables) => {
            if (_data.skipped || _data.offline) return;
            clearTaskAct(variables.taskId, _data.actRecord);
            const store = useReportDraftStore.getState();
            const draftId = String(variables.taskId);
            if (
                !variables.expectedDraft &&
                _data.submittedDraft &&
                areObjectsEqual(_data.submittedDraft, store.getDraft(draftId))
            ) {
                store.clearDraft(draftId);
            }
            setUpdatedReports([_data.reportResponse]);
            queryClient.setQueryData(
                ['report', _data.reportId],
                _data.reportResponse
            );
            queryClient.setQueryData(
                ['report', 'task', Number(variables.taskId)],
                _data.reportResponse
            );
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['reports'] }),
                queryClient.invalidateQueries({
                    queryKey: ['task', Number(variables.taskId)],
                }),
                queryClient.invalidateQueries({ queryKey: ['tasks'] }),
            ]);
        },
        onError: async (error, variables, previousDraft) => {
            const task = getTasks()?.find(
                (item) => Number(item.id) === Number(variables.taskId)
            );
            if (
                (task?.is_team_task || error.isTeamTask) &&
                error.response?.status === 409
            ) {
                preserveBrigadeDraft({
                    taskId: variables.taskId,
                    values: variables.values,
                    expectedDraft: error.submittedDraft ?? previousDraft,
                });
                try {
                    const report = await getReportByTaskId(variables.taskId);
                    if (report) setUpdatedReports([report]);
                } catch {
                    return;
                }
                return;
            }
            const draftId = String(variables.taskId);
            const currentDraft = useReportDraftStore
                .getState()
                .getDraft(draftId);
            if (
                error.code === 'REPORT_READ_ONLY' &&
                currentDraft?.reportState !== REPORT_DRAFT_STATE.PENDING
            )
                return;
            if (
                !areObjectsEqual(
                    error.submittedDraft ?? previousDraft,
                    currentDraft
                )
            )
                return;
            if (isOnline) {
                setDraft({
                    draftId,
                    values: {
                        ...variables.values,
                        ...(previousDraft?.submissionReport && {
                            submissionReport: previousDraft.submissionReport,
                        }),
                        ...error.submittedDraft,
                        reportState: variables.expectedDraft
                            ? REPORT_DRAFT_STATE.PENDING
                            : REPORT_DRAFT_STATE.ERROR,
                    },
                });
            }
        },
    });

    const submitTaskReport = useCallback(
        ({ taskId, values, expectedDraft }) =>
            startReportOperation(queryClient, taskId, () =>
                mutateAsync({ taskId, values, expectedDraft })
            ),
        [queryClient, mutateAsync]
    );

    return {
        submitTaskReport,
        error: isChecked && isOnline && error,
        isPending,
    };
};

export default useSubmitReport;
