import createAccountMMKVStorage from '@/features/auth/store/createAccountMMKVStorage';

export const actSignaturesStorage = createAccountMMKVStorage(
    'metric-control-report-signatures-storage'
);
