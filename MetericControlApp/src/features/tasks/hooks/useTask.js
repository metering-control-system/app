import { skipToken, useQuery } from '@tanstack/react-query';

import { getTaskById } from '@/features/tasks/api/getTasksApi';

const useTask = (id) => {
    const { data: task } = useQuery({
        queryKey: ['tasks', id],
        queryFn: id ? getTaskById : skipToken,
    });

    return task;
};

export default useTask;
