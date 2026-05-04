import { Pressable, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CameraButton = ({ handleOpenCamera }) => {
    return (
        <Pressable
            onPress={handleOpenCamera}
            style={({ pressed }) => [
                styles.button,
                { opacity: pressed ? 0.5 : 1 },
            ]}>
            <Ionicons name='camera-outline' size={25} color='#278cff' />
            <Text>Сделать фото</Text>
        </Pressable>
    );
};

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

export default CameraButton;
