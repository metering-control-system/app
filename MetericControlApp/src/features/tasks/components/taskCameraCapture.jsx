import { useRef } from 'react';
import CameraCapture from '@/shared/components/media/camera/cameraCapture';
import useStorePictures from '@/shared/store/useStorePictures';
import { useRouter } from 'expo-router';

/**
 * Task-specific camera integration.
 *
 * This wrapper binds the common camera to the task image storage path:
 * entity = `task`, entityId = task id, slot = `new_meteric_control`.
 *
 * Create the same kind of wrapper for every feature that needs camera support,
 * for example `ReportCameraCapture`, and pass feature-specific entity/slot
 * values to `useStorePictures().setPhoto`.
 *
 * @param {Object} props
 * @param {string | number} props.id Task id from the camera route params.
 */
const TaskCameraCapture = ({ id }) => {
    const setPhoto = useStorePictures((state) => state.setPhoto);
    const cameraRef = useRef();
    const router = useRouter();

    const onHandlePhoto = () => {
        router.back();
    };

    return (
        <CameraCapture
            cameraRef={cameraRef}
            setUri={(uri) => {
                setPhoto({
                    entity: 'task',
                    entityId: id,
                    slot: 'new_meteric_control',
                    uri,
                });
            }}
            onHandlePhoto={onHandlePhoto}
            onClose={() => router.back()}
        />
    );
};

export default TaskCameraCapture;
