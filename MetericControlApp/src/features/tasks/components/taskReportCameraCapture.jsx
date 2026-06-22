import { useRef } from 'react';
import { useRouter } from 'expo-router';
import CameraCapture from '@/shared/components/media/camera/cameraCapture';
import useStorePictures from '@/shared/store/useStorePictures';

const TaskReportCameraCapture = ({ id, slot }) => {
    const setPhoto = useStorePictures((state) => state.setPhoto);
    const cameraRef = useRef();
    const router = useRouter();

    return (
        <CameraCapture
            cameraRef={cameraRef}
            setUri={(uri) => {
                setPhoto({ entity: 'report', entityId: id, slot, uri });
            }}
            onHandlePhoto={() => router.back()}
            onClose={() => router.back()}
        />
    );
};

export default TaskReportCameraCapture;
