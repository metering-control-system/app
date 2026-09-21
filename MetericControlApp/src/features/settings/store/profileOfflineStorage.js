import mmkvStorage from '@/shared/store/persistMMKVStorage';

export const profileOfflineStorage = mmkvStorage(
    'metric-control-profile-storage'
);
