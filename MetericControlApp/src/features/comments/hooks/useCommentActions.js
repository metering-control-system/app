import { useMutation } from '@tanstack/react-query';
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

    const editMutation = useMutation({
        mutationFn: updateComment,
        onMutate: async ({ commentId, content }) => {
            const oldContent = useCommentsStore
                .getState()
                .comments[taskId]?.find((c) => c.id === commentId).content;

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
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteComment,
        onMutate: async ({ commentId }) => {
            removeCommentFromStore(taskId, commentId);
            return { commentId };
        },
    });

    const handleEdit = async ({ commentId, content }) => {
        return editMutation.mutateAsync({ commentId, content });
    };

    const handleDelete = async ({ commentId }) => {
        return deleteMutation.mutateAsync({ commentId });
    };

    return {
        handleEdit,
        handleDelete,
        isEditing: editMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
};

export default useCommentActions;
