import { isTaskReportReadOnly } from '@/features/tasks/lib/taskReportVisibility';
import { useEffect } from 'react';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import useTaskById from '@/features/tasks/hooks/useTaskById';
import ScreenLoader from '@/shared/components/loader/screenLoader';
import useTaskReport from '@/features/reports/hooks/useTaskReport';
import TaskReportLookupError from '@/features/reports/components/taskReportLookupError';

const TaskRouter = () => {
    const { id, reference } = useLocalSearchParams();
    const { task, isPending } = useTaskById(+id);
    const router = useRouter();
    const {
        report,
        isReadOnly,
        isQueued,
        isPending: isReportPending,
        error,
        refetch,
    } = useTaskReport(task, isTaskReportReadOnly);

    useEffect(() => {
        if (!task || isReportPending || error || (isReadOnly && !isQueued))
            return;
        const basePath =
            isQueued ||
            task.status === 'IN_PROGRESS' ||
            report?.status === 'REJECTED'
                ? `/(authorized)/taskFlow/reportSubmit/${id}`
                : `/(authorized)/taskFlow/taskDetails/${id}`;

        router.replace(
            reference ? { pathname: basePath, params: { reference } } : basePath
        );
    }, [
        task,
        id,
        router,
        reference,
        isReportPending,
        error,
        isReadOnly,
        isQueued,
        report?.status,
    ]);

    if (error)
        return (
            <TaskReportLookupError
                onRetry={refetch}
                onClose={() => router.replace('/(authorized)/(tabs)/tasks')}
            />
        );
    if (isReadOnly && !isQueued && !isReportPending) {
        return <Redirect href={`/(authorized)/reportDetails/${report.id}`} />;
    }

    return <ScreenLoader loading={isPending || isReportPending} />;
};

export default TaskRouter;
