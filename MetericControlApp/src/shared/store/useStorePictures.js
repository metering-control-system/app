import { create } from 'zustand/react';

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

    clearEntityPhotos: ({ entity, entityId }) =>
        set((state) => {
            const nextEntityPhotos = { ...(state.photos[entity] ?? {}) };
            delete nextEntityPhotos[entityId];

            return { photos: { ...state.photos, [entity]: nextEntityPhotos } };
        }),

    resetPhotos: () => set({ photos: { task: {}, report: {} } }),
}));

export default useStorePictures;
