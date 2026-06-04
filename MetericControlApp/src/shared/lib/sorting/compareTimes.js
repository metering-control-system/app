export const compareTimes = (tm1, tm2) => {
    if (!tm1) {
        return 1;
    } else if (!tm2) {
        return -1;
    }

    const parsedTm1 = Date.parse(tm1);
    const parsedTm2 = Date.parse(tm2);
    return parsedTm1 - parsedTm2;
};
