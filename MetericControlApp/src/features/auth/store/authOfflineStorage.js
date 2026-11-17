import mmkvStorage from '@/shared/store/persistMMKVStorage';

export const authOfflineStorage = mmkvStorage(
    'metric-control-account-identity'
);
