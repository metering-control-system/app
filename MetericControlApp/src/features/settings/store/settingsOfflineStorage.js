import mmkvStorage from '@/shared/store/persistMMKVStorage';

export const settingsOfflineStorage = mmkvStorage(
    'metric-control-settings-storage'
);
