export const prepareSignatureStrokes = (strokes = []) => {
    const validStrokes = strokes
        .map((stroke) =>
            stroke.filter(
                (point) =>
                    Number.isFinite(point?.x) && Number.isFinite(point?.y)
            )
        )
        .filter((stroke) => stroke.length);
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const stroke of validStrokes) {
        for (const { x, y } of stroke) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
        }
    }
    return { validStrokes, minX, minY, maxX, maxY };
};
