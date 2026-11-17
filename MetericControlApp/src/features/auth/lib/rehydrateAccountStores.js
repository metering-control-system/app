import useActStore from '@/features/acts/store/useActStore';
import useActTemplatesStore from '@/features/acts/store/useActTemplatesStore';
import useTasksStore from '@/features/tasks/store/useTasksStore';
import useTaskOfflineMutationStore from '@/features/tasks/store/useTaskOfflineMutationStore';
import useReportsStore from '@/features/reports/store/useReportsStore';
import useReportDraftStore from '@/features/reports/store/useReportDraftStore';
import useProfileStore from '@/features/settings/store/useProfileStore';
import useSettingsStore from '@/features/settings/store/useSettingsStore';
import useCommentsStore from '@/features/comments/store/useCommentsStore';
import useStorePictures from '@/shared/store/useStorePictures';

const rehydrateAccountStores = () =>
    Promise.all([
        useActStore.persist.rehydrate(),
        useActTemplatesStore.persist.rehydrate(),
        useTasksStore.persist.rehydrate(),
        useTaskOfflineMutationStore.persist.rehydrate(),
        useReportsStore.persist.rehydrate(),
        useReportDraftStore.persist.rehydrate(),
        useProfileStore.persist.rehydrate(),
        useSettingsStore.persist.rehydrate(),
        useCommentsStore.persist.rehydrate(),
        useStorePictures.persist.rehydrate(),
    ]);

export default rehydrateAccountStores;
