import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    addReportComment,
    createReport,
    uploadReportImage,
} from '@/features/reports/api/submitReportApi';
import {
    buildReportCommentPayload,
    buildReportImagesPayload,
    buildReportPayload,
} from '@/features/reports/lib/buildReportPayload';
import useNetwork from '@/shared/hooks/offline/useNetwork';
import useReportDraftStore from '@/features/reports/store/useReportDraftStore';

const useSubmitReport = () => {
    const queryClient = useQueryClient();
    const { isOnline, isChecked } = useNetwork();
    const setDraft = useReportDraftStore((state) => state.setDraft);

    const { mutateAsync, error, isPending } = useMutation({
        mutationFn: async ({ taskId, values }) => {
            const reportPayload = buildReportPayload({ ...values, taskId });
            const reportCommentPayload = buildReportCommentPayload(values);
            const reportImagesPayload = buildReportImagesPayload(values);

            const reportResponse = await createReport(reportPayload);
            const reportId = reportResponse?.id;

            if (!reportId) {
                throw new Error('Не удалось получить идентификатор отчета');
            }

            if (reportCommentPayload) {
                await addReportComment(reportId, reportCommentPayload);
            }

            if (reportImagesPayload) {
                await uploadReportImage(reportId, reportImagesPayload);
            }

            return { reportId, reportResponse };
        },
        onSuccess: async (_data, variables) => {
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
        if (!isOnline && isChecked) {
            setDraft({
                draftId: String(taskId),
                values: { ...values, reportState: 'pending' },
            });
            return { offline: true };
        }
        return await mutateAsync({ taskId, values });
    };

    return {
        submitTaskReport,
        error: isChecked && isOnline && error,
        isPending,
    };
};

export default useSubmitReport;
