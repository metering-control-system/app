import { projectToTileUnits } from '@/features/gis/lib/projectToTileUnits';

export const findContainingTile = (districts, x, y, size) => {
    for (const district in districts) {
        const tiles = Object.entries(districts[district]).filter(
            ([key]) => key !== 'center'
        );
        const tile = tiles.find(
            ([, t]) =>
                x >= t.x && x <= t.x + size && y >= t.y && y <= t.y + size
        )?.[1];

        if (tile) {
            return { x: tile.x, y: tile.y, district };
        }
    }

    return null;
};

export const arrangeTasksByDistrict = ({ tasks, polygon }) => {
    const tasksByDistrict = {};
    const districts = polygon.coordinates;
    const { size } = polygon;

    if (!Array.isArray(tasks)) {
        return;
    }

    for (const task of tasks) {
        let tileAddress;
        let tileDistrict;
        try {
            const coordinates = task.coordinates;
            if (
                coordinates?.latitude !== undefined &&
                coordinates?.longitude !== undefined
            ) {
                const point = projectToTileUnits(coordinates);

                if (!point) {
                    continue;
                }

                const found = findContainingTile(
                    districts,
                    point.x,
                    point.y,
                    size
                );
                if (found) {
                    tileAddress = { x: found.x, y: found.y };
                    tileDistrict = found.district;
                }
            }
        } catch (error) {
            console.error(error.message);
        }

        const district =
            task.address?.district && districts[task.address.district]
                ? task.address.district
                : tileDistrict;

        if (!district) {
            continue;
        }

        const taskByTile = tileAddress ? { ...task, tileAddress } : task;

        tasksByDistrict[district] = tasksByDistrict[district]
            ? { ...tasksByDistrict[district], [task.id]: taskByTile }
            : { [task.id]: taskByTile };
    }
    return tasksByDistrict;
};
