import { useLocalSearchParams } from 'expo-router';
import TaskCameraCapture from '@/features/tasks/components/taskCameraCapture';
import TaskReportCameraCapture from '@/features/tasks/components/taskReportCameraCapture';

const CameraScreen = () => {
    const { action, id, slot } = useLocalSearchParams();

    if (action === 'tasks') {
        return <TaskCameraCapture id={id} />;
    }

    if (action === 'task-report' && slot) {
        return <TaskReportCameraCapture id={id} slot={slot} />;
    }

    return null;
};

export default CameraScreen;
