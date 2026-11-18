import createAccountMMKVStorage from '@/features/auth/store/createAccountMMKVStorage';

export const commentsOfflineStorage = createAccountMMKVStorage(
    'metric-control-comment-storage'
);
