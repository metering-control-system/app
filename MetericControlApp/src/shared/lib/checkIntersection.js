export const checkIntersection = (oldData, newDataSet) => {
    const intersection = oldData?.filter((dt) => !newDataSet.has(dt.id));

    return intersection;
};
