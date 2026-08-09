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
}
