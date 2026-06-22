export const mergeTasks = (previousTasks, incomingTasks) => {
    const items = previousTasks ?? [];
    const map = new Map(items.map((task) => [task.id, task]));

    if (!incomingTasks) {
        return [];
    }

    for (const task of incomingTasks) {
        if (task) {
            map.set(task.id, task);
        }
    }

    return Array.from(map.values());
};
