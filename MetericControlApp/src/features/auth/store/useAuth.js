import { create } from 'zustand/react';
import { createJSONStorage, persist } from 'zustand/middleware';
import { authOfflineStorage } from '@/features/auth/store/authOfflineStorage';
import { createPersistStorage } from '@/shared/lib/offline/createPersistStorage';

const useAuth = create(
    persist(
        (set, get) => ({
            login: null,
            requestController: new AbortController(),
            isAuthenticated: false,
            isAuthChecked: false,
            accessToken: null,
            setSession: ({ login, accessToken }) =>
                set({
                    login,
                    accessToken,
                    isAuthenticated: true,
                    requestController: new AbortController(),
                }),
            setToken: (accessToken) =>
                set({ accessToken, isAuthenticated: Boolean(accessToken) }),
            cancelRequests: () => get().requestController.abort(),
            clearSession: () =>
                set({ login: null, accessToken: null, isAuthenticated: false }),
            setAuthChecked: () => set({ isAuthChecked: true }),
        }),
        {
            name: 'auth-store',
            storage: createJSONStorage(() =>
                createPersistStorage(authOfflineStorage)
            ),
            partialize: (state) => ({ login: state.login }),
        }
    )
);

export default useAuth;
