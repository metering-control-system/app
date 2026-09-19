import { create } from 'zustand/react';
import { normalizePhotos } from '@/shared/lib/media/normalizePhotos';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createPersistStorage } from '@/shared/lib/offline/createPersistStorage';
import { picturesStorage } from '@/shared/store/picturesStorage';

const useStorePictures = create(
    persist(
        (set, get) => ({
            photos: { task: {}, report: {} },
            photoMetadata: { task: {}, report: {} },

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

            setEntityPhotoMetadata: ({ entity, entityId, photoMetadata }) =>
                set((state) => ({
                    photoMetadata: {
                        ...state.photoMetadata,
                        [entity]: {
                            ...state.photoMetadata[entity],
                            [entityId]: photoMetadata,
                        },
                    },
                })),

            appendPhoto: ({ entity, entityId, slot, uri }) =>
                set((state) => {
                    const currentValue =
                        state.photos[entity]?.[entityId]?.[slot];
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
                    const currentValue =
                        state.photos[entity]?.[entityId]?.[slot];
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
                    const currentValue =
                        state.photos[entity]?.[entityId]?.[slot];
                    const nextPhotos = normalizePhotos(currentValue);

                    if (index < 0 || index >= nextPhotos.length) {
                        return state;
                    }

                    nextPhotos.splice(index, 1);

                    if (!nextPhotos.length) {
                        const entityPhotos =
                            state.photos[entity]?.[entityId] ?? {};
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
                    const nextEntityPhotos = {
                        ...(state.photos[entity] ?? {}),
                    };
                    const nextEntityMetadata = {
                        ...(state.photoMetadata[entity] ?? {}),
                    };
                    delete nextEntityPhotos[entityId];
                    delete nextEntityMetadata[entityId];

                    return {
                        photos: { ...state.photos, [entity]: nextEntityPhotos },
                        photoMetadata: {
                            ...state.photoMetadata,
                            [entity]: nextEntityMetadata,
                        },
                    };
                }),

            resetPhotos: () =>
                set({
                    photos: { task: {}, report: {} },
                    photoMetadata: { task: {}, report: {} },
                }),
        }),
        {
            name: 'pictures-store',
            storage: createJSONStorage(() =>
                createPersistStorage(picturesStorage)
            ),
            partialize: (state) => ({
                photos: state.photos,
                photoMetadata: state.photoMetadata,
            }),
        }
    )
);

export default useStorePictures;
