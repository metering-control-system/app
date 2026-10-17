import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import { Alert, AppState, Pressable, StyleSheet, View } from 'react-native';
import {
    FontAwesome6,
    Ionicons,
    MaterialCommunityIcons,
} from '@expo/vector-icons';
import CameraPermissionScreen from '@/shared/components/media/camera/cameraPermissionScreen';
import ScreenLayout from '@/shared/components/screen/screenLayout';
import { compressCapturedImage } from '@/shared/lib/media/compressCapturedImage';
import * as Linking from 'expo-linking';

const flashModes = ['off', 'on', 'auto'];

/**
 * Shared full-screen camera UI.
 *
 * This component owns camera permissions, camera facing, flash, torch, capture
 * state, and image compression. It does not know anything about tasks, reports,
 * or store paths. Feature wrappers pass `setUri` to decide where the captured
 * image should be saved.
 *
 * Typical flow:
 * 1. A feature screen opens `/(authorized)/camera` with route params.
 * 2. The shared camera route chooses the matching feature wrapper.
 * 3. The feature wrapper renders `CameraCapture` with a feature-bound `setUri`.
 * 4. `CameraCapture` captures/compresses an image and calls `setUri(uri)`.
 *
 * @param {Object} props
 * @param {import('react').RefObject<import('expo-camera').CameraView>} props.cameraRef
 * Camera ref created by a feature wrapper.
 * @param {(uri: string) => void} props.setUri Stores the captured image URI.
 * @param {Function} [props.onHandlePhoto] Called after a photo is saved.
 * @param {Function} props.onClose Called when the user closes the camera.
 */
