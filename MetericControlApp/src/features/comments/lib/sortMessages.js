import { compareTimes } from '@/shared/lib/collections/compareTimes';

export const sortMessages = (messages) => {
    if (Array.isArray(messages)) {
        return [...messages].sort((a, b) => {
            return compareTimes(a?.created_at, b?.created_at, -1);
        });
    }

    return messages;
};
