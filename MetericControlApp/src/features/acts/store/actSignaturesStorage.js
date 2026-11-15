import mmkvStorage from '@/shared/store/persistMMKVStorage';

export const actSignaturesStorage = mmkvStorage(
    'metric-control-report-signatures-storage'
);
