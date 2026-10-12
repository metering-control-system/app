import {
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Image from '@/shared/components/media/authenticatedImage';
import { FontAwesome6, Ionicons } from '@expo/vector-icons';
import {
    GestureViewer,
    useGestureViewerController,
    useGestureViewerEvent,
} from 'react-native-gesture-image-viewer';
import { useEffect, useId, useState } from 'react';
import { applyPreviewImageRotation } from '@/shared/lib/media/applyPreviewImageRotation';

const ImagePreview = ({
    onError,
    uri,
    modalVisible,
    setModalVisible,
    handleUpdatePhoto,
    editable = true,
}) => {
    const viewerId = useId();
    const canEdit = editable && typeof handleUpdatePhoto === 'function';
    const { rotate } = useGestureViewerController(viewerId);
    const [currentRotate, setCurrentRotate] = useState(0);
    const [isApplying, setIsApplying] = useState(false);

    useEffect(() => {
        if (!modalVisible) {
            setCurrentRotate(0);
        }
    }, [modalVisible]);

    useGestureViewerEvent(viewerId, 'rotationChange', (data) => {
        if (Number.isInteger(data.rotation / 90)) {
            setCurrentRotate(data.rotation);
        }
    });

    const applyChanges = async () => {
        if (!uri || !canEdit || isApplying) {
            return;
        }

        setIsApplying(true);

        try {
            const updatedUri = await applyPreviewImageRotation({
                uri,
                rotation: currentRotate,
            });

            handleUpdatePhoto(updatedUri);
            setCurrentRotate(0);
            closeModal();
        } catch {
            closeModal();
            onError(
                'Не удалось сохранить изменения фотографии',
                'Откройте фото и попробуйте повернуть его ещё раз.'
            );
        } finally {
            setIsApplying(false);
        }
    };

    const closeModal = () => {
        setModalVisible(false);
    };

    if (!uri || !modalVisible) {
        return null;
    }

    return (
        <Modal
            visible={modalVisible}
            transparent
            statusBarTranslucent
            animationType='fade'
            onRequestClose={closeModal}>
            <GestureViewer
                key={uri}
                id={viewerId}
                data={[uri]}
                ListComponent={FlatList}
                onDismiss={closeModal}
                renderItem={(item) => (
                    <Image
                        source={{ uri: item }}
                        style={styles.image}
                        contentFit='contain'
                        onError={() => {
                            closeModal();
                            onError?.(
                                'Не удалось открыть фотографию',
                                'Файл недоступен. Проверьте подключение или загрузите отчёт заново.'
                            );
                        }}
                    />
                )}
                renderContainer={(children) => (
                    <View style={styles.overlay}>
                        {children}
                        <View style={styles.header}>
                            <Pressable
                                onPress={closeModal}
                                style={({ pressed }) => [
                                    styles.closeButton,
                                    pressed && styles.buttonPressed,
                                ]}>
                                <Ionicons name='close' size={24} color='#fff' />
                            </Pressable>
                            {canEdit && (
                                <Pressable
                                    disabled={isApplying}
                                    onPress={applyChanges}
                                    style={({ pressed }) => [
                                        styles.applyButton,
                                        (pressed || isApplying) &&
                                            styles.buttonPressed,
                                    ]}>
                                    <Text style={styles.applyButtonText}>
                                        {isApplying ? 'Сохраняем' : 'Применить'}
                                    </Text>
                                </Pressable>
                            )}
                        </View>
                        {canEdit && (
                            <View style={styles.bottomBar}>
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.toolbarButton,
                                        pressed && styles.buttonPressed,
                                    ]}
                                    onPress={() => rotate(90, false)}>
                                    <FontAwesome6
                                        name='rotate-left'
                                        size={24}
                                        color='#fff'
                                    />
                                </Pressable>
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.toolbarButton,
                                        pressed && styles.buttonPressed,
                                    ]}
                                    onPress={() => rotate(90, true)}>
                                    <FontAwesome6
                                        name='rotate-right'
                                        size={24}
                                        color='#fff'
                                    />
                                </Pressable>
                            </View>
                        )}
                    </View>
                )}
            />
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.82)',
        position: 'relative',
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 56,
        paddingBottom: 12,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.14)',
    },
    bottomBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
        paddingHorizontal: 24,
        paddingBottom: 32,
    },
    buttonPressed: { opacity: 0.7 },
    applyButton: {
        borderRadius: 20,
        backgroundColor: 'white',
        paddingHorizontal: 8,
        paddingVertical: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    applyButtonText: { color: '#111', fontWeight: '600' },
    toolbarButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.14)',
    },
    image: { width: '100%', height: '100%' },
});

export default ImagePreview;
