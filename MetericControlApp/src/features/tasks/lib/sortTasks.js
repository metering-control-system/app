import { priorityOrder } from '@/features/tasks/constants/taskPriority';
import {
    getAddressKey,
    getStreetKey,
    getLocalityKey,
} from '@/features/tasks/lib/addressHelpers';

const getPriorityOrder = (task) =>
    priorityOrder[task.manual_priority] ?? priorityOrder.NOT_SPECIFIED;

const getGroupPriority = (group) => getPriorityOrder(group[0]);

export const sortByUpdatedTime = (tasks) => {
    if (Array.isArray(tasks)) {
        return tasks.sort((a, b) => {
            const timeA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
            const timeB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
            return timeB - timeA;
        });
    }
};

export const sortByStatus = (tasks, option) => {
    if (Array.isArray(tasks)) {
        return tasks.sort((a, b) => {
            if (a.status === option && b.status === option) {
                return sortByUpdatedTime([a, b]);
            } else if (a.status === option) {
                return 1;
            } else if (b.status === option) {
                return -1;
            }
            return sortByUpdatedTime([a, b]);
        });
    }
};

export const sortByPriority = (tasks) => {
    if (Array.isArray(tasks)) {
        return tasks.sort((a, b) => {
            const aOrder = getPriorityOrder(a);
            const bOrder = getPriorityOrder(b);

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

    const groups = [...groupMap.values()];

    groups.sort((groupA, groupB) => {
        const priorityDiff =
            getGroupPriority(groupA) - getGroupPriority(groupB);
        if (priorityDiff !== 0) return priorityDiff;

        const streetA = getStreetKey(groupA[0]);
        const streetB = getStreetKey(groupB[0]);
        if (streetA < streetB) return -1;
        if (streetA > streetB) return 1;

        const localityA = getLocalityKey(groupA[0]);
        const localityB = getLocalityKey(groupB[0]);
        if (localityA < localityB) return -1;
        if (localityA > localityB) return 1;

        return 0;
    });

    return groups.flat();
};
