import useAuth from '@/features/auth/store/useAuth';
import { Redirect, Stack } from 'expo-router';
import ScreenLoader from '@/shared/components/loader/screenLoader';
import useMe from '@/features/settings/hooks/useMe';

const AuthorizedLayout = () => {
    const isAuthenticated = useAuth((state) => state.isAuthenticated);
    const isAuthChecked = useAuth((state) => state.isAuthChecked);

    useMe();

    if (!isAuthChecked) {
        return <ScreenLoader />;
    }

    if (!isAuthenticated) {
        return <Redirect href='/(public)/login' />;
    }

    return <Stack screenOptions={{ headerShown: false }} />;
};
export default AuthorizedLayout;
