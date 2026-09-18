const clamp = (a, b, c) => {
    return c < a ? a : c > b ? b : c;
};

export const colorizeMap = (quantity) => {
    const hue = 128 - clamp(0, 128, quantity * 25.6);
    return `hsl(${hue}, 100%, 50%)`;
};
