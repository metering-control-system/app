import { useLocalSearchParams } from 'expo-router';
import TaskCameraCapture from '@/features/tasks/components/taskCameraCapture';
import ReportCameraCapture from '@/features/reports/components/reportCameraCapture';

/**
 * Shared camera route.
 *
 * Feature screens navigate here with an `action` param. The route uses that
 * param to render the correct feature-specific camera wrapper. Add another
 * branch when a new feature needs camera support.
 *
 * Example:
 * router.push({
 *     pathname: '/(authorized)/camera',
 *     params: { action: 'tasks', id: taskId },
 * });
 */
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
