export const searchQuery = ({ input, query }) => {
    if (typeof query === 'string' && typeof input === 'string') {
        return query.includes(input);
    }
    return false;
};
