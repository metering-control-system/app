import { Pressable, StyleSheet, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { validatePickedImage } from '@/shared/lib/media/validatePickedImage';

export default function ImagePickerButton({
    onError,
    handleUploadPhoto,
    disabled,
}) {
    const pickImage = async () => {
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
                const validationError = await validatePickedImage(asset);

                if (validationError) {
                    onError('Файл слишком большой', validationError);
                    return;
                }

                await handleUploadPhoto(asset.uri);
            }
        } catch {
            onError(
                'Не удалось загрузить фотографию',
                'Попробуйте выбрать её ещё раз или сделайте новое фото.'
            );
        }
    };

    return (
        <Pressable
            disabled={disabled}
            onPress={pickImage}
            style={({ pressed }) => [
                styles.button,
                { opacity: pressed ? 0.5 : 1 },
            ]}>
            <Feather name='upload' size={25} color='#278cff' />
            <Text>Загрузить из галереи</Text>
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
