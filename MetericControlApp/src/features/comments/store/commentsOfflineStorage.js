import mmkvStorage from '@/shared/store/persistMMKVStorage';

export const commentsOfflineStorage = mmkvStorage(
    'metric-control-comment-storage'
);
