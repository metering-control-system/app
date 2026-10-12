import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Image from '@/shared/components/media/authenticatedImage';

const PictureWrapper = ({ uri, onPress }) => {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            {uri ? (
                <Image
                    source={{ uri }}
                    style={styles.image}
                    contentFit='cover'
                    transition={150}
                />
            ) : (
                <View style={styles.empty}>
                    <Ionicons name='camera-outline' size={20} color='#a2a2a2' />
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        aspectRatio: 16 / 9,
        width: 160,
        borderRadius: 12,
        backgroundColor: '#ddd',
        borderColor: '#a2a2a2',
        borderWidth: 1,
        overflow: 'hidden',
    },
    image: { width: '100%', height: '100%' },
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default PictureWrapper;
