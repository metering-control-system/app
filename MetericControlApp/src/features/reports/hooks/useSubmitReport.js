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
import { buildReportUpsertRequest } from '@/features/reports/lib/reportUpsert';
import { enqueueReportSubmission } from '@/features/reports/lib/reportSubmissionQueue';
import { createClientId } from '@/features/reports/lib/createClientReportId';
import { prepareReportSubmissionValues } from '@/features/reports/lib/reportPhotoMetadata';
import { retryReportImageUpload } from '@/features/reports/lib/retryReportImageUpload';

const useSubmitReport = () => {
    const queryClient = useQueryClient();
    const { isOnline, isChecked } = useNetwork();
    const setDraft = useReportDraftStore((state) => state.setDraft);
    const setUpdatedReports = useReportsStore(
        (state) => state.setUpdatedReports
    );

    const { mutateAsync, error, isPending } = useMutation({
        mutationFn: ({ taskId, values }) =>
            enqueueReportSubmission(taskId, async () => {
                const existingReport = await getReportByTaskId(taskId);
                const reportPayload = buildReportPayload(
                    { ...values, taskId },
                    { includeEmptyOptionalFields: Boolean(existingReport) }
                );
                const reportCommentPayload = buildReportCommentPayload(values);
                const reportImagesPayload = buildReportImagesPayload(
                    values,
                    existingReport?.images
                );
                const removedImageIds = getRemovedReportImageIds(
                    values,
                    existingReport?.images
                );
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
        const persistedValues = useReportDraftStore
            .getState()
            .getDraft(draftId);
        const preparedValues = prepareReportSubmissionValues({
            values,
            persistedValues,
            createId: createClientId,
        });

        setDraft({ draftId, values: preparedValues });

        if (!isOnline && isChecked) {
            setDraft({
                draftId,
                values: { ...preparedValues, reportState: 'pending' },
            });
            return { offline: true };
        }
        return await mutateAsync({ taskId, values: preparedValues });
    };

    return {
        submitTaskReport,
        error: isChecked && isOnline && error,
        isPending,
    };
};

export default useSubmitReport;
