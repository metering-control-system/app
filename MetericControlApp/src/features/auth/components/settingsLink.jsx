import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const SettingsLink = () => {
    const router = useRouter();

    return (
        <View style={styles.card}>
            <Pressable
                style={({ pressed }) => [
                    styles.item,
                    pressed && styles.itemPressed,
                ]}
                onPress={() => router.push('/(authorized)/settings')}>
                <View style={styles.left}>
                    <Ionicons name='settings-outline' size={20} color='#555' />
                    <Text style={styles.label}>Настройки</Text>
                </View>
                <Ionicons name='chevron-forward' size={16} color='#bbb' />
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 14,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 1,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 15,
    },
    itemPressed: { backgroundColor: '#f5f5f5' },
    left: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    label: { fontSize: 15, color: '#222' },
});

export default SettingsLink;
