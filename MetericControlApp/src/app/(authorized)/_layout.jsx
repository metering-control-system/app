import useAuth from '@/features/auth/store/useAuth';
import { Redirect, Stack } from 'expo-router';
import ScreenLoader from '@/shared/components/loader/screenLoader';
import { useOfflineTasksSync } from '@/features/tasks/hooks/useOfflineTasksSync';

const AuthorizedContent = ({ children }) => {
    useOfflineTasksSync();
    return children;
};

const AuthorizedLayout = () => {
    const isAuthenticated = useAuth((state) => state.isAuthenticated);
    const isAuthChecked = useAuth((state) => state.isAuthChecked);

    if (!isAuthChecked) {
        return <ScreenLoader />;
    }

    if (!isAuthenticated) {
        return <Redirect href='/(public)/login' />;
    }

    return (
        <AuthorizedContent>
            <Stack screenOptions={{ headerShown: false }} />
        </AuthorizedContent>
    );
};
export default AuthorizedLayout;
