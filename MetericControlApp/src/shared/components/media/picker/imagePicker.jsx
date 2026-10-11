import { Pressable, StyleSheet, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { validatePickedImage } from '@/shared/lib/media/validatePickedImage';
import { prepareGalleryImage } from '@/shared/lib/media/prepareGalleryImage';
import { useRef, useState } from 'react';

export default function ImagePickerButton({
    onError,
    handleUploadPhoto,
    disabled,
    maxSizeBytes,
}) {
    const [isProcessing, setIsProcessing] = useState(false);
    const processingRef = useRef(false);
    const pickImage = async () => {
        if (disabled || processingRef.current) return;
        processingRef.current = true;
        setIsProcessing(true);
        let preparedFile;
        try {
            const permissionResult =
                await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permissionResult.granted) {
                onError(
                    'Нужен доступ к галерее',
                    'Разрешите доступ к галерее, чтобы выбрать изображение.'
                );
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                quality: 1,
            });

            if (!result.canceled) {
                const asset = result.assets[0];
                preparedFile = await prepareGalleryImage(asset.uri);
                const validationError = await validatePickedImage(
                    { uri: preparedFile.uri, fileSize: preparedFile.size },
                    maxSizeBytes
                );

                if (validationError) {
                    preparedFile.delete();
                    preparedFile = null;
                    onError(
                        'Не удалось прикрепить фотографию',
                        validationError
                    );
                    return;
                }

                await handleUploadPhoto(preparedFile.uri);
            }
        } catch {
            if (preparedFile?.exists) preparedFile.delete();
            onError(
                'Не удалось загрузить фотографию',
                'Попробуйте выбрать её ещё раз или сделайте новое фото.'
            );
        } finally {
            processingRef.current = false;
            setIsProcessing(false);
        }
    };

    return (
        <Pressable
            disabled={disabled || isProcessing}
            onPress={pickImage}
            style={({ pressed }) => [
                styles.button,
                { opacity: pressed ? 0.5 : 1 },
            ]}>
            <Feather name='upload' size={25} color='#278cff' />
            <Text>
                {isProcessing ? 'Подготовка фото…' : 'Загрузить из галереи'}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        borderStyle: 'dashed',
        gap: 15,
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingVertical: 15,
    },
});
