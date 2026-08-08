import polygon from '@/features/gis/lib/Spb_Polygon.json';
import { WebMercator } from '@/features/gis/lib/webMercator';
import { GRID_SIZE } from '@/features/gis/constants/mapScale';

class SquareTile {
    #originX;
    #originY;
    #size;
    #id;

    static #tilesCount = 0;

    constructor(col, row, size) {
        SquareTile.#tilesCount++;
        this.#generateUniqueId();

        this.#originX = size * col;
        this.#originY = size * row;
        this.#size = size;
    }

    #generateUniqueId() {
        this.#id = SquareTile.#tilesCount;
    }

    get originX() {
        return this.#originX;
    }
    get originY() {
        return this.#originY;
    }
    get size() {
        return this.#size;
    }
    get id() {
        return this.#id;
    }

    printTile() {
        return {
            width: this.#size,
            height: this.#size,
            position: 'absolute',
            top: this.#originY,
            left: this.#originX,
            borderWidth: 1,
            borderColor: 'black',
        };
    }
}

class RegionTile extends SquareTile {
    inside = false;

    constructor(originX, originY, size) {
        super(originX, originY, size);
    }

    static isPointInPolygon(polygon, point) {
        let inside = false;

        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].x;
            const yi = polygon[i].y;

            const xj = polygon[j].x;
            const yj = polygon[j].y;

            const intersect =
                yi > point.originY !== yj > point.originY &&
                point.originX <
                    ((xj - xi) * (point.originY - yi)) / (yj - yi) + xi;

            if (intersect) {
                inside = !inside;
            }
        }
        return inside;
    }
}

export class TileMap {
    tileSize;
    polygon;

    constructor() {
        this.polygon = this.getPolygon();
        this.tileSize = this.getTileSize(this.polygon);
    }

    getPolygon = () => {
        const region = polygon.features[0].geometry.coordinates;

        const convertedToMeters = region.map(([x, y]) =>
            WebMercator.translateFromDegreesToMeters({ lat: y, lon: x })
        );
        const convertedToLocal = convertedToMeters.map((p) =>
            WebMercator.convertToLocal(convertedToMeters, p)
        );
        return convertedToLocal;
    };

    getTileSize = (coordinates) => {
        const xs = coordinates.map((p) => p.x);
        const ys = coordinates.map((p) => p.y);

        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        return Math.ceil(Math.max(maxX - minX, maxY - minY)) / GRID_SIZE;
    };

    getScale = (screenWidth) => {
        const mapSize = this.tileSize * GRID_SIZE;
        return screenWidth / mapSize;
    };

    printMap = () => {
        const tiles = [];

        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                const colTile = new RegionTile(i, j, this.tileSize);

                if (RegionTile.isPointInPolygon(this.polygon, colTile)) {
                    colTile.inside = true;
                } else {
                    colTile.inside = false;
                }
                tiles.push(colTile);
            }
        }

        return tiles;
    };
}

export const getScale = (screenWidth, mapWidth) => {
    return screenWidth / mapWidth;
};
