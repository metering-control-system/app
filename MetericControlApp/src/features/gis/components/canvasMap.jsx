import { useMemo } from 'react';
import { Canvas, Picture, Skia } from '@shopify/react-native-skia';
import polygon from '@/features/gis/constants/tiles.json';
import { colorizeMap } from '@/features/gis/lib/colorizeMap';

const paint = Skia.Paint();
const recorder = Skia.PictureRecorder();

const polygonTiles = Object.entries(polygon.coordinates).flatMap(
    ([district, tiles]) =>
        Object.entries(tiles)
            .filter(([key]) => key !== 'center')
            .map(([, tile]) => [district, tile])
);

const CanvasMap = ({
    districtsTasks,
    tilesTasks,
    isTiledMap,
    baseScale,
    size,
}) => {
    const districtsPicture = useMemo(() => {
        const canvas = recorder.beginRecording(Skia.XYWHRect(0, 0, size, size));
        const numbersOfTasksByDistrict = Object.fromEntries(
            Object.entries(districtsTasks).map(([district, tasks]) => [
                district,
                Object.values(tasks).length,
            ])
        );
        for (const [district, tile] of polygonTiles) {
            const tileColor = colorizeMap(
                numbersOfTasksByDistrict[district] ?? 0
            );
            paint.setColor(Skia.Color(tileColor));

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
    }, [districtsTasks, baseScale, size]);

    const tilesPicture = useMemo(() => {
        const canvas = recorder.beginRecording(Skia.XYWHRect(0, 0, size, size));
        for (const [, tile] of polygonTiles) {
            const tasksCount = tilesTasks[`${tile.x}:${tile.y}`]?.length ?? 0;
            paint.setColor(Skia.Color(colorizeMap(tasksCount)));

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
    }, [tilesTasks, baseScale, size]);

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
