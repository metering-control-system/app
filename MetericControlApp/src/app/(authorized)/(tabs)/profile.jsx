import ProfileHeader from '@/features/auth/components/profileHeader';
import SettingsLink from '@/features/auth/components/settingsLink';
import ScreenLayout from '@/shared/components/screen/screenLayout';
import LogoutForm from '@/features/auth/components/logoutForm';

const Profile = () => {
    return (
        <ScreenLayout safe centered>
            <ProfileHeader />
            <SettingsLink />
            <LogoutForm />
        </ScreenLayout>
    );
};

export default Profile;
