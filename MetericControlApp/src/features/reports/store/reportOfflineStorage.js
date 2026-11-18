import createAccountMMKVStorage from '@/features/auth/store/createAccountMMKVStorage';

export const reportOfflineStorage = createAccountMMKVStorage(
    'metric-control-report-storage'
);
