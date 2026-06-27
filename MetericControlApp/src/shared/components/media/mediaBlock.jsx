import { Pressable, StyleSheet, View } from 'react-native';
import CameraButton from '@/shared/components/media/camera/cameraButton';
import PictureWrapper from '@/shared/components/media/imageWrapper';
import { useState } from 'react';
import ImagePreview from '@/shared/components/media/imagePreview';
import { Entypo } from '@expo/vector-icons';
import ImagePicker from '@/shared/components/media/picker/imagePicker';

export default function MediaBlock({
    uri,
    uris,
    handleOpenCamera,
    handleDeletePhoto,
    handleUploadPhoto,
    handleUpdatePhoto,
    disabled,
}) {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const imageUris = Array.isArray(uris) ? uris : uri ? [uri] : [];
    const selectedUri = imageUris[selectedIndex] ?? null;

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
            {imageUris.length ? (
                imageUris.map((itemUri, index) => (
                    <View
                        key={`${itemUri}-${index}`}
                        style={styles.previewWrap}>
                        <PictureWrapper
                            uri={itemUri}
                            onPress={() => {
                                setSelectedIndex(index);
                                setModalVisible(true);
                            }}
                        />
                        <Pressable
                            style={({ pressed }) => [
                                styles.deleteButton,
                                pressed && styles.deleteButtonPressed,
                            ]}
                            onPress={() => handleDeletePhoto(index)}>
                            <Entypo
                                name='circle-with-cross'
                                size={20}
                                color='#999'
                            />
                        </Pressable>
                    </View>
                ))
            ) : (
                <PictureWrapper uri={null} onPress={() => {}} />
            )}
            <ImagePreview
                uri={selectedUri}
                handleUpdatePhoto={(nextUri) =>
                    handleUpdatePhoto(nextUri, selectedIndex)
                }
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
    previewWrap: { gap: 6, alignItems: 'flex-end' },
    deleteButton: {},
    deleteButtonPressed: { opacity: 0.75 },
});
