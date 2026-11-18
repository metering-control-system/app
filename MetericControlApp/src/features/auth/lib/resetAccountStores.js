import useActStore from '@/features/acts/store/useActStore';
import useActTemplatesStore from '@/features/acts/store/useActTemplatesStore';
import useTasksStore from '@/features/tasks/store/useTasksStore';
import useTasksSyncStore from '@/features/tasks/store/useTasksSyncStore';
import useTaskOfflineMutationStore from '@/features/tasks/store/useTaskOfflineMutationStore';
import useReportsStore from '@/features/reports/store/useReportsStore';
import useReportsSyncStore from '@/features/reports/store/useReportsSyncStore';
import useReportDraftStore from '@/features/reports/store/useReportDraftStore';
import useProfileStore from '@/features/settings/store/useProfileStore';
import useSettingsStore from '@/features/settings/store/useSettingsStore';
import useCommentsStore from '@/features/comments/store/useCommentsStore';
import useCommentsSyncStore from '@/features/comments/store/useCommentsSyncStore';
import useStorePictures from '@/shared/store/useStorePictures';

const resetAccountStores = () => {
    useTasksStore.persist.clearStorage();
    useReportsStore.persisit.clearStorage();
    useProfileStore.persist.clearStorage();
    useActStore.getState().clearAllActs();
    useActTemplatesStore.getState().clearTemplates();
    useTasksStore.getState().clearTasks();
    useTasksSyncStore.getState().resetSync();
    useTaskOfflineMutationStore.getState().clearTasksStatuses();
    useReportsStore.getState().clearReports();
    useReportsSyncStore.getState().resetSync();
    useReportDraftStore.getState().clearDrafts();
    useProfileStore.getState().clearProfile();
    useSettingsStore.getState().resetSettings();
    useCommentsStore.getState().clearComments();
    useCommentsSyncStore.getState().resetSync();
    useStorePictures.getState().resetPhotos();
};

export default resetAccountStores;
