import { Redirect, Stack } from 'expo-router';
import useAuth from '@/features/auth/store/useAuth';
import ScreenLoader from '@/shared/components/loader/screenLoader';

const PublicLayout = () => {
    const isAuthenticated = useAuth((state) => state.isAuthenticated);
    const isAuthChecked = useAuth((state) => state.isAuthChecked);

    if (!isAuthChecked) {
        return <ScreenLoader />;
    }

    if (isAuthenticated) {
        return <Redirect href='/(authorized)/(tabs)/tasks' />;
    }

    return <Stack screenOptions={{ headerShown: false }} />;
};

export default PublicLayout;
