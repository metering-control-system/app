export const arrangeTasksByTile = ({ tasksByDistrict, tasks }) => {
    const tasksByTile = {};

    if (!Array.isArray(tasks)) {
        return {};
    }

    for (const task of tasks) {
        for (const district in tasksByDistrict) {
            const entry = tasksByDistrict[district]?.[task.id];
            if (!entry?.tileAddress) {
                continue;
            }
            const tileKey = `${entry.tileAddress.x}:${entry.tileAddress.y}`;
            tasksByTile[tileKey] = tasksByTile[tileKey]
                ? [...tasksByTile[tileKey], task]
                : [task];
            break;
        }
    }

    return tasksByTile;
};
