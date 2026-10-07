export const clamp = (min, max, value) => Math.min(max, Math.max(min, value));

export const colorizeMap = (value) =>
    `hsl(${128 * (1 - clamp(0, 1, value))}, 100%, 50%)`;

export const createCountScale = (maxCount) => {
    const normalize = (count) =>
        maxCount > 0 ? Math.log1p(count) / Math.log1p(maxCount) : 0;
    const ticks = [
        ...new Set(
            Array.from({ length: 6 }, (_, index) =>
                Math.round(Math.expm1((Math.log1p(maxCount) * index) / 5))
            )
        ),
    ];
    return { color: (count) => colorizeMap(normalize(count)), ticks };
};
