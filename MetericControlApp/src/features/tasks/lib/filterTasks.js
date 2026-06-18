export const filterByStatus = (statuses, tasks) => {
    if (!statuses?.length) {
        return tasks;
    }

    return tasks?.filter((curr) => statuses.includes(curr.status));
};

export const filterByPriority = (priorities, tasks) => {
    if (!priorities?.length) {
        return tasks;
    }

    return tasks?.filter((curr) => priorities.includes(curr.manual_priority));
};

export const filterBy = (statuses, tasks) => {
    let filtered = [...(tasks ?? [])];
    filtered = filterByPriority(statuses.priority, filtered);
    filtered = filterByStatus(statuses.statuses, filtered);

    return filtered;
};
