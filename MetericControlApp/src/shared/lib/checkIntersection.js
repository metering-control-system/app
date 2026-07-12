export const checkIntersection = (oldData, newDataSet) => {
    if (!oldData || !newDataSet) return 0;

    const oldIds = new Set(oldData.map((dt) => dt.id));
    let count = 0;
    for (const id of newDataSet) {
        if (!oldIds.has(id)) count++;
    }

    return count;
};
