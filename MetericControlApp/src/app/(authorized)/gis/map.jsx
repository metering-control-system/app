import ScreenLayout from '@/shared/components/screen/screenLayout';
import InteractiveMap from '@/features/gis/components/interactiveMap';
import MapLegend from '@/features/gis/components/mapLegend';
import useTasksStore from '@/features/tasks/store/useTasksStore';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const MapScreen = () => {
    const tasks = useTasksStore((state) => state.tasks);

    return (
        <ScreenLayout safe style={{ flex: 1 }}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <InteractiveMap tasks={tasks} />
            </GestureHandlerRootView>
            <MapLegend />
        </ScreenLayout>
    );
};

export default MapScreen;
