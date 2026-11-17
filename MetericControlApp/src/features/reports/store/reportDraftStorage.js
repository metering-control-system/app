import createAccountMMKVStorage from '@/features/auth/store/createAccountMMKVStorage';

export const reportDraftStorage = createAccountMMKVStorage(
    'metric-control-report-draft-storage'
);
