import createAccountMMKVStorage from '@/features/auth/store/createAccountMMKVStorage';

export const settingsOfflineStorage = createAccountMMKVStorage(
    'metric-control-settings-storage'
);
