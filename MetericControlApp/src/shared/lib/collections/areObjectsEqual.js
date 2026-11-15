export const areObjectsEqual = (expected, current) => {
    if (Object.is(expected, current)) return true;
    if (
        expected === null ||
        current === null ||
        typeof expected !== 'object' ||
        typeof current !== 'object' ||
        Array.isArray(expected) !== Array.isArray(current)
    ) {
        return false;
    }

    const keys = Object.keys(expected);
    return (
        keys.length === Object.keys(current).length &&
        keys.every(
            (key) =>
                Object.hasOwn(current, key) &&
                areObjectsEqual(expected[key], current[key])
        )
    );
};
