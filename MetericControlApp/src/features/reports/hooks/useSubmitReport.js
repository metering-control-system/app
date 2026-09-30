import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    addReportComment,
    createReport,
    deleteReportImage,
    getReportByTaskId,
    updateReport,
    uploadReportImage,
} from '@/features/reports/api/submitReportApi';
import {
    buildReportCommentPayload,
    buildReportImagesPayload,
    buildReportPayload,
    getRemovedReportImageIds,
} from '@/features/reports/lib/buildReportPayload';
import useNetwork from '@/shared/hooks/offline/useNetwork';
import useReportDraftStore from '@/features/reports/store/useReportDraftStore';
import useReportsStore from '@/features/reports/store/useReportsStore';
import {
    buildReportUpsertRequest,
    resolveReportForSubmission,
} from '@/features/reports/lib/reportUpsert';
import {
    REPORT_OPERATION_KEY,
    startReportOperation,
} from '@/features/reports/lib/reportOperation';
import { createClientId } from '@/features/reports/lib/createClientReportId';
import { prepareReportPhotoMetadata } from '@/features/reports/lib/reportPhotoMetadata';
import { retryReportImageUpload } from '@/features/reports/lib/retryReportImageUpload';
import useStorePictures from '@/shared/store/useStorePictures';

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
        mutationFn: async ({ taskId, values, expectedDraft }) => {
            const draftId = String(taskId);
            if (
                expectedDraft &&
                useReportDraftStore.getState().getDraft(draftId) !==
                    expectedDraft
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
            if (!isOnline && isChecked) {
                setDraft({
                    draftId,
                    values: { ...values, reportState: 'pending' },
                });
                return { offline: true };
            }
            const existingReport = await resolveReportForSubmission({
                taskId,
                cachedReport: queryClient.getQueryData([
                    'report',
                    'task',
                    Number(taskId),
                ]),
                lookupReport: getReportByTaskId,
            });
            const reportPayload = buildReportPayload(
                { ...values, taskId },
                { includeEmptyOptionalFields: Boolean(existingReport) }
            );
            const reportCommentPayload = buildReportCommentPayload(values);
            const upsertRequest = buildReportUpsertRequest({
                reportPayload,
                existingReport,
            });

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

            setUpdatedReports([reportResponse]);

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
                setUpdatedReports([reportResponse]);
            }

            for (const clientImageId of removedImageIds) {
                await deleteReportImage(reportId, clientImageId);
                reportResponse = {
                    ...reportResponse,
                    images: (reportResponse.images ?? []).filter(
                        (image) => image['client_image_id'] !== clientImageId
                    ),
                };
                setUpdatedReports([reportResponse]);
            }

            if (reportCommentPayload) {
                await addReportComment(reportId, reportCommentPayload);
            }

            return {
                reportId,
                reportResponse,
                operation: upsertRequest.operation,
            };
        },
        onSuccess: async (_data, variables) => {
            if (_data.skipped || _data.offline) return;
            if (
                variables.expectedDraft &&
                useReportDraftStore
                    .getState()
                    .getDraft(String(variables.taskId)) ===
                    variables.expectedDraft
            ) {
                useReportDraftStore
                    .getState()
                    .clearDraft(String(variables.taskId));
            }
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
        onError: (_data, variables) => {
            if (isOnline) {
                setDraft({
                    draftId: String(variables.taskId),
                    values: { ...variables.values, reportState: 'error' },
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