export default function CameraCapture({
    cameraRef,
    setUri,
    onHandlePhoto,
    onClose,
}) {
    const [facing, setFacing] = useState('back');
    const [permission, requestPermission, getPermission] =
        useCameraPermissions();
    const requestingPermission = useRef(false);
    const [flashMode, setFlashMode] = useState('off');
    const [torchEnabled, setTorchEnabled] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [tapPoint, setTapPoint] = useState(null);
    const tapPointTimer = useRef(null);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active' && !requestingPermission.current) {
                void getPermission().catch(() => undefined);
            }
        });
        return () => subscription.remove();
    }, [getPermission]);

    const handleRequestPermission = async () => {
        if (requestingPermission.current) return;
        requestingPermission.current = true;
        try {
            const result = await requestPermission();
            if (!result.granted && !result.canAskAgain) {
                Alert.alert(
                    'Доступ к камере отключён',
                    'Система не разрешила доступ к камере. Его можно включить в настройках приложения.',
                    [
                        { text: 'Отмена', style: 'cancel' },
                        {
                            text: 'Открыть настройки',
                            onPress: () => {
                                void Linking.openSettings().catch(() =>
                                    Alert.alert(
                                        'Не удалось открыть настройки',
                                        'Откройте разрешения приложения в настройках устройства.'
                                    )
                                );
                            },
                        },
                    ]
                );
            }
        } catch {
            Alert.alert(
                'Не удалось запросить доступ к камере',
                'Попробуйте ещё раз.'
            );
        } finally {
            requestingPermission.current = false;
        }
    };

    useEffect(() => {
        return () => {
            if (tapPointTimer.current) {
                clearTimeout(tapPointTimer.current);
            }
        };
    }, []);

    const handlePreviewTap = ({ nativeEvent }) => {
        setTapPoint({ x: nativeEvent.locationX, y: nativeEvent.locationY });

        if (tapPointTimer.current) {
            clearTimeout(tapPointTimer.current);
        }

        tapPointTimer.current = setTimeout(() => {
            setTapPoint(null);
        }, 700);
    };

    const takePicture = async () => {
        if (!cameraRef?.current || isCapturing || !isCameraReady) {
            return;
        }

        setIsCapturing(true);

        try {
            const photo = await cameraRef.current.takePictureAsync({
                quality: 1,
            });

            if (photo?.uri) {
                const processedUri = await compressCapturedImage(
                    photo.uri
                ).catch(() => photo.uri);
                setUri(processedUri);
                onHandlePhoto?.();
            }
        } finally {
            setIsCapturing(false);
        }
    };

    const toggleCameraFacing = () => {
        setFacing((current) => (current === 'back' ? 'front' : 'back'));
    };

    const cycleFlashMode = () => {
        setFlashMode((current) => {
            const currentIndex = flashModes.indexOf(current);
            return flashModes[(currentIndex + 1) % flashModes.length];
        });
    };

    const getFlashIconName = () => {
        if (flashMode === 'on') {
            return 'flash';
        }

        if (flashMode === 'auto') {
            return 'flash-auto';
        }

        return 'flash-off';
    };

    if (!permission) {
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        return (
            <CameraPermissionScreen
                style={styles.container}
                requestPermission={handleRequestPermission}
            />
        );
    }

    return (
        <View style={styles.cameraContainer}>
            <CameraView
                style={styles.camera}
                ref={cameraRef}
                facing={facing}
                flash={flashMode}
                enableTorch={torchEnabled}
                responsiveOrientationWhenOrientationLocked
                onCameraReady={() => setIsCameraReady(true)}
                onMountError={() => setIsCameraReady(false)}
            />

            <Pressable
                style={styles.previewTouchArea}
                onPress={handlePreviewTap}>
                {tapPoint && (
                    <View
                        pointerEvents='none'
                        style={[
                            styles.focusRing,
                            { left: tapPoint.x - 22, top: tapPoint.y - 22 },
                        ]}
                    />
                )}
            </Pressable>

            <ScreenLayout safe style={[styles.topBar]}>
                <Pressable
                    onPress={onClose}
                    style={({ pressed }) => [
                        styles.iconButton,
                        pressed && styles.iconButtonPressed,
                    ]}>
                    <Ionicons name='close' size={26} color='#fff' />
                </Pressable>

                <View style={styles.topBarActions}>
                    <Pressable
                        onPress={cycleFlashMode}
                        style={({ pressed }) => [
                            styles.iconButton,
                            pressed && styles.iconButtonPressed,
                        ]}>
                        <MaterialCommunityIcons
                            name={getFlashIconName()}
                            size={24}
                            color={flashMode === 'off' ? '#fff' : '#ffd24d'}
                        />
                    </Pressable>

                    <Pressable
                        onPress={() => setTorchEnabled((current) => !current)}
                        style={({ pressed }) => [
                            styles.iconButton,
                            pressed && styles.iconButtonPressed,
                        ]}>
                        <Ionicons
                            name={
                                torchEnabled
                                    ? 'flashlight'
                                    : 'flashlight-outline'
                            }
                            size={22}
                            color={torchEnabled ? '#ffd24d' : '#fff'}
                        />
                    </Pressable>
                </View>
            </ScreenLayout>

            <ScreenLayout safe style={styles.bottomBar}>
                <Pressable
                    disabled={isCapturing || !isCameraReady}
                    onPress={takePicture}
                    style={({ pressed }) => [
                        styles.shutterBtn,
                        (pressed || isCapturing || !isCameraReady) &&
                            styles.shutterPressed,
                    ]}>
                    <View
                        style={[
                            styles.shutterBtnInner,
                            isCapturing && styles.shutterBtnInnerActive,
                        ]}
                    />
                </Pressable>

                <Pressable
                    onPress={toggleCameraFacing}
                    style={({ pressed }) => [
                        styles.iconButton,
                        styles.rotateButton,
                        pressed && styles.iconButtonPressed,
                    ]}>
                    <FontAwesome6 name='rotate-left' size={24} color='#fff' />
                </Pressable>
            </ScreenLayout>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    cameraContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000',
    },
    camera: StyleSheet.absoluteFillObject,
    previewTouchArea: StyleSheet.absoluteFillObject,
    focusRing: {
        position: 'absolute',
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: '#ffd24d',
        backgroundColor: 'rgba(255, 210, 77, 0.12)',
    },
    topBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    topBarActions: { flexDirection: 'row', gap: 12 },
    bottomBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    iconButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.36)',
    },
    iconButtonPressed: { opacity: 0.7 },
    shutterBtn: {
        width: 86,
        height: 86,
        borderRadius: 43,
        borderWidth: 5,
        borderColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    shutterBtnInner: {
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: '#fff',
    },
    shutterBtnInnerActive: { transform: [{ scale: 0.9 }] },
    shutterPressed: { opacity: 0.7 },
    rotateButton: { position: 'absolute', right: 24, bottom: 28 },
});
