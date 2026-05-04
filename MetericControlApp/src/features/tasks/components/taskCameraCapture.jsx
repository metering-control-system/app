import { useRef } from 'react';
import CameraCapture from '@/shared/components/media/camera/cameraCapture';
import useStorePictures from '@/shared/store/useStorePictures';
import { useRouter } from 'expo-router';

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
