import useAuth from '@/features/auth/store/useAuth';
import { cleanupGalleryPhotos } from '@/shared/lib/media/cleanupGalleryPhotos';
import { create } from 'zustand/react';
import { normalizePhotos } from '@/shared/lib/media/normalizePhotos';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createPersistStorage } from '@/shared/lib/offline/createPersistStorage';
import { picturesStorage } from '@/shared/store/picturesStorage';

/**
 * Zustand store for managing photo URIs associated with entities and slots.
 *
 * Photos are stored in a nested structure:
 * `photos[entity][entityId][slot] -> string | string[]`
 */
const useStorePictures = create(
    persist(
        (set, get) => ({
            photos: { task: {}, report: {} },
            photoMetadata: { task: {}, report: {} },
            removedPhotoIds: { task: {}, report: {} },

            replaceEntityPhotos: ({
                entity,
                entityId,
                photos,
                photoMetadata,
                removedPhotoIds = [],
            }) =>
                set((state) => ({
                    photos: {
                        ...state.photos,
                        [entity]: {
                            ...state.photos[entity],
                            [entityId]: photos,
                        },
                    },
                    photoMetadata: {
                        ...state.photoMetadata,
                        [entity]: {
                            ...state.photoMetadata[entity],
                            [entityId]: photoMetadata,
                        },
                    },
                    removedPhotoIds: {
                        ...state.removedPhotoIds,
                        [entity]: {
                            ...state.removedPhotoIds[entity],
                            [entityId]: removedPhotoIds,
                        },
                    },
                })),

            /**
             * Sets a single photo URI for a given entity, entity ID and slot.
             *
             * @param {{ entity: string, entityId: string | number, slot: string, uri: string }} params
             * @param {string} params.entity - Entity name (e.g. 'task', 'report').
             * @param {string | number} params.entityId - Identifier of the entity instance.
             * @param {string} params.slot - Photo slot name.
             * @param {string} params.uri - URI of the photo.
             * @returns {void}
             */
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

            /**
             * Returns a single photo URI for the given slot, or null if none is set.
             *
             * @param {{ entity: string, entityId: string | number, slot: string }} params
             * @param {string} params.entity - Entity name.
             * @param {string | number} params.entityId - Identifier of the entity instance.
             * @param {string} params.slot - Photo slot name.
             * @returns {string | null} Stored URI or null.
             */
            getPhoto: ({ entity, entityId, slot }) => {
                const state = get();
                return state.photos[entity]?.[entityId]?.[slot] ?? null;
            },

            /**
             * Returns the photo URIs for the given slot as a normalized array,
             * or an empty array if none are stored.
             *
             * @param {{ entity: string, entityId: string | number, slot: string }} params
             * @param {string} params.entity - Entity name.
             * @param {string | number} params.entityId - Identifier of the entity instance.
             * @param {string} params.slot - Photo slot name.
             * @returns {string[]} Array of photo URIs.
             */
            getPhotos: ({ entity, entityId, slot }) => {
                const state = get();
                const value = state.photos[entity]?.[entityId]?.[slot];

                return normalizePhotos(value);
            },

            /**
             * Replaces all photo metadata for an entity instance.
             *
             * @param {{ entity: string, entityId: string | number, photoMetadata: object }} params
             * @returns {void}
             */
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

            /**
             * Marks a remote photo for deletion without adding duplicate IDs.
             *
             * @param {{ entity: string, entityId: string | number, clientImageId: string }} params
             * @returns {void}
             */
            addRemovedPhotoId: ({ entity, entityId, clientImageId }) =>
                set((state) => {
                    const currentIds =
                        state.removedPhotoIds[entity]?.[entityId] ?? [];

                    if (currentIds.includes(clientImageId)) {
                        return state;
                    }

                    return {
                        removedPhotoIds: {
                            ...state.removedPhotoIds,
                            [entity]: {
                                ...state.removedPhotoIds[entity],
                                [entityId]: [...currentIds, clientImageId],
                            },
                        },
                    };
                }),

            /**
             * Appends a photo URI to the list of photos for the given slot.
             *
             * @param {{ entity: string, entityId: string | number, slot: string, uri: string }} params
             * @param {string} params.entity - Entity name.
             * @param {string | number} params.entityId - Identifier of the entity instance.
             * @param {string} params.slot - Photo slot name.
             * @param {string} params.uri - URI of the photo to append.
             * @returns {void}
             */
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

            /**
             * Replaces the photo URI at the given index for the given slot.
             * Does nothing if the index is out of bounds.
             *
             * @param {{ entity: string, entityId: string | number, slot: string, index: number, uri: string }} params
             * @param {string} params.entity - Entity name.
             * @param {string | number} params.entityId - Identifier of the entity instance.
             * @param {string} params.slot - Photo slot name.
             * @param {number} params.index - Index of the photo to replace.
             * @param {string} params.uri - New URI of the photo.
             * @returns {void}
             */
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

            /**
             * Clears the photo URI(s) for the given slot.
             *
             * @param {{ entity: string, entityId: string | number, slot: string }} params
             * @param {string} params.entity - Entity name.
             * @param {string | number} params.entityId - Identifier of the entity instance.
             * @param {string} params.slot - Photo slot name to clear.
             * @returns {void}
             */
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

            /**
             * Removes the photo URI at the given index for the given slot.
             * If the last photo is removed, the slot entry is deleted entirely.
             * Does nothing if the index is out of bounds.
             *
             * @param {{ entity: string, entityId: string | number, slot: string, index: number }} params
             * @param {string} params.entity - Entity name.
             * @param {string | number} params.entityId - Identifier of the entity instance.
             * @param {string} params.slot - Photo slot name.
             * @param {number} params.index - Index of the photo to remove.
             * @returns {void}
             */
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

            /**
             * Clears all photos for the given entity instance.
             *
             * @param {{ entity: string, entityId: string | number }} params
             * @param {string} params.entity - Entity name.
             * @param {string | number} params.entityId - Identifier of the entity instance.
             * @returns {void}
             */
            clearEntityPhotos: ({ entity, entityId }) =>
                set((state) => {
                    const nextEntityPhotos = {
                        ...(state.photos[entity] ?? {}),
                    };
                    const nextEntityMetadata = {
                        ...(state.photoMetadata[entity] ?? {}),
                    };
                    const nextRemovedPhotoIds = {
                        ...(state.removedPhotoIds[entity] ?? {}),
                    };
                    delete nextEntityPhotos[entityId];
                    delete nextEntityMetadata[entityId];
                    delete nextRemovedPhotoIds[entityId];

                    return {
                        photos: { ...state.photos, [entity]: nextEntityPhotos },
                        photoMetadata: {
                            ...state.photoMetadata,
                            [entity]: nextEntityMetadata,
                        },
                        removedPhotoIds: {
                            ...state.removedPhotoIds,
                            [entity]: nextRemovedPhotoIds,
                        },
                    };
                }),

            /**
             * Resets all photos back to the initial empty state.
             *
             * @returns {void}
             */
            resetPhotos: () =>
                set({
                    photos: { task: {}, report: {} },
                    photoMetadata: { task: {}, report: {} },
                    removedPhotoIds: { task: {}, report: {} },
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
                removedPhotoIds: state.removedPhotoIds,
            }),
        }
    )
);

useStorePictures.subscribe((state, previousState) => {
    if (useAuth.getState().login && state.photos !== previousState.photos) {
        cleanupGalleryPhotos(previousState.photos, state.photos);
    }
});

export default useStorePictures;
