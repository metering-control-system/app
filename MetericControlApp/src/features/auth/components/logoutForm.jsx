import useLogout from '@/features/auth/hooks/useLogout';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const LogoutForm = () => {
    const { isPending, logoutUser } = useLogout();

    const handleLogout = async () => {
        if (!isPending) {
            void logoutUser();
        }
    };

    return (
        <View style={styles.card}>
            <Pressable
                style={({ pressed }) => [
                    styles.item,
                    pressed && styles.itemPressed,
                ]}
                onPress={handleLogout}
                disabled={isPending}>
                <View style={styles.left}>
                    <Ionicons
                        name='log-out-outline'
                        size={20}
                        color='#d84c4c'
                    />
                    <Text style={styles.label}>
                        {isPending ? 'Выход...' : 'Выйти'}
                    </Text>
                </View>
                <Ionicons name='chevron-forward' size={16} color='#d84c4c' />
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
    itemPressed: { backgroundColor: '#fff5f5' },
    left: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    label: { fontSize: 15, color: '#d84c4c', fontWeight: '500' },
});

export default LogoutForm;
