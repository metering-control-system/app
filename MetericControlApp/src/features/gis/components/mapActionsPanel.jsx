import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const MapActionsPanel = ({
    onLocate,
    isLocating,
    onReset,
    onUnmappedPress,
    unmappedCount,
}) => (
    <View style={styles.panel}>
        <Pressable
            style={styles.button}
            onPress={onLocate}
            disabled={isLocating}
            accessibilityRole='button'
            accessibilityLabel='Моё местоположение'>
            {isLocating ? (
                <ActivityIndicator color='#fff' />
            ) : (
                <Feather name='navigation' size={20} color='#fff' />
            )}
        </Pressable>
        <Pressable
            style={styles.button}
            onPress={onReset}
            accessibilityRole='button'
            accessibilityLabel='Показать всю карту'>
            <Feather name='maximize' size={20} color='#fff' />
        </Pressable>
        <Pressable
            style={styles.button}
            onPress={onUnmappedPress}
            accessibilityRole='button'
            accessibilityLabel={`Задачи вне карты: ${unmappedCount}`}>
            <Feather name='map-pin' size={20} color='#fff' />
            {unmappedCount > 0 && (
                <Text style={styles.badge}>
                    {unmappedCount > 9 ? '9+' : unmappedCount}
                </Text>
            )}
        </Pressable>
    </View>
);

const styles = StyleSheet.create({
    panel: {
        position: 'absolute',
        bottom: 24,
        right: 20,
        width: 44,
        borderRadius: 12,
        backgroundColor: '#0094cf',
        overflow: 'hidden',
        elevation: 4,
    },
    button: {
        height: 44,
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badge: {
        position: 'absolute',
        top: 2,
        right: 2,
        minWidth: 16,
        paddingHorizontal: 3,
        borderRadius: 8,
        backgroundColor: '#fff',
        color: '#007aa8',
        fontSize: 9,
        lineHeight: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default MapActionsPanel;
