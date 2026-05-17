export const getAddressKey = (task) =>
    [task.address?.locality, task.address?.street, task.address?.house]
        .filter(Boolean)
        .join('|');

export const getStreetKey = (task) =>
    [task.address?.locality, task.address?.street].filter(Boolean).join('|');

export const getLocalityKey = (task) => task.address?.locality ?? '';
