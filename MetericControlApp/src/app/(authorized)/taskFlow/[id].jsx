import { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import useTaskById from '@/features/tasks/hooks/useTaskById';
import ScreenLoader from '@/shared/components/loader/screenLoader';

const TaskRouter = () => {
    const { id, reference } = useLocalSearchParams();
    const { task, isPending } = useTaskById(+id);
    const router = useRouter();

    useEffect(() => {
        if (!task) return;
        const basePath =
            task.status === 'IN_PROGRESS'
                ? `/(authorized)/taskFlow/reportSubmit/${id}`
                : `/(authorized)/taskFlow/taskDetails/${id}`;

        router.replace(
            reference ? { pathname: basePath, params: { reference } } : basePath
        );
    }, [task, id, router, reference]);

    return <ScreenLoader loading={isPending} />;
};

export default TaskRouter;
