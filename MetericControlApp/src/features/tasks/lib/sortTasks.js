import priorityOrder from '@/features/tasks/constants/taskPriority';

const getAddressKey = (task) =>
    [task.address?.locality, task.address?.street, task.address?.house]
        .filter(Boolean)
        .join('|');

const getPriorityOrder = (task) =>
    priorityOrder[task.manual_priority] ?? priorityOrder.NOT_SPECIFIED;

export const sortTasks = (tasks) => {
    const groupMap = new Map();

    for (const task of tasks) {
        const key = getAddressKey(task);
        if (!groupMap.has(key)) {
            groupMap.set(key, []);
        }
        groupMap.get(key).push(task);
    }

    for (const group of groupMap.values()) {
        group.sort((a, b) => {
            const aInProgress = a.status === 'IN_PROGRESS';
            const bInProgress = b.status === 'IN_PROGRESS';

            if (aInProgress && bInProgress) {
                const timeA = a.updated_at
                    ? new Date(a.updated_at).getTime()
                    : 0;
                const timeB = b.updated_at
                    ? new Date(b.updated_at).getTime()
                    : 0;
                return timeB - timeA;
            }
            if (aInProgress) return -1;
            if (bInProgress) return 1;

            return getPriorityOrder(a) - getPriorityOrder(b);
        });
    }

    const sortedGroups = [...groupMap.values()].sort(
        (groupA, groupB) =>
            getPriorityOrder(groupA[0]) - getPriorityOrder(groupB[0])
    );

    return sortedGroups.flat();
};
