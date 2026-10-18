import { prepareSignatureStrokes } from '@/features/acts/lib/prepareSignatureStrokes';

export const createSignatureSvg = (strokes = []) => {
    const { validStrokes, minX, minY, maxX, maxY } =
        prepareSignatureStrokes(strokes);
    if (!validStrokes.length) return '';

    const paths = validStrokes.map((points) => {
        if (points.length === 1) {
            return `<circle cx="${points[0].x}" cy="${points[0].y}" r="1.5" fill="#172b4d" />`;
        }
        const path = points
            .map(({ x, y }, index) => `${index ? 'L' : 'M'} ${x} ${y}`)
            .join(' ');
        return `<path d="${path}" fill="none" stroke="#172b4d" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />`;
    });

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX - 3} ${minY - 3} ${maxX - minX + 6} ${maxY - minY + 6}" width="100%" height="26" preserveAspectRatio="xMidYMid meet" style="display:block">${paths.join('')}</svg>`;
};
