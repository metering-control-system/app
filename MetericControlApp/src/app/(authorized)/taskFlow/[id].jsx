import { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import useTaskById from '@/features/tasks/hooks/useTaskById';
import ScreenLoader from '@/shared/components/loader/screenLoader';

const TaskRouter = () => {
    const { id } = useLocalSearchParams();
    const { task, isPending } = useTaskById(+id);
    const router = useRouter();

    useEffect(() => {
        if (!task) return;
        const route =
            task.status === 'IN_PROGRESS'
                ? `/(authorized)/taskFlow/reportSubmit/${id}`
                : `/(authorized)/taskFlow/taskDetails/${id}`;

        router.replace(route);
    }, [task, id, router]);

    return <ScreenLoader loading={isPending} />;
};

export default TaskRouter;
