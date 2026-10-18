import { selectReportForTask } from '@/features/reports/lib/reportUpsert';
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
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { filterBy } from '@/features/tasks/lib/filterTasks';
import { filterBySearch } from '@/shared/lib/collections/filterBySearch';
import { MapModeSwitch } from '@/features/gis/components/mapModeSwitch';
import Notification from '@/shared/components/notification/Notification';
import useMapUserGeolocation from '@/features/gis/hooks/useMapUserGeolocation';
import MapActionsPanel from '@/features/gis/components/mapActionsPanel';
import { MapTaskList } from '@/features/gis/components/mapTaskList';
import { useMapTaskIndex } from '@/features/gis/hooks/useMapTaskIndex';
import { useMapMode } from '@/features/gis/hooks/useMapMode';
import useReportsStore from '@/features/reports/store/useReportsStore';
import useReportDraftStore from '@/features/reports/store/useReportDraftStore';
import useTaskReports from '@/features/reports/hooks/useTaskReports';
import { filterSubmittedTasks } from '@/features/tasks/lib/taskReportVisibility';

const MapScreen = () => {
    const tasks = useTasksStore((state) => state.tasks);
    const reports = useReportsStore((state) => state.reports);
    const drafts = useReportDraftStore((state) => state.drafts);
    useTaskReports();
    const [filtering, setFiltering] = useState(new Set());
    const [search, setSearch] = useState('');
    const [focusRequest, setFocusRequest] = useState(0);
    const [resetRequest, setResetRequest] = useState(0);
    const [showUnmapped, setShowUnmapped] = useState(false);
    const router = useRouter();
    const { userTile, error, isLocating, locate, dismissError } =
        useMapUserGeolocation();

    const goToTask = (taskId) => {
        if (!tasks?.some((task) => task.id === taskId)) {
            return;
        }
        setShowUnmapped(false);
        router.push(`/(authorized)/taskFlow/${taskId}`);
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
            filterSubmittedTasks(
                tasks,
                (taskId) => selectReportForTask(reports, taskId),
                drafts
            )
        );
        return filterBySearch({ query: filtered, input: search });
    }, [tasks, reports, drafts, filtering, search]);

    const [isTiledMap, setIsTiledMap] = useState(false);
    const { tasksByDistrict, tasksByTile, unmappedTasks } =
        useMapTaskIndex(selectedTasks);
    const {
        currentMode,
        setCurrentMode,
        selectMapColorPaletteByMode,
        districts,
        tiles,
    } = useMapMode({ tasksByDistrict, tasksByTile });

    const handleLocatePress = useCallback(async () => {
        const tile = await locate();
        if (tile) {
            setFocusRequest((request) => request + 1);
        }
    }, [locate]);

    const handleReset = useCallback(() => {
        setShowUnmapped(false);
        setResetRequest((request) => request + 1);
    }, []);
    const openUnmapped = useCallback(() => setShowUnmapped(true), []);
    const closeUnmapped = useCallback(() => setShowUnmapped(false), []);

    return (
        <ScreenLayout style={{ flex: 1 }}>
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
                    tasksByTile={tasksByTile}
                    tasksByDistrict={tasksByDistrict}
                    goToTask={goToTask}
                    isTiledMap={isTiledMap}
                    setIsTiledMap={setIsTiledMap}
                    userTile={userTile}
                    resetRequest={resetRequest}
                    focusRequest={focusRequest}
                    selectMapColorPaletteByMode={selectMapColorPaletteByMode}
                />
            </GestureHandlerRootView>
            <View style={styles.legend}>
                <MapLegend
                    scale={isTiledMap ? tiles : districts}
                    mode={currentMode}
                    isTiledMap={isTiledMap}
                />
            </View>
            <MapActionsPanel
                onLocate={handleLocatePress}
                isLocating={isLocating}
                onReset={handleReset}
                onUnmappedPress={openUnmapped}
                unmappedCount={unmappedTasks.length}
            />
            <Modal
                visible={showUnmapped}
                transparent
                animationType='fade'
                onRequestClose={closeUnmapped}>
                <View style={styles.modal}>
                    <Pressable
                        style={StyleSheet.absoluteFill}
                        onPress={closeUnmapped}
                        accessibilityLabel='Закрыть список'
                        accessibilityRole='button'
                    />
                    <MapTaskList
                        title='Задачи вне карты'
                        selectedTasks={unmappedTasks}
                        goToTask={goToTask}
                        onClose={closeUnmapped}
                        style={styles.unmappedList}
                    />
                </View>
            </Modal>
            <Notification
                variant='warning'
                message={error}
                handleClose={dismissError}
            />
        </ScreenLayout>
    );
};

const styles = StyleSheet.create({
    legend: { paddingRight: 64 },
    modal: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
    },
    unmappedList: { position: 'relative', maxHeight: '75%' },
});

export default MapScreen;
