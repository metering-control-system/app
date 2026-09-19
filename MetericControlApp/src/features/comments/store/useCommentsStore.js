import { create } from 'zustand/react';
import { mergeData } from '@/shared/lib/mergeData';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createPersistStorage } from '@/shared/lib/offline/createPersistStorage';
import { commentsOfflineStorage } from '@/features/comments/store/commentsOfflineStorage';
import { COMMENTS_PER_PAGE } from '@/features/comments/constants/comments';

const useCommentsStore = create(
    persist(
        (set, get) => ({
            comments: {},
            replaceComments: (newComments, id) => {
                set({
                    comments: {
                        ...get().comments,
                        [id]: newComments ? [...newComments] : null,
                    },
                });
            },
            setUpdatedComments: (updatedComments, id) => {
                if (!updatedComments) return;

                const activeComments = updatedComments.filter(
                    (c) => !c.is_deleted
                );
                if (activeComments.length === 0) return;

                const oldComments = get().comments[id] ?? [];
                const mergedComments = mergeData(oldComments, activeComments);
                set({
                    comments: {
                        ...get().comments,
                        [id]: mergedComments ? [...mergedComments] : null,
                    },
                });
            },
            updateCommentInStore: (taskId, commentId, updates) => {
                const taskComments = get().comments[taskId];
                if (!taskComments) return;
                set({
                    comments: {
                        ...get().comments,
                        [taskId]: taskComments.map((c) =>
                            c.id === commentId ? { ...c, ...updates } : c
                        ),
                    },
                });
            },
            removeCommentFromStore: (taskId, commentId) => {
                const taskComments = get().comments[taskId];
                if (!taskComments) return;
                set({
                    comments: {
                        ...get().comments,
                        [taskId]: taskComments.filter(
                            (c) => c.id !== commentId
                        ),
                    },
                });
            },
            clearComments: () => set({ comments: {} }),
        }),
        {
            name: 'comments-store',
            storage: createJSONStorage(() =>
                createPersistStorage(commentsOfflineStorage)
            ),
            partialize: (state) => {
                const commentsCopy = { ...state.comments };
                for (const id in commentsCopy) {
                    commentsCopy[id] =
                        commentsCopy[id]?.slice(0, COMMENTS_PER_PAGE) ?? [];
                }
                return { comments: commentsCopy };
            },
            skipHydration: true,
        }
    )
);

export default useCommentsStore;
