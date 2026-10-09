const mapImportance = { NOT_SPECIFIED: 0, LOW: 0.3, MEDIUM: 0.7, HIGH: 1 };

export const calculateImportance = (tasks = []) => {
    const length = tasks?.length || 1;
    let importance = 0;
    for (const task of tasks) {
        importance += mapImportance[task.manual_priority] ?? 0;
    }

    const averageImportance = importance / length;
    const countBonus = 0.03 * Math.min(1, Math.log10(length));

    return Math.min(1, averageImportance + countBonus);
};
