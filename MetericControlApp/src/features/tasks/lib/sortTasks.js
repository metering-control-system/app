import { priorityOrder } from '@/features/tasks/constants/taskPriority';
import {
    getAddressKey,
    getStreetKey,
    getLocalityKey,
} from '@/features/tasks/lib/addressHelpers';

const getPriorityOrder = (task) =>
    priorityOrder[task.manual_priority] ?? priorityOrder.NOT_SPECIFIED;

const getGroupPriority = (group) => getPriorityOrder(group[0]);

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
