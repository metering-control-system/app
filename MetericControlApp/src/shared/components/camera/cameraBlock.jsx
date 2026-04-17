import { Pressable, StyleSheet, View } from 'react-native';
import CameraButton from '@/shared/components/camera/cameraButton';
import PictureWrapper from '@/shared/components/wrapper/pictureCameraWrapper';
import { useState } from 'react';
import PhotoPreviewModal from '@/shared/components/modal/photoPreviewModal';
import { Entypo } from '@expo/vector-icons';

export default function CameraBlock({
    uri,
    handleOpenCamera,
    handleDeletePhoto,
}) {
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <View style={styles.container}>
            <CameraButton handleOpenCamera={handleOpenCamera} />
            <PictureWrapper
                uri={uri}
                onPress={() => {
                    if (!uri) {
                        return;
                    }
                    setModalVisible(true);
                }}
            />
            <Pressable
                style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
                onPress={handleDeletePhoto}>
                <Entypo name='circle-with-cross' size={20} color='#999' />
            </Pressable>
            <PhotoPreviewModal
                uri={uri}
                setModalVisible={setModalVisible}
                modalVisible={modalVisible}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        gap: 10,
        alignItems: 'flex-start',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
});
