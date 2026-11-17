import createAccountMMKVStorage from '@/features/auth/store/createAccountMMKVStorage';

export const actTemplatesStorage = createAccountMMKVStorage(
    'metric-control-act-templates-storage'
);
