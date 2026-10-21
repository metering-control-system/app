import { TASK_STATUS } from '@/features/tasks/constants/taskStatus';
import { priorityOrder } from '@/features/tasks/constants/taskPriority';

export const sortByUpdatedTime = (tasks) => {
    if (Array.isArray(tasks)) {
        return [...tasks].sort((a, b) => {
            const timeA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
            const timeB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
            return timeB - timeA;
        });
    }
};

export const sortByStatus = (tasks, option) => {
    if (Array.isArray(tasks)) {
        return [...tasks].sort((a, b) => {
            if (a.status === option && b.status === option) {
                return sortByUpdatedTime([a, b]);
            } else if (a.status === option) {
                return -1;
            } else if (b.status === option) {
                return 1;
            }
            return sortByUpdatedTime([a, b]);
        });
    }
};

export const sortByPriority = (tasks) => {
    if (Array.isArray(tasks)) {
        return [...tasks].sort((a, b) => {
            const aOrder =
                priorityOrder[a.manual_priority] ?? priorityOrder.NOT_SPECIFIED;
            const bOrder =
                priorityOrder[b.manual_priority] ?? priorityOrder.NOT_SPECIFIED;

            return aOrder === bOrder
                ? sortByUpdatedTime([a, b])
                : aOrder - bOrder;
        });
    }
};

export const sortBy = (tasks, option) => {
    if (Array.isArray(tasks)) {
        if (option === 'PRIORITY') {
            return sortByPriority(tasks);
        } else if (option === 'UPDATED_AT') {
            return sortByUpdatedTime(tasks);
        } else {
            return sortByStatus(tasks, option);
        }
    }
};

export const sortTasks = (tasks) => {
    const groupMap = new Map();

    for (const task of tasks) {
        const key = [
            task.address?.locality,
            task.address?.street,
            task.address?.house,
        ]
            .filter(Boolean)
            .join('|');
        if (!groupMap.has(key)) {
            groupMap.set(key, []);
        }
        groupMap.get(key).push(task);
    }

    for (const group of groupMap.values()) {
        group.sort((a, b) => {
            const aInProgress = a.status === TASK_STATUS.IN_PROGRESS;
            const bInProgress = b.status === TASK_STATUS.IN_PROGRESS;

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

            return (
                (priorityOrder[a.manual_priority] ??
                    priorityOrder.NOT_SPECIFIED) -
                (priorityOrder[b.manual_priority] ??
                    priorityOrder.NOT_SPECIFIED)
            );
        });
    }

    const groups = [...groupMap.values()];

    groups.sort((groupA, groupB) => {
        const priorityDiff =
            (priorityOrder[groupA[0].manual_priority] ??
                priorityOrder.NOT_SPECIFIED) -
            (priorityOrder[groupB[0].manual_priority] ??
                priorityOrder.NOT_SPECIFIED);
        if (priorityDiff !== 0) return priorityDiff;

        const streetA = [groupA[0].address?.locality, groupA[0].address?.street]
            .filter(Boolean)
            .join('|');
        const streetB = [groupB[0].address?.locality, groupB[0].address?.street]
            .filter(Boolean)
            .join('|');
        if (streetA < streetB) return -1;
        if (streetA > streetB) return 1;

        const localityA = groupA[0].address?.locality ?? '';
        const localityB = groupB[0].address?.locality ?? '';
        if (localityA < localityB) return -1;
        if (localityA > localityB) return 1;

        return 0;
    });

    return groups.flat();
};
