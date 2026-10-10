import { useEffect } from 'react';
import { create } from 'zustand';

export const requests = [];
export const focusState = create(() => ({ focused: true }));
export const useIsFocused = () => focusState((state) => state.focused);

export const baseApi = {
    get: (url, { signal, params } = {}) =>
        new Promise((resolve, reject) => {
            requests.push({
                url,
                signal,
                params,
                reject,
                respond: (data) => resolve({ data }),
            });
        }),
};

const focusEffects = new Set();
export const focusScreens = () => {
    for (const effect of focusEffects) effect();
};
export const useFocusEffect = (effect) =>
    useEffect(() => {
        focusEffects.add(effect);
        const cleanup = effect();
        return () => {
            focusEffects.delete(effect);
            cleanup?.();
        };
    }, [effect]);
