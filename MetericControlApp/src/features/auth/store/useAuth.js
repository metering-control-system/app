import { create } from 'zustand/react';

const useAuth = create((set) => ({
    isAuthenticated: false,
    isAuthChecked: false,
    accessToken: null,
    setToken: (accessToken) =>
        set(() => {
            if (accessToken) {
                return { accessToken, isAuthenticated: true };
            } else {
                return { accessToken: null, isAuthenticated: false };
            }
        }),
    clearSession: () => set({ accessToken: null, isAuthenticated: false }),
    setAuthChecked: () => set({ isAuthChecked: true }),
}));

export default useAuth;
