import useAuth from '@/features/auth/store/useAuth';
import mmkvStorage from '@/shared/store/persistMMKVStorage';

let isAccountStorageInitialized = false;

export const initializeAccountMMKVStorage = () => {
    isAccountStorageInitialized = true;
};

const createAccountMMKVStorage = (storageId) => {
    const storagesByLogin = new Map();

    const getActiveStorage = () => {
        const { login } = useAuth.getState();
        if (!isAccountStorageInitialized || !login) {
            return null;
        }

        if (!storagesByLogin.has(login)) {
            storagesByLogin.set(
                login,
                mmkvStorage(`${storageId}:account:${encodeURIComponent(login)}`)
            );
        }

        return storagesByLogin.get(login);
    };

    return {
        getString: (name) => getActiveStorage()?.getString(name),
        set: (name, value) => getActiveStorage()?.set(name, value),
        remove: (name) => getActiveStorage()?.remove(name),
    };
};

export default createAccountMMKVStorage;
