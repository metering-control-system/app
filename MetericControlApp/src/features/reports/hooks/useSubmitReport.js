import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    addReportComment,
    createReport,
    deleteReportImage,
    getReportByTaskId,
    updateReport,
    uploadReportImage,
    uploadReportPdfAct,
} from '@/features/reports/api/submitReportApi';
import {
    buildReportCommentPayload,
    buildReportImagesPayload,
    buildReportPayload,
    getRemovedReportImageIds,
    buildReportPdfActPayload,
} from '@/features/reports/lib/buildReportPayload';
import useNetwork from '@/shared/hooks/offline/useNetwork';
import useReportDraftStore from '@/features/reports/store/useReportDraftStore';
import useReportsStore from '@/features/reports/store/useReportsStore';
import {
    buildReportUpsertRequest,
    resolveReportForSubmission,
} from '@/features/reports/lib/reportUpsert';
import { enqueueReportSubmission } from '@/features/reports/lib/reportSubmissionQueue';
import { createClientId } from '@/features/reports/lib/createClientReportId';
import { prepareReportPhotoMetadata } from '@/features/reports/lib/reportPhotoMetadata';
import { retryReportImageUpload } from '@/features/reports/lib/retryReportImageUpload';
import useStorePictures from '@/shared/store/useStorePictures';
import { savePdfToDocuments } from '@/features/reports/lib/savePdfToDocuments';

const useSubmitReport = () => {
    const queryClient = useQueryClient();
    const { isOnline, isChecked } = useNetwork();
    const setDraft = useReportDraftStore((state) => state.setDraft);
    const setUpdatedReports = useReportsStore(
        (state) => state.setUpdatedReports
    );

    const { mutateAsync, error, isPending } = useMutation({
        mutationFn: ({ taskId, values, photoMetadata, removedPhotoIds }) =>
            enqueueReportSubmission(taskId, async () => {
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
                const reportPdfActPayload = buildReportPdfActPayload(values);


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
                            (image) =>
                                image['client_image_id'] !== clientImageId
                        ),
                    };
                    setUpdatedReports([reportResponse]);
                }

                if (reportCommentPayload) {
                    await addReportComment(reportId, reportCommentPayload);
                }

                if (reportPdfActPayload) {
                    await uploadReportPdfAct(reportId, reportPdfActPayload);
                }

                return {
                    reportId,
                    reportResponse,
                    operation: upsertRequest.operation,
                };
            }),
        onSuccess: async (_data, variables) => {
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

    const submitTaskReport = async ({ taskId, values }) => {
        const draftId = String(taskId);
        const picturesState = useStorePictures.getState();
        const photoMetadata = prepareReportPhotoMetadata({
            photos: values.photos,
            photoMetadata: picturesState.photoMetadata.report?.[draftId] ?? {},
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
            const { actPdfUri } = values;
            const newUri = await savePdfToDocuments({
                fileName: taskId.toString(),
                sourceUri: actPdfUri,
            });
            setDraft({
                draftId,
                values: {
                    ...values,
                    actPdf: { ...values.actPdf, uri: newUri },
                    reportState: 'pending',
                },
            });
            return { offline: true };
        }
        return await mutateAsync({
            taskId,
            values,
            photoMetadata,
            removedPhotoIds,
        });
    };

    return {
        submitTaskReport,
        error: isChecked && isOnline && error,
        isPending,
    };
};

export default useSubmitReport;
