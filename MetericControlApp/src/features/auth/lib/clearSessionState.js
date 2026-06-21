import tokenStorage from '@/features/auth/lib/tokenStorage';
import useAuth from '@/features/auth/store/useAuth';
import useTasksSyncStore from '@/features/tasks/store/useTasksSyncStore';
import useStorePictures from '@/shared/store/useStorePictures';
import useTasksStore from '@/features/tasks/store/useTasksStore';
import useTaskOfflineMutationStore from '@/features/tasks/store/useTaskOfflineMutationStore';
import useReportsStore from '@/features/reports/store/useReportsStore';

const clearSessionState = async (queryClient) => {
    await tokenStorage.clearTokens();
    useAuth.getState().clearSession();
    useTasksSyncStore.getState().setLastSyncAt(null);
    useTasksSyncStore.getState().setListSnapshotAt(null);
    useTasksStore.getState().clearTasks();
    queryClient.removeQueries();
    useStorePictures.getState().resetPhotos();
    useTaskOfflineMutationStore.getState().clearTasksStatuses();
    useTaskOfflineMutationStore.persist.clearStorage();
    useTasksStore.persist.clearStorage();
    useReportsStore.getState().clearReports();
    useReportsStore.persist.clearStorage();
};

export default clearSessionState;
