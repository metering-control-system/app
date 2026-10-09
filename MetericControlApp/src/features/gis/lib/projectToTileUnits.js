import polygon from '@/features/gis/constants/tiles.json';
import { WebMercator } from '@/features/gis/lib/webMercator';

export const projectToTileUnits = ({ latitude, longitude }) => {
    const { x, y } = WebMercator.translateFromDegreesToMeters({
        lat: latitude,
        lng: longitude,
    });

    if (isNaN(x) || isNaN(y)) {
        return null;
    }

    return {
        x: (x - polygon.startX) / polygon.normalizeCoefficient,
        y: (polygon.startY - y) / polygon.normalizeCoefficient,
    };
};
