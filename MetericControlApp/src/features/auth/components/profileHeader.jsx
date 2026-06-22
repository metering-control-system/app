import { StyleSheet, Text, View } from 'react-native';
import useAuth from '@/features/auth/store/useAuth';

const ProfileHeader = () => {
    const login = useAuth((state) => state.login);
    const initials = login ? login[0].toUpperCase() : '?';

    return (
        <View style={styles.container}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <Text style={styles.loginText}>{login ?? 'Пользователь'}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        marginBottom: 4,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#b8d9ff',
        borderWidth: 2,
        borderColor: '#278cff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: { fontSize: 26, fontWeight: '700', color: '#1a5eb0' },
    loginText: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111',
        flexShrink: 1,
    },
});

export default ProfileHeader;
