import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    updateComment,
    deleteComment,
} from '@/features/comments/api/mutateCommentApi';
import useCommentsStore from '@/features/comments/store/useCommentsStore';

const useCommentActions = (taskId) => {
    const updateCommentInStore = useCommentsStore(
        (s) => s.updateCommentInStore
    );
    const removeCommentFromStore = useCommentsStore(
        (s) => s.removeCommentFromStore
    );

    const queryClient = useQueryClient();

    const editMutation = useMutation({
        mutationFn: updateComment,
        onMutate: async ({ commentId, content }) => {
            const oldContent = useCommentsStore
                .getState()
                .comments[taskId]?.find((c) => c.id === commentId)?.content;

            updateCommentInStore(taskId, commentId, {
                content,
                isPending: true,
            });
            return { commentId, oldContent };
        },
        onSuccess: (data, variables) => {
            updateCommentInStore(taskId, variables.commentId, { ...data });
        },
        onError: (_error, variables, context) => {
            updateCommentInStore(taskId, variables.commentId, {
                content: context.oldContent,
                isPending: false,
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteComment,
        onMutate: async ({ commentId }) => {
            const currentContent = useCommentsStore
                .getState()
                .comments[taskId]?.find((c) => c.id === commentId).content;

            updateCommentInStore(taskId, commentId, {
                content: currentContent,
                // eslint-disable-next-line camelcase
                is_deleted: true,
            });

            return { content: currentContent };
        },
        onSuccess: (data, variables) => {
            removeCommentFromStore(taskId, variables.commentId);
            queryClient.invalidateQueries({ queryKey: ['comments'] });
        },
        onError: (_error, variables, context) => {
            if (context?.content) {
                updateCommentInStore(taskId, variables.commentId, {
                    content: context.content,
                    // eslint-disable-next-line camelcase
                    is_deleted: false,
                });
            }
            queryClient.invalidateQueries({ queryKey: ['comments'] });
        },
    });

    const handleEdit = async ({ commentId, content }) => {
        return await editMutation.mutateAsync({ commentId, content });
    };

    const handleDelete = async ({ commentId }) => {
        return await deleteMutation.mutateAsync({ commentId });
    };

    return {
        handleEdit,
        handleDelete,
        isEditing: editMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
};

export default useCommentActions;
