import TasksList from '@/features/tasks/components/taskList';
import ScreenLayout from '@/shared/components/screen/screenLayout';
import { useState } from 'react';
import Notification from '@/shared/components/notification/Notification';
import { sortingVariants } from '@/features/tasks/constants/taskSortingVariants';
import { taskStatus } from '@/features/tasks/constants/taskStatus';
import { taskPriority } from '@/features/tasks/constants/taskPriority';
import { ControlPanel } from '@/shared/components/control/controlPanel';
import useTaskOfflineMutationStore from '@/features/tasks/store/useTaskOfflineMutationStore';
import { useOfflineTasksSync } from '@/features/tasks/hooks/useOfflineTasksSync';
import { useOfflineReportsSync } from '@/features/reports/hooks/useOfflineReportsSync';
import useReportDraftStore from '@/features/reports/store/useReportDraftStore';
import { OverlayButton } from '@/shared/components/button/overlayButton';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const TaskScreen = () => {
    const [error, setError] = useState(null);
    const router = useRouter();

    const [filtering, setFiltering] = useState(new Set());
    const [sorting, setSorting] = useState(null);
    const [search, setSearch] = useState('');

    const taskSortingVariants = Object.entries(sortingVariants);
    const taskFilteringVariants = Object.entries(taskStatus).concat(
        Object.entries(taskPriority)
    );

    const syncTasks = useOfflineTasksSync();
    const pendingCount = useTaskOfflineMutationStore(
        (state) => Object.keys(state.tasksStatuses ?? {}).length
    );

    const syncReportsRecords = useOfflineReportsSync();
    const reportsPending = Object.entries(
        useReportDraftStore((state) => state.drafts)
    ).reduce((prev, curr) => {
        if (curr[1].reportState === 'pending') {
            return { ...prev, [curr[0]]: curr[1] };
        }
        return prev;
    }, {});

    const reportsPendingCount = Object.keys(reportsPending).length;

    return (
        <ScreenLayout safe>
            {error && (
                <Notification
                    variant='warning'
                    message={error}
                    handleClose={() => setError(null)}
                />
            )}
            <ControlPanel
                filteringVariants={taskFilteringVariants}
                sortingVariants={taskSortingVariants}
                filtering={filtering}
                setFiltering={setFiltering}
                sorting={sorting}
                setSorting={setSorting}
                setSearch={setSearch}
                search={search}
            />
            <TasksList
                setError={setError}
                sorting={sorting}
                filtering={filtering}
                search={search}
                sync={async () => {
                    if (pendingCount) {
                        void syncTasks();
                    }
                    if (reportsPendingCount) {
                        return await syncReportsRecords();
                    }
                }}
                syncingRecords={reportsPending}
            />
            <OverlayButton
                onPress={() => router.push('/(authorized)/gis/map')}
                icon={<FontAwesome name='map' size={20} color='white' />}
            />
        </ScreenLayout>
    );
};

export default TaskScreen;
