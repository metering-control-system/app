import mmkvStorage from '@/shared/store/persistMMKVStorage';

export const taskOfflineMutationStorage = mmkvStorage(
    'metric-control-mutation-storage'
);

export const taskOfflineStorage = mmkvStorage('metric-control-task-storage');
