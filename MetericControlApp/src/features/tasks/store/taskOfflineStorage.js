import createAccountMMKVStorage from '@/features/auth/store/createAccountMMKVStorage';

export const taskOfflineMutationStorage = createAccountMMKVStorage(
    'metric-control-mutation-storage'
);

export const taskOfflineStorage = createAccountMMKVStorage(
    'metric-control-task-storage'
);
