import ScreenLayout from '@/shared/components/screen/screenLayout';
import LogoutForm from '@/features/auth/components/logoutForm';
import FormButton from '@/shared/components/button/formButton';
import { useRouter } from 'expo-router';

const Profile = () => {
    const router = useRouter();

    return (
        <ScreenLayout safe centered>
            <LogoutForm />
            <FormButton
                onPress={() => router.push('/(authorized)/gis/map')}
                message='Картоид'
            />
        </ScreenLayout>
    );
};

export default Profile;
