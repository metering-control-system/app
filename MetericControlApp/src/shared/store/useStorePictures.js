import { create } from 'zustand/react';

const normalizePhotos = (value) => {
    if (Array.isArray(value)) {
        return value.filter(Boolean);
    }

    if (!value) {
        return [];
    }

    return [value];
};

const useStorePictures = create((set, get) => ({
    photos: { task: {}, report: {} },

    setPhoto: ({ entity, entityId, slot, uri }) =>
        set((state) => ({
            photos: {
                ...state.photos,
                [entity]: {
                    ...state.photos[entity],
                    [entityId]: {
                        ...state.photos[entity][entityId],
                        [slot]: uri,
                    },
                },
            },
        })),

    getPhoto: ({ entity, entityId, slot }) => {
        const state = get();
        return state.photos[entity]?.[entityId]?.[slot] ?? null;
    },

    getPhotos: ({ entity, entityId, slot }) => {
        const state = get();
        const value = state.photos[entity]?.[entityId]?.[slot];

        return normalizePhotos(value);
    },

    appendPhoto: ({ entity, entityId, slot, uri }) =>
        set((state) => {
            const currentValue = state.photos[entity]?.[entityId]?.[slot];
            const nextPhotos = [...normalizePhotos(currentValue), uri];

            return {
                photos: {
                    ...state.photos,
                    [entity]: {
                        ...state.photos[entity],
                        [entityId]: {
                            ...state.photos[entity][entityId],
                            [slot]: nextPhotos,
                        },
                    },
                },
            };
        }),

    updatePhoto: ({ entity, entityId, slot, index, uri }) =>
        set((state) => {
            const currentValue = state.photos[entity]?.[entityId]?.[slot];
            const nextPhotos = normalizePhotos(currentValue);

            if (index < 0 || index >= nextPhotos.length) {
                return state;
            }

            nextPhotos[index] = uri;

            return {
                photos: {
                    ...state.photos,
                    [entity]: {
                        ...state.photos[entity],
                        [entityId]: {
                            ...state.photos[entity][entityId],
                            [slot]: nextPhotos,
                        },
                    },
                },
            };
        }),

    clearPhoto: ({ entity, entityId, slot }) =>
        set((state) => {
            const entityPhotos = state.photos[entity]?.[entityId] ?? {};
            const nextEntityPhotos = { ...entityPhotos };
            delete nextEntityPhotos[slot];

            return {
                photos: {
                    ...state.photos,
                    [entity]: {
                        ...state.photos[entity],
                        [entityId]: nextEntityPhotos,
                    },
                },
            };
        }),

    removePhotoAt: ({ entity, entityId, slot, index }) =>
        set((state) => {
            const currentValue = state.photos[entity]?.[entityId]?.[slot];
            const nextPhotos = normalizePhotos(currentValue);

            if (index < 0 || index >= nextPhotos.length) {
                return state;
            }

            nextPhotos.splice(index, 1);

            if (!nextPhotos.length) {
                const entityPhotos = state.photos[entity]?.[entityId] ?? {};
                const nextEntityPhotos = { ...entityPhotos };
                delete nextEntityPhotos[slot];

                return {
                    photos: {
                        ...state.photos,
                        [entity]: {
                            ...state.photos[entity],
                            [entityId]: nextEntityPhotos,
                        },
                    },
                };
            }

            return {
                photos: {
                    ...state.photos,
                    [entity]: {
                        ...state.photos[entity],
                        [entityId]: {
                            ...state.photos[entity][entityId],
                            [slot]: nextPhotos,
                        },
                    },
                },
            };
        }),

    clearEntityPhotos: ({ entity, entityId }) =>
        set((state) => {
            const nextEntityPhotos = { ...(state.photos[entity] ?? {}) };
            delete nextEntityPhotos[entityId];

            return { photos: { ...state.photos, [entity]: nextEntityPhotos } };
        }),

    resetPhotos: () => set({ photos: { task: {}, report: {} } }),
}));

export default useStorePictures;
