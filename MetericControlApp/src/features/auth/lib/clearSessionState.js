import tokenStorage from '@/features/auth/lib/tokenStorage';
import useAuth from '@/features/auth/store/useAuth';
import useTasksSyncStore from '@/features/tasks/store/useTasksSyncStore';
import useStorePictures from '@/shared/store/useStorePictures';
import useTasksStore from '@/features/tasks/store/useTasksStore';

const clearSessionState = async (queryClient) => {
    await tokenStorage.clearTokens();
    useAuth.getState().clearSession();
    useTasksSyncStore.getState().setLastSyncAt(null);
    useTasksSyncStore.getState().setListSnapshotAt(null);
    useTasksStore.getState().clearTasks();
    queryClient.removeQueries();
    useStorePictures.getState().resetPhotos();
};

export default clearSessionState;
