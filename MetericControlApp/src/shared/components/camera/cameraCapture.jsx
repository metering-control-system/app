import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Button, Pressable, StyleSheet, Text, View } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';

export default function CameraCapture({ ref, setUri, onHandlePhoto }) {
    const [facing, setFacing] = useState('back');
    const [permission, requestPermission] = useCameraPermissions();

    const takePicture = async () => {
        const photo = await ref.current?.takePictureAsync();
        if (photo?.uri) setUri(photo.uri);
        onHandlePhoto();
    };

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>
                    We need your permission to show the camera
                </Text>
                <Button onPress={requestPermission} title='grant permission' />
            </View>
        );
    }

    function toggleCameraFacing() {
        setFacing((current) => (current === 'back' ? 'front' : 'back'));
    }

    return (
        <View style={styles.cameraContainer}>
            <CameraView
                style={styles.camera}
                ref={ref}
                facing={facing}
                mute={false}
                responsiveOrientationWhenOrientationLocked
            />
            <View style={styles.shutterContainer}>
                <Pressable onPress={takePicture} style={styles.shutterView}>
                    {({ pressed }) => (
                        <View
                            style={[
                                styles.shutterBtn,
                                { opacity: pressed ? 0.5 : 1 },
                            ]}>
                            <View
                                style={[
                                    styles.shutterBtnInner,
                                    { backgroundColor: 'white' },
                                ]}
                            />
                        </View>
                    )}
                </Pressable>
                <Pressable
                    onPress={toggleCameraFacing}
                    style={styles.rotateView}>
                    <FontAwesome6 name='rotate-left' size={32} color='white' />
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cameraContainer: StyleSheet.absoluteFillObject,
    camera: StyleSheet.absoluteFillObject,
    shutterContainer: {
        position: 'absolute',
        bottom: 44,
        left: 0,
        width: '100%',
        flexDirection: 'row',
        paddingHorizontal: 30,
    },
    shutterView: { position: 'relative', left: '35%' },
    shutterBtn: {
        backgroundColor: 'transparent',
        borderWidth: 5,
        borderColor: 'white',
        width: 85,
        height: 85,
        borderRadius: 45,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-end',
    },
    shutterBtnInner: { width: 70, height: 70, borderRadius: 50 },
    rotateView: { position: 'relative', left: '60%', bottom: '-25%' },
});
