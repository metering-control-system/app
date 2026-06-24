import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RoleCard = () => (
    <View style={styles.card}>
        <View style={styles.icon}>
            <Ionicons name='construct' size={18} color='#1a5eb0' />
        </View>
        <Text style={styles.label}>Техник</Text>
    </View>
);

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#fff',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 1,
    },
    icon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#b8d9ff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: { fontSize: 15, fontWeight: '600', color: '#1a5eb0' },
});

export default RoleCard;
