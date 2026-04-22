export const mergeTasks = (previousTasks, incomingTasks) => {
    const map = new Map(previousTasks.map((task) => [task.id, task]));

    for (const task of incomingTasks) {
        if (task) {
            map.set(task.id, task);
        }
    }

    return Array.from(map.values());
};
