export const createSignatureSvg = (strokes = []) => {
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
    const paths = validStrokes.map((points) => {
        points.forEach(({ x, y }) => {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
        });
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
