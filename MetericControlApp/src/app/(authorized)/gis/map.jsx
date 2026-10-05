import ScreenLayout from '@/shared/components/screen/screenLayout';
import InteractiveMap from '@/features/gis/components/interactiveMap';
import MapLegend from '@/features/gis/components/mapLegend';
import useTasksStore from '@/features/tasks/store/useTasksStore';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { ControlPanel } from '@/shared/components/control/controlPanel';
import { taskStatus } from '@/features/tasks/constants/taskStatus';
import { taskPriority } from '@/features/tasks/constants/taskPriority';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { filterBy } from '@/features/tasks/lib/filterTasks';
import { filterBySearch } from '@/shared/lib/collections/filterBySearch';
import { MapModeSwitch } from '@/features/gis/components/mapModeSwitch';
import { modes } from '@/features/gis/constants/mapModes';
import Notification from '@/shared/components/notification/Notification';
import useUserGeolocation from '@/features/gis/hooks/useUserGeolocation';
import GeolocationDeterminant from '@/features/gis/components/geolocationDeterminant';

const MapScreen = () => {
    const tasks = useTasksStore((state) => state.tasks);
    const [filtering, setFiltering] = useState(new Set());
    const [search, setSearch] = useState('');
    const [currentMode, setCurrentMode] = useState(modes[0][0]);
    const [focusRequest, setFocusRequest] = useState(0);
    const router = useRouter();

    const { userTile, error, isLocating, locate, dismissError } =
        useUserGeolocation();

    const goToTask = (taskId) => {
        if (!tasks?.some((task) => task.id === taskId)) {
            return;
        }
        router.push(`/(authorized)/taskFlow/taskDetails/${taskId}`);
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

    const handleLocatePress = useCallback(async () => {
        const tile = await locate();
        if (tile) {
            setFocusRequest((request) => request + 1);
        }
    }, [locate]);

    return (
        <ScreenLayout style={{ flex: 1 }}>
            <Notification
                variant='warning'
                message={error}
                handleClose={dismissError}
            />
            <ControlPanel
                filteringVariants={taskFilteringVariants}
                filtering={filtering}
                setFiltering={setFiltering}
                search={search}
                setSearch={setSearch}>
                <MapModeSwitch
                    currentMode={currentMode}
                    setCurrentMode={setCurrentMode}
                />
            </ControlPanel>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <InteractiveMap
                    tasks={selectedTasks}
                    goToTask={goToTask}
                    mode={currentMode}
                    userTile={userTile}
                    focusRequest={focusRequest}
                />
            </GestureHandlerRootView>
            <View style={styles.footer}>
                <View style={styles.legend}>
                    <MapLegend tasks={tasks} mode={currentMode} />
                </View>
                <GeolocationDeterminant
                    onPress={handleLocatePress}
                    isLocating={isLocating}
                />
            </View>
        </ScreenLayout>
    );
};

const styles = StyleSheet.create({
    footer: { flexDirection: 'row', alignItems: 'center', columnGap: 12 },
    legend: { flex: 1 },
});

export default MapScreen;
