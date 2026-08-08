import { NORMALIZE_COEFF } from '@/features/gis/constants/mapScale';

const R = 6378137;

export class WebMercator {
    static translateFromDegreesToMeters = ({ lat, lng }) => {
        const latRad = (lat * Math.PI) / 180;
        const lngRad = (lng * Math.PI) / 180;

        return {
            x: R * lngRad,
            y: R * Math.log(Math.tan(Math.PI / 4 + latRad / 2)),
        };
    };

    static convertToLocal = (coordinates, point) => {
        const xs = coordinates.map((p) => p.x);
        const ys = coordinates.map((p) => p.y);

        const minX = Math.min(...xs);

        const maxY = Math.max(...ys);

        return {
            x: (point.x - minX) / NORMALIZE_COEFF,
            y: (maxY - point.y) / NORMALIZE_COEFF,
        };
    };
}
