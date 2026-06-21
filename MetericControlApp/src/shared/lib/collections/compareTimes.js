export const compareTimes = (tm1, tm2, coef = 1) => {
    if (!tm1) {
        return 1 * coef;
    } else if (!tm2) {
        return -1 * coef;
    }

    const parsedTm1 = Date.parse(tm1);
    const parsedTm2 = Date.parse(tm2);
    return coef * (parsedTm1 - parsedTm2);
};
