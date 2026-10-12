import { Pressable, StyleSheet, View } from 'react-native';
import CameraButton from '@/shared/components/media/camera/cameraButton';
import PictureWrapper from '@/shared/components/media/imageWrapper';
import { useState } from 'react';
import ImagePreview from '@/shared/components/media/imagePreview';
import { Entypo } from '@expo/vector-icons';
import ImagePicker from '@/shared/components/media/picker/imagePicker';

/**
 * Feature-agnostic media panel.
 *
 * Renders:
 * - a button that opens the full-screen camera route;
 * - a button that picks an image from the gallery;
 * - a preview tile that opens `ImagePreview`;
 * - a delete action for the current image.
 *
 * The component does not know where images are stored. The feature that uses
 * it must bind `entity`, `entityId`, and `slot` to callback functions and pass
 * only ready-to-use handlers here.
 *
 * @param {Object} props
 * @param {string | null} props.uri Current image URI from feature/store state.
 * @param {Function} props.handleOpenCamera Opens the shared camera route.
 * @param {Function} props.handleDeletePhoto Deletes the current image.
 * @param {(uri: string) => void} props.handleUploadPhoto Saves gallery image.
 * @param {(uri: string) => void} props.handleUpdatePhoto Saves edited preview.
 * @param {boolean} [props.disabled] Disables camera and gallery actions.
 */
export default function MediaBlock({
    onError,
    uri,
    uris,
    handleOpenCamera,
    handleDeletePhoto,
    handleUploadPhoto,
    handleUpdatePhoto,
    disabled,
    maxSizeBytes,
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
                    onError={onError}
                    handleUploadPhoto={handleUploadPhoto}
                    disabled={disabled}
                    maxSizeBytes={maxSizeBytes}
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
                onError={onError}
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
