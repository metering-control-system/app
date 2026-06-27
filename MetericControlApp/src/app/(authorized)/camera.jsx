import { useLocalSearchParams } from 'expo-router';
import TaskCameraCapture from '@/features/tasks/components/taskCameraCapture';
import ReportCameraCapture from '@/features/reports/components/reportCameraCapture';

const CameraScreen = () => {
    const { action, id, slot } = useLocalSearchParams();

    if (action === 'tasks') {
        return <TaskCameraCapture id={id} />;
    }

    if (action === 'reports' && slot) {
        return <ReportCameraCapture id={id} slot={slot} />;
    }

    return null;
};

export default CameraScreen;
