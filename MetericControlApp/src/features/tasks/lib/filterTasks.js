export const filterBy = (filters, tasks) =>
    (tasks ?? []).filter(
        (task) =>
            (!filters.priority?.length ||
                filters.priority.includes(task.manual_priority)) &&
            (!filters.statuses?.length ||
                filters.statuses.includes(task.status))
    );
