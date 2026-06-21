import { create } from 'zustand/react';

const useAuth = create((set) => ({
    isAuthenticated: false,
    isAuthChecked: false,
    accessToken: null,
    login: null,
    setToken: (accessToken) =>
        set(() => {
            if (accessToken) {
                return { accessToken, isAuthenticated: true };
            } else {
                return { accessToken: null, isAuthenticated: false };
            }
        }),
    setLogin: (login) => set({ login: login ?? null }),
    clearSession: () =>
        set({ accessToken: null, isAuthenticated: false, login: null }),
    setAuthChecked: () => set({ isAuthChecked: true }),
}));

export default useAuth;
