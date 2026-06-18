export const concatenateFields = (el, separator = ' ') => {
    let acc = '';
    if (el === null || el === undefined) {
        return '';
    }
    if (typeof el !== 'object' && !Array.isArray(el) && el !== '') {
        acc += `${separator}${el.toString()}`.trim().toLowerCase();
    } else if (Array.isArray(el)) {
        for (const key of el) {
            acc += concatenateFields(key, separator);
        }
    } else {
        for (const key in el) {
            acc += concatenateFields(el[key], separator);
        }
    }
    return acc;
};
