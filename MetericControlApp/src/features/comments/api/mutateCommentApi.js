import { baseApi } from '@/shared/api/baseApi';

export const sendComment = ({ id, message }) => {
    return baseApi
        .post(`/tasks/${id}/comments/`, { content: message })
        .then((response) => response.data);
};

export const updateComment = ({ commentId, content }) => {
    return baseApi
        .patch(`comments/${commentId}/`, { content })
        .then((response) => response.data);
};

export const deleteComment = ({ commentId }) => {
    return baseApi.delete(`comments/${commentId}/`);
};
