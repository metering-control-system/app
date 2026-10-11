import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import useAuth from '@/features/auth/store/useAuth';
import useMe from '@/features/settings/hooks/useMe';

const ProfileHeader = () => {
    const login = useAuth((state) => state.login);
    const { fullName, avatar } = useMe();

    const displayName = fullName ?? login ?? 'Пользователь';
    const initials = displayName[0]?.toUpperCase();

    return (
        <View style={styles.container}>
            <View style={styles.avatar}>
                {avatar ? (
                    <Image
                        source={{ uri: avatar }}
                        style={styles.avatarImage}
                        contentFit='cover'
                        transition={150}
                    />
                ) : (
                    <Text style={styles.avatarText}>{initials}</Text>
                )}
            </View>
            <Text style={styles.nameText}>{displayName}</Text>
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
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarImage: { width: '100%', height: '100%' },
    avatarText: { fontSize: 26, fontWeight: '700', color: '#1a5eb0' },
    nameText: { fontSize: 22, fontWeight: '700', color: '#111', flexShrink: 1 },
});

export default ProfileHeader;
