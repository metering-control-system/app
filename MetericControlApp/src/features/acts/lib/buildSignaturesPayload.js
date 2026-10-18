import {
    ImageFormat,
    PaintStyle,
    Skia,
    StrokeCap,
    StrokeJoin,
} from '@shopify/react-native-skia';

const createSignatureDataUrl = (strokes = []) => {
    const validStrokes = strokes
        .map((stroke) =>
            stroke.filter(
                (point) =>
                    Number.isFinite(point?.x) && Number.isFinite(point?.y)
            )
        )
        .filter((stroke) => stroke.length);
    if (!validStrokes.length) return '';

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
    const padding = 4;
    const scale = Math.min(
        1,
        1024 / Math.max(1, maxX - minX),
        512 / Math.max(1, maxY - minY)
    );
    const surface = Skia.Surface.Make(
        Math.ceil((maxX - minX) * scale) + padding * 2,
        Math.ceil((maxY - minY) * scale) + padding * 2
    );
    if (!surface)
        throw new Error('Не удалось подготовить изображение подписи.');

    const paint = Skia.Paint();
    let image;
    try {
        const canvas = surface.getCanvas();
        canvas.clear(Skia.Color('transparent'));
        paint.setAntiAlias(true);
        paint.setColor(Skia.Color('#172b4d'));
        paint.setStrokeWidth(3 * scale);
        paint.setStrokeCap(StrokeCap.Round);
        paint.setStrokeJoin(StrokeJoin.Round);
        for (const stroke of validStrokes) {
            const path = Skia.Path.Make();
            try {
                if (stroke.length === 1) {
                    paint.setStyle(PaintStyle.Fill);
                    canvas.drawCircle(
                        (stroke[0].x - minX) * scale + padding,
                        (stroke[0].y - minY) * scale + padding,
                        1.5 * scale,
                        paint
                    );
                } else {
                    paint.setStyle(PaintStyle.Stroke);
                    stroke.forEach(({ x, y }, index) => {
                        const px = (x - minX) * scale + padding;
                        const py = (y - minY) * scale + padding;
                        if (index === 0) path.moveTo(px, py);
                        else path.lineTo(px, py);
                    });
                    canvas.drawPath(path, paint);
                }
            } finally {
                path.dispose();
            }
        }
        surface.flush();
        image = surface.makeImageSnapshot();
        const base64 = image.encodeToBase64(ImageFormat.PNG);
        if (!base64) throw new Error('Не удалось закодировать подпись.');
        return `data:image/png;base64,${base64}`;
    } finally {
        image?.dispose();
        paint.dispose();
        surface.dispose();
    }
};

export const buildSignaturesPayload = (actPdf) => ({
    ['consumer_signature']: createSignatureDataUrl(
        actPdf?.isRefused ? [] : actPdf?.signatures?.client
    ),
    ['member_signature']: createSignatureDataUrl(
        actPdf?.isRefused ? [] : actPdf?.signatures?.master
    ),
});
