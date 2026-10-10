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
import useReportsStore from '@/features/reports/store/useReportsStore';
import { buildReportUpsertRequest } from '@/features/reports/lib/reportUpsert';
import {
    REPORT_OPERATION_KEY,
    startReportOperation,
} from '@/features/reports/lib/reportOperation';
import { createClientId } from '@/features/reports/lib/createClientReportId';
import { prepareReportPhotoMetadata } from '@/features/reports/lib/reportPhotoMetadata';
import { retryReportImageUpload } from '@/features/reports/lib/retryReportImageUpload';
import useStorePictures from '@/shared/store/useStorePictures';
import useTasksStore from '@/features/tasks/store/useTasksStore';
import { getTaskById } from '@/features/tasks/api/getTaskByIdApi';
import { isTaskReportReadOnly } from '@/features/tasks/lib/taskReportVisibility';

const useSubmitReport = () => {
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
                    values: { ...offlineValues, reportState: 'pending' },
                });
                return { offline: true };
            }
            const task =
                useTasksStore
                    .getState()
                    .tasks?.find(
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
                throw Object.assign(
                    new Error(
                        'Отчёт уже отправлен и недоступен для редактирования.'
                    ),
                    { code: 'REPORT_READ_ONLY' }
                );
            }
            const reportPayload = buildReportPayload(
                { ...values, taskId },
                { includeEmptyOptionalFields: Boolean(existingReport) }
            );
            const reportCommentPayload = buildReportCommentPayload(values);
            const upsertRequest = buildReportUpsertRequest({
                reportPayload,
                existingReport,
                resubmitRejectedReport: true,
            });
            let submittedDraft = expectedDraft ?? {
                ...values,
                ...(previousDraft?.submissionReport && {
                    submissionReport: previousDraft.submissionReport,
                }),
                reportState: 'pending',
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
                const reportPdfActPayload = buildReportPdfActPayload(
                    values,
                    serverActId
                );
                if (actPdfUri && reportPdfActPayload) {
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

                return {
                    reportId,
                    reportResponse,
                    operation: upsertRequest.operation,
                    submittedDraft:
                        !expectedDraft || task.is_team_task
                            ? submittedDraft
                            : null,
                };
            } catch (error) {
                error.submittedDraft = submittedDraft;
                throw error;
            }
        },
        onSuccess: async (_data, variables) => {
            if (_data.skipped || _data.offline) return;
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
        onError: (error, variables, previousDraft) => {
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
                        reportState: 'error',
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
