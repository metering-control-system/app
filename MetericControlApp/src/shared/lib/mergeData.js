export const mergeData = (previousData, incomingData) => {
    const items = previousData ?? [];
    const map = new Map(items.map((item) => [item?.id, item]));

    if (!incomingData) {
        return items;
    }

    for (const item of incomingData) {
        if (item) {
            map.set(item?.id, item);
        }
    }

    return Array.from(map.values());
};
