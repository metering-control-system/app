import { useLocalSearchParams } from 'expo-router';
import TaskCameraCapture from '@/features/tasks/components/taskCameraCapture';

const CameraScreen = () => {
    const { action, id } = useLocalSearchParams();

    if (action === 'tasks') {
        return <TaskCameraCapture id={id} />;
    }

    return null;
};

export default CameraScreen;
