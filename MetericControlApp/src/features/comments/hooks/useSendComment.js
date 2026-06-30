import { useMutation } from '@tanstack/react-query';
import { sendComment } from '@/features/comments/api/mutateCommentApi';
import useCommentsStore from '@/features/comments/store/useCommentsStore';
import useNetwork from '@/shared/hooks/offline/useNetwork';
import { nanoid } from 'nanoid/non-secure';

const useSendComment = (userId) => {
    const { isChecked, isOnline } = useNetwork();
    const replaceComments = useCommentsStore((state) => state.replaceComments);

    const { mutateAsync, error } = useMutation({
        mutationFn: sendComment,
        onMutate: async ({ id, message }) => {
            const oldComments = useCommentsStore.getState().comments[id] ?? [];
            const uniqueId = nanoid();

            const newComments = [
                ...oldComments,
                {
                    content: message,
                    id: uniqueId,
                    isPending: true,
                    localId: uniqueId,
                    // eslint-disable-next-line camelcase
                    author_id: userId,
                },
            ];
            replaceComments(newComments, id);

            return { uniqueId, newComments };
        },
        onSuccess: (data, variables, context) => {
            const currentComments =
                useCommentsStore.getState().comments[variables?.id] ?? [];
            if (data) {
                const updatedComments = currentComments
                    .filter(
                        (c) =>
                            c.localId !== context.uniqueId && c.id !== data.id
                    )
                    .concat({ ...data, localId: context.uniqueId });
                replaceComments(updatedComments, variables?.id);
            }
        },
        onError: (_error, variables, context) => {
            replaceComments(
                context.newComments.filter(
                    (comment) => comment.localId !== context.uniqueId
                ) ?? null,
                variables.id
            );
        },
    });

    const handleComment = async ({ id, message }) => {
        if (!isChecked) {
            return;
        }
        if (isOnline) {
            return await mutateAsync({ id, message });
        }
    };

    return { handleComment, error };
};

export default useSendComment;
