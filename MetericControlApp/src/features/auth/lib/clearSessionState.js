import tokenStorage from '@/features/auth/lib/tokenStorage';
import useAuth from '@/features/auth/store/useAuth';
import useTasksStore from '@/features/tasks/store/useTasksStore';
import useReportsStore from '@/features/reports/store/useReportsStore';
import useProfileStore from '@/features/settings/store/useProfileStore';

const clearSessionState = async (queryClient) => {
    useAuth.getState().cancelRequests();
    await queryClient.cancelQueries();
    queryClient.clear();
    try {
        await tokenStorage.clearTokens();
        useTasksStore.persist.clearStorage();
        useReportsStore.persist.clearStorage();
        useProfileStore.persist.clearStorage();
    } finally {
        useAuth.getState().clearSession();
    }
};

export default clearSessionState;
