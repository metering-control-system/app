import { WebMercator } from '@/features/gis/lib/webMercator';
import { getCoordinates } from '@/features/gis/api/getCoordinatesApi';
import { NORMALIZE_COEFF } from '@/features/gis/constants/mapScale';

const findContainingTile = (districts, x, y, size) => {
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

export const arrangeTasksByDistrict = async ({ tasks, polygon }) => {
    const districtsTasks = {};
    const districts = polygon.coordinates;
    const { startX, startY, size } = polygon;

    for (const task of tasks) {
        const geocoderAddress = [
            task.address?.locality,
            task.address?.street,
            task.address?.house,
        ]
            .filter(
                (value) => value !== null && value !== undefined && value !== ''
            )
            .join(', ');

        let tileAddress;
        let tileDistrict;
        try {
            const coordinates = await getCoordinates(geocoderAddress);
            if (coordinates?.lat && coordinates?.lng) {
                let { x, y } = WebMercator.translateFromDegreesToMeters({
                    lat: coordinates.lat,
                    lng: coordinates.lng,
                });

                x = (x - startX) / NORMALIZE_COEFF;
                y = (startY - y) / NORMALIZE_COEFF;

                const found = findContainingTile(districts, x, y, size);
                if (found) {
                    tileAddress = { x: found.x, y: found.y };
                    tileDistrict = found.district;
                }
            }
        } catch {
            /* empty */
        }

        const district =
            task.address?.district && districts[task.address.district]
                ? task.address.district
                : tileDistrict;

        if (!district) {
            continue;
        }

        const taskWithTile = tileAddress ? { ...task, tileAddress } : task;

        districtsTasks[district] = districtsTasks[district]
            ? { ...districtsTasks[district], [task.id]: taskWithTile }
            : { [task.id]: taskWithTile };
    }

    return districtsTasks;
};

export const arrangeTasksByTile = ({ tasksByDistrict, tasks }) => {
    const tasksByTile = {};

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
