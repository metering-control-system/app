import { searchQuery } from '@/shared/lib/collections/searchQuery';

export const filterBySearch = ({ query, input }) => {
    if (Array.isArray(query)) {
        const searchedQuery = query.reduce((acc, curr) => {
            const searchText = curr.search;
            const isIncluded = searchQuery({
                input: input.toLowerCase(),
                query: searchText,
            });
            if (isIncluded) {
                return [...acc, curr];
            }
            return acc;
        }, []);
        return searchedQuery;
    }
};
