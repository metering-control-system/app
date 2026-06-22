import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ProfileHeader from '@/features/auth/components/profileHeader';
import SettingsLink from '@/features/auth/components/settingsLink';
import RoleCard from '@/features/auth/components/roleCard';
import LogoutForm from '@/features/auth/components/logoutForm';

const Profile = () => {
    const insets = useSafeAreaInsets();

    return (
        <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
                styles.content,
                {
                    paddingTop: insets.top + 24,
                    paddingBottom: insets.bottom + 24,
                },
            ]}
            showsVerticalScrollIndicator={false}>
            <ProfileHeader />
            <RoleCard />
            <SettingsLink />
            <LogoutForm />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scroll: { flex: 1, backgroundColor: '#f2f2f2' },
    content: { paddingHorizontal: 16, gap: 12 },
});

export default Profile;
