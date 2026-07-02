import { create } from 'zustand/react';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createPersistStorage } from '@/shared/lib/offline/createPersistStorage';
import { settingsOfflineStorage } from '@/features/settings/store/settingsOfflineStorage';
import {
    DEFAULT_PHOTO_QUALITY,
    PHOTO_QUALITY_PRESETS,
} from '@/features/settings/lib/photoQualityPresets';

const useSettingsStore = create(
    persist(
        (set) => ({
            photoQuality: DEFAULT_PHOTO_QUALITY,
            setPhotoQuality: (photoQuality) => set({ photoQuality }),
        }),
        {
            name: 'settings-store',
            storage: createJSONStorage(() =>
                createPersistStorage(settingsOfflineStorage)
            ),
            partialize: (state) => ({ photoQuality: state.photoQuality }),
            skipHydration: false,
        }
    )
);

export const getPhotoQualityPreset = () => {
    const { photoQuality } = useSettingsStore.getState();
    return (
        PHOTO_QUALITY_PRESETS[photoQuality] ??
        PHOTO_QUALITY_PRESETS[DEFAULT_PHOTO_QUALITY]
    );
};

export default useSettingsStore;
