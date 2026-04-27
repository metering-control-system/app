import { useRef } from 'react';
import CameraCapture from '@/shared/components/camera/cameraCapture';
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
            ref={cameraRef}
            setUri={(uri) =>
                setPhoto({
                    entity: 'task',
                    entityId: id,
                    slot: 'new_meteric_control',
                    uri,
                })
            }
            onHandlePhoto={onHandlePhoto}
        />
    );
};

export default TaskCameraCapture;
