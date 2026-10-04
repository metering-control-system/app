import useAuth from '@/features/auth/store/useAuth';
import { Redirect, Stack } from 'expo-router';
import ScreenLoader from '@/shared/components/loader/screenLoader';
import useActTemplates from '@/features/reports/hooks/useActTemplates';
import { useEffect } from 'react';
import useMe from '@/features/settings/hooks/useMe';
import useNetwork from '@/shared/hooks/offline/useNetwork';

const AuthorizedLayout = () => {
    const isAuthenticated = useAuth((state) => state.isAuthenticated);
    const isAuthChecked = useAuth((state) => state.isAuthChecked);
    const { requestActTemplates } = useActTemplates();
    const { isChecked, isOnline } = useNetwork();

    useEffect(requestActTemplates, [isChecked, isOnline]);

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
