import ScreenLayout from '@/shared/components/screen/screenLayout';
import { Pressable, Text } from 'react-native';
import useLogout from '@/features/auth/hooks/useLogout';

const Profile = () => {
    const { isPending, logoutUser } = useLogout();

    return (
        <ScreenLayout safe centered>
            <Pressable
                onPress={logoutUser}
                style={({ pressed }) => [
                    {
                        paddingVertical: 10,
                        paddingHorizontal: 15,
                        borderRadius: 12,
                        backgroundColor: '#315df6',
                    },
                    pressed && { opacity: 0.75 },
                ]}>
                <Text style={{ color: 'white' }}>
                    {isPending ? 'Загрузка' : 'Выйти из аккаунта'}
                </Text>
            </Pressable>
        </ScreenLayout>
    );
};

export default Profile;
