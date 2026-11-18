import createAccountMMKVStorage from '@/features/auth/store/createAccountMMKVStorage';

export const picturesStorage = createAccountMMKVStorage(
    'mmkv-pictures-storage'
);
