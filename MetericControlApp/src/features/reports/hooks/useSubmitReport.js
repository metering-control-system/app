import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/shared/api/queryClient';
import {
    createTaskReport,
    submitReport,
    uploadReportImage,
} from '@/features/reports/api/submitReportApi';
import {
    buildReportImagesPayload,
    buildReportPayload,
} from '@/features/reports/lib/buildReportPayload';

const useSubmitReport = () => {
    const { mutateAsync, error, isPending } = useMutation({
        mutationFn: async ({ taskId, values }) => {
            const reportPayload = buildReportPayload(values);
            const reportImagesPayload = buildReportImagesPayload(values);

            const reportResponse = await createTaskReport(
                taskId,
                reportPayload
            );
            const reportId = reportResponse?.id ?? reportResponse?.reportId;

            if (!reportId) {
                throw new Error('Не удалось получить идентификатор отчета');
            }

            for (const imagePayload of reportImagesPayload) {
                await uploadReportImage(reportId, imagePayload);
            }

            const submittedReport = await submitReport(reportId);

            return { reportId, reportResponse, submittedReport };
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
    });

    const submitTaskReport = ({ taskId, values }) => {
        return mutateAsync({ taskId, values });
    };

    return { submitTaskReport, error, isPending };
};

export default useSubmitReport;
