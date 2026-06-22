export const createPersistStorage = (storage) => ({
    getItem: (name) => storage.getString(name) ?? null,
    setItem: (name, value) => storage.set(name, value),
    removeItem: (name) => storage.remove(name),
});
