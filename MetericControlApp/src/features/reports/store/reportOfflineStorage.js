import mmkvStorage from '@/shared/store/persistMMKVStorage';

export const reportOfflineStorage = mmkvStorage(
    'metric-control-report-storage'
);
