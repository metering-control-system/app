import createAccountMMKVStorage from '@/features/auth/store/createAccountMMKVStorage';

export const profileOfflineStorage = createAccountMMKVStorage(
    'metric-control-profile-storage'
);
