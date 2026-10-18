import useReportActStore from '@/features/reports/store/useReportActStore';
import tokenStorage from '@/features/auth/lib/tokenStorage';
import useAuth from '@/features/auth/store/useAuth';
import useTasksSyncStore from '@/features/tasks/store/useTasksSyncStore';
import useStorePictures from '@/shared/store/useStorePictures';
import useTasksStore from '@/features/tasks/store/useTasksStore';
import useTaskOfflineMutationStore from '@/features/tasks/store/useTaskOfflineMutationStore';
import useReportsStore from '@/features/reports/store/useReportsStore';
import useReportsSyncStore from '@/features/reports/store/useReportsSyncStore';
import useProfileStore from '@/features/settings/store/useProfileStore';
import useCommentsStore from '@/features/comments/store/useCommentsStore';
import useActTemplatesStore from '@/features/acts/store/useActTemplatesStore';

const clearSessionState = async (queryClient) => {
    useReportActStore.getState().clearAllActs();
    useReportActStore.persist.clearStorage();
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
    useReportsSyncStore.getState().resetSync();
    useReportsStore.persist.clearStorage();
    useProfileStore.getState().clearProfile();
    useProfileStore.persist.clearStorage();
    useCommentsStore.getState().clearComments();
    useCommentsStore.persist.clearStorage();
    useActTemplatesStore.getState().clearTemplates();
    useActTemplatesStore.persist.clearStorage();
};

export default clearSessionState;
