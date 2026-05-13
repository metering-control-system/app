import { Pressable, StyleSheet, View } from 'react-native';
import CameraButton from '@/shared/components/media/camera/cameraButton';
import PictureWrapper from '@/shared/components/media/imageWrapper';
import { useState } from 'react';
import ImagePreview from '@/shared/components/media/imagePreview';
import { Entypo } from '@expo/vector-icons';
import ImagePicker from '@/shared/components/media/picker/imagePicker';

export default function MediaBlock({
    uri,
    handleOpenCamera,
    handleDeletePhoto,
    handleUploadPhoto,
    handleUpdatePhoto,
    disabled,
}) {
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <View style={styles.container}>
            <View style={{ width: '100%', gap: 10 }}>
                <CameraButton
                    handleOpenCamera={handleOpenCamera}
                    disabled={disabled}
                />
                <ImagePicker
                    handleUploadPhoto={handleUploadPhoto}
                    disabled={disabled}
                />
            </View>
            <PictureWrapper
                uri={uri}
                onPress={() => {
                    if (!uri) {
                        return;
                    }
                    setModalVisible(true);
                }}
            />
            {uri && (
                <Pressable
                    style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
                    onPress={handleDeletePhoto}>
                    <Entypo name='circle-with-cross' size={20} color='#999' />
                </Pressable>
            )}
            <ImagePreview
                uri={uri}
                handleUpdatePhoto={handleUpdatePhoto}
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
