export class WebMercator {
    static #R = 6378137;
    static #DEGRESS_EXTREME_LATTITUDE = 85.05;

    static translateFromDegreesToMeters = ({ lat, lng }) => {
        if (Math.abs(lat) > WebMercator.#DEGRESS_EXTREME_LATTITUDE)
            return { x: NaN, y: NaN };

        const latRad = (lat * Math.PI) / 180;
        const lngRad = (lng * Math.PI) / 180;

        return {
            x: WebMercator.#R * lngRad,
            y: WebMercator.#R * Math.log(Math.tan(Math.PI / 4 + latRad / 2)),
        };
    };
}
