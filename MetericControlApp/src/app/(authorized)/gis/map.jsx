import ScreenLayout from '@/shared/components/screen/screenLayout';
import InteractiveMap from '@/features/gis/components/interactiveMap';
import MapLegend from '@/features/gis/components/mapLegend';
import useTasksStore from '@/features/tasks/store/useTasksStore';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { ControlPanel } from '@/shared/components/control/controlPanel';
import { taskStatus } from '@/features/tasks/constants/taskStatus';
import { taskPriority } from '@/features/tasks/constants/taskPriority';
import { useMemo, useState } from 'react';
import { filterBy } from '@/features/tasks/lib/filterTasks';
import { filterBySearch } from '@/shared/lib/collections/filterBySearch';

const MapScreen = () => {
    const tasks = useTasksStore((state) => state.tasks);
    const [filtering, setFiltering] = useState(new Set());
    const [search, setSearch] = useState('');
    const router = useRouter();

    const goToTask = (taskId) => {
        if (!tasks?.some((task) => task.id === taskId)) {
            return;
        }
        router.push(`/(authorized)/taskDetails/${taskId}`);
    };

    const taskFilteringVariants = Object.entries(taskStatus).concat(
        Object.entries(taskPriority)
    );

    const selectedTasks = useMemo(() => {
        const selected = [...filtering];
        const tasksStatuses = selected.filter((s) => taskStatus[s]);
        const tasksPriority = selected.filter((s) => taskPriority[s]);
        const filtered = filterBy(
            { statuses: tasksStatuses, priority: tasksPriority },
            tasks
        );
        return filterBySearch({ query: filtered, input: search });
    }, [tasks, filtering, search]);

    return (
        <ScreenLayout style={{ flex: 1 }}>
            <ControlPanel
                filteringVariants={taskFilteringVariants}
                filtering={filtering}
                setFiltering={setFiltering}
                search={search}
                setSearch={setSearch}
            />
            <GestureHandlerRootView style={{ flex: 1 }}>
                <InteractiveMap tasks={selectedTasks} goToTask={goToTask} />
            </GestureHandlerRootView>
            <MapLegend />
        </ScreenLayout>
    );
};

export default MapScreen;
