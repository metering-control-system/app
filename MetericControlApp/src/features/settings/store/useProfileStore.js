import { create } from 'zustand/react';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createPersistStorage } from '@/shared/lib/offline/createPersistStorage';
import { profileOfflineStorage } from '@/features/settings/store/profileOfflineStorage';

const useProfileStore = create(
    persist(
        (set) => ({
            userId: null,
            fullName: null,
            avatar: null,
            setProfile: ({ userId, fullName, avatar }) =>
                set({
                    userId: userId ?? null,
                    fullName: fullName ?? null,
                    avatar: avatar ?? null,
                }),
            clearProfile: () =>
                set({ userId: null, fullName: null, avatar: null }),
        }),
        {
            name: 'profile-store',
            storage: createJSONStorage(() =>
                createPersistStorage(profileOfflineStorage)
            ),
            partialize: (state) => ({
                userId: state.userId,
                fullName: state.fullName,
                avatar: state.avatar,
            }),
            skipHydration: false,
        }
    )
);

export default useProfileStore;
