import { WebMercator } from '@/features/gis/lib/webMercator';

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
    const { startX, startY, size, normalizeCoefficient } = polygon;

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
                let { x, y } = WebMercator.translateFromDegreesToMeters({
                    lat: coordinates.latitude,
                    lng: coordinates.longitude,
                });

                if (isNaN(x) || isNaN(y)) {
                    continue;
                }

                x = (x - startX) / normalizeCoefficient;
                y = (startY - y) / normalizeCoefficient;

                const found = findContainingTile(districts, x, y, size);
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
