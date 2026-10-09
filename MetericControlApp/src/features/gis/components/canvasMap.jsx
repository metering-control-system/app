import { useMemo } from 'react';
import { Canvas, Picture, Skia } from '@shopify/react-native-skia';
import polygon from '@/features/gis/constants/tiles.json';

const paint = Skia.Paint();
const recorder = Skia.PictureRecorder();

const polygonTiles = Object.entries(polygon.coordinates).flatMap(
    ([district, tiles]) =>
        Object.entries(tiles)
            .filter(([key]) => key !== 'center')
            .map(([, tile]) => [district, tile])
);

const CanvasMap = ({
    isTiledMap,
    baseScale,
    size,
    selectMapColorPaletteByMode,
}) => {
    const districtsPicture = useMemo(() => {
        const canvas = recorder.beginRecording(Skia.XYWHRect(0, 0, size, size));
        for (const [district, tile] of polygonTiles) {
            const districtColor = selectMapColorPaletteByMode(false, district);
            paint.setColor(Skia.Color(districtColor));

            const x = tile.x * baseScale,
                y = tile.y * baseScale,
                s = polygon.size * baseScale;
            const rect = Skia.XYWHRect(x, y, s, s);

            canvas.drawRect(rect, paint);

            paint.setColor(Skia.Color('#000'));
            if (tile.borderLeft) canvas.drawLine(x, y, x, y + s, paint);
            if (tile.borderRight)
                canvas.drawLine(x + s, y, x + s, y + s, paint);
            if (tile.borderTop) canvas.drawLine(x, y, x + s, y, paint);
            if (tile.borderBottom)
                canvas.drawLine(x, y + s, x + s, y + s, paint);
        }
        return recorder.finishRecordingAsPicture();
    }, [size, selectMapColorPaletteByMode, baseScale]);

    const tilesPicture = useMemo(() => {
        const canvas = recorder.beginRecording(Skia.XYWHRect(0, 0, size, size));
        for (const [, tile] of polygonTiles) {
            const tileColor = selectMapColorPaletteByMode(true, null, tile);
            paint.setColor(Skia.Color(tileColor));

            const x = tile.x * baseScale,
                y = tile.y * baseScale,
                s = polygon.size * baseScale;
            const rect = Skia.XYWHRect(x, y, s, s);

            canvas.drawRect(rect, paint);

            paint.setColor(Skia.Color('#000'));
            canvas.drawLine(x, y, x, y + s, paint);
            canvas.drawLine(x + s, y, x + s, y + s, paint);
            canvas.drawLine(x, y, x + s, y, paint);
            canvas.drawLine(x, y + s, x + s, y + s, paint);
        }
        return recorder.finishRecordingAsPicture();
    }, [size, selectMapColorPaletteByMode, baseScale]);

    return (
        <Canvas width={size} height={size}>
            {isTiledMap ? (
                <Picture picture={tilesPicture} />
            ) : (
                <Picture picture={districtsPicture} />
            )}
        </Canvas>
    );
};

export default CanvasMap;
