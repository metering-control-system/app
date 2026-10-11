import { useCallback } from 'react';
import { useRouter } from 'expo-router';

const useReportCommentNavigation = (reportId) => {
    const router = useRouter();
    return useCallback(
        (reference) => {
            router.push({
                pathname: `/(authorized)/reportDetails/${reportId}`,
                params: { reference },
            });
        },
        [router, reportId]
    );
};

export default useReportCommentNavigation;
