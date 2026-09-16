import { useMutation } from '@tanstack/react-query';
import { sendComment } from '@/features/comments/api/mutateCommentApi';
import useCommentsStore from '@/features/comments/store/useCommentsStore';
import useNetwork from '@/shared/hooks/offline/useNetwork';
import { nanoid } from 'nanoid/non-secure';
import { useEffect, useRef } from 'react';

const useSendComment = (userId) => {
    const { isChecked, isOnline } = useNetwork();
    const replaceComments = useCommentsStore((state) => state.replaceComments);
    const retryInProgressRef = useRef(false);

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
            if (!isOnline) return;

            replaceComments(
                context.newComments.filter(
                    (comment) => comment.localId !== context.uniqueId
                ) ?? null,
                variables.id
            );
        },
    });

    useEffect(() => {
        if (!isOnline) return;
        if (retryInProgressRef.current) return;

        const retryPending = async () => {
            retryInProgressRef.current = true;

            try {
                const snapshot = useCommentsStore.getState().comments ?? {};

                for (const taskId in snapshot) {
                    const comments = snapshot[taskId];
                    if (!comments) continue;

                    for (const comment of comments) {
                        if (!comment.isPending) continue;

                        try {
                            const data = await sendComment({
                                id: +taskId,
                                message: comment.content,
                            });

                            if (data) {
                                const current =
                                    useCommentsStore.getState().comments[
                                        taskId
                                    ] ?? [];
                                const updated = current
                                    .filter(
                                        (c) =>
                                            c.localId !== comment.localId &&
                                            c.id !== data.id
                                    )
                                    .concat({
                                        ...data,
                                        localId: comment.localId,
                                    });
                                replaceComments(updated, taskId);
                            }
                        } catch {
                            // keep pending for next online transition
                        }
                    }
                }
            } finally {
                retryInProgressRef.current = false;
            }
        };

        retryPending();
    }, [isOnline, replaceComments]);

    const handleComment = async ({ id, message }) => {
        if (!isChecked) return;
        await mutateAsync({ id, message }).catch(() => {});
    };

    return { handleComment, error };
};

export default useSendComment;
