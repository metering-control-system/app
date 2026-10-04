export const clamp = (a, b, c) => {
    return c < a ? a : c > b ? b : c;
};

export const colorizeMap = (quantity, coeff = 1) => {
    const hue = 128 - clamp(0, 128, quantity * coeff);
    return `hsl(${hue}, 100%, 50%)`;
};

export const selectMapColorPalette = (
    mode,
    paintCallback,
    tasksCount,
    tasksImportance
) => {
    switch (mode) {
        case 'TASKS_COUNT':
            return paintCallback(tasksCount);
        case 'TASKS_PRIORITY':
            return paintCallback(tasksImportance);
    }
};
