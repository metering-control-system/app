import { useRef } from 'react';
import { useRouter } from 'expo-router';
import CameraCapture from '@/shared/components/media/camera/cameraCapture';
import useStorePictures from '@/shared/store/useStorePictures';

const ReportCameraCapture = ({ id, slot }) => {
    const appendPhoto = useStorePictures((state) => state.appendPhoto);
    const cameraRef = useRef();
    const router = useRouter();

    return (
        <CameraCapture
            cameraRef={cameraRef}
            setUri={(uri) => {
                appendPhoto({ entity: 'report', entityId: id, slot, uri });
            }}
            onHandlePhoto={() => router.back()}
            onClose={() => router.back()}
        />
    );
};

export default ReportCameraCapture;
