import { preserveBrigadeDraft } from '@/features/reports/lib/preserveBrigadeDraft';
import { validateReportValues } from '@/features/reports/lib/validateReportValues';
import { validateReportUploadFiles } from '@/features/reports/lib/validateReportUploadFiles';
import {
    finalizeReportSubmission,
    isConfirmedReportSubmission,
} from '@/features/reports/lib/finalizeReportSubmission';
import { validateReportAct } from '@/features/reports/lib/validateReportAct';
import { savePdfToDocuments } from '@/features/reports/lib/savePdfToDocuments';
import { useCallback } from 'react';
import { areReportDraftsEqual } from '@/features/reports/lib/areReportDraftsEqual';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    addReportComment,
    createReport,
    deleteReportImage,
    getReportByTaskId,
    updateReport,
    updateReportPdfAct,
    uploadReportImage,
    uploadReportPdfAct,
} from '@/features/reports/api/submitReportApi';
import {
    buildReportCommentPayload,
    buildReportImagesPayload,
    buildReportPayload,
    buildReportPdfActPayload,
    getRemovedReportImageIds,
} from '@/features/reports/lib/buildReportPayload';
import useNetwork from '@/shared/hooks/offline/useNetwork';
import useReportDraftStore from '@/features/reports/store/useReportDraftStore';
import useReportActStore from '@/features/reports/store/useReportActStore';
import useReportsStore from '@/features/reports/store/useReportsStore';
import {
    buildReportUpsertRequest,
    selectReportForTask,
} from '@/features/reports/lib/reportUpsert';
import {
    REPORT_OPERATION_KEY,
    startReportOperation,
} from '@/features/reports/lib/reportOperation';
import { createClientId } from '@/features/reports/lib/createClientReportId';
import { prepareReportPhotoMetadata } from '@/features/reports/lib/reportPhotoMetadata';
import { retryReportImageUpload } from '@/features/reports/lib/retryReportImageUpload';
import { buildReportSignaturesPayload } from '@/features/reports/lib/buildReportSignaturesPayload';
import useStorePictures from '@/shared/store/useStorePictures';

const useSubmitReport = ({ getTasks, getTaskById, isTaskReportReadOnly }) => {
    const queryClient = useQueryClient();
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
                !areReportDraftsEqual(
                    expectedDraft,
                    useReportDraftStore.getState().getDraft(draftId)
                )
            ) {
                return { skipped: true };
            }
            if (previousDraft?.submissionFinalization && isOnline) {
                const recoveryActRecord =
                    useReportActStore.getState().actMetadataByTask[draftId];
                let report;
                try {
                    report = await getReportByTaskId(taskId);
                } catch (error) {
                    error.submittedDraft = previousDraft;
                    throw error;
                }
                if (
                    isConfirmedReportSubmission(report, {
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
                !areReportDraftsEqual(
                    expectedDraft,
                    useReportDraftStore.getState().getDraft(draftId)
                )
            ) {
                return { skipped: true };
            }
            const actRecord =
                useReportActStore.getState().actMetadataByTask[draftId];
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
            if (!isOnline && isChecked) {
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
                        ? buildReportPdfActPayload(values)
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
                setDraft({
                    draftId,
                    values: {
                        ...offlineValues,
                        reportState: 'pending',
                        requiresManualSubmit: false,
                    },
                });
                return { offline: true };
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
            const reportPdfActPayload = !isRefused
                ? buildReportPdfActPayload(
                      values,
                      existingReport?.act?.client_act_id
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
                    signaturePayload: buildReportSignaturesPayload(
                        values.actPdf
                    ),
                }
            );
            const reportCommentPayload = buildReportCommentPayload(values);
            const upsertRequest = buildReportUpsertRequest({
                reportPayload,
                existingReport,
                resubmitRejectedReport: false,
            });
            let submittedDraft = expectedDraft ?? {
                ...values,
                ...(previousDraft?.submissionReport && {
                    submissionReport: previousDraft.submissionReport,
                }),
                reportState: 'pending',
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
                    areReportDraftsEqual(
                        submittedDraft,
                        useReportDraftStore.getState().getDraft(draftId)
                    )
                ) {
                    setDraft({ draftId, values: nextDraft });
                }
                submittedDraft = nextDraft;
            };

            try {
                let reportResponse =
                    upsertRequest.operation === 'update'
                        ? await updateReport(
                              upsertRequest.reportId,
                              upsertRequest.payload
                          )
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
                            (image) =>
                                image['client_image_id'] !== clientImageId
                        ),
                    };
                    trackSubmission(reportResponse);
                }

                if (task.is_team_task && removedImageIds.length) {
                    const latestReport = await getReportByTaskId(taskId);
                    if (latestReport?.id === reportId) {
                        reportResponse = latestReport;
                        trackSubmission(reportResponse);
                    }
                }

                if (reportCommentPayload) {
                    await addReportComment(reportId, reportCommentPayload);
                }

                const submissionFinalization = {
                    reportId,
                    taskId,
                    clientReportId:
                        reportResponse.client_report_id ??
                        reportPayload.client_report_id,
                };
                const nextDraft = { ...submittedDraft, submissionFinalization };
                if (
                    areReportDraftsEqual(
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
            useReportActStore
                .getState()
                .clearTaskAct(variables.taskId, _data.actRecord);
            const store = useReportDraftStore.getState();
            const draftId = String(variables.taskId);
            if (
                !variables.expectedDraft &&
                _data.submittedDraft &&
                areReportDraftsEqual(
                    _data.submittedDraft,
                    store.getDraft(draftId)
                )
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
                currentDraft?.reportState !== 'pending'
            )
                return;
            if (
                !areReportDraftsEqual(
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
                            ? 'pending'
                            : 'error',
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
