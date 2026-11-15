import useSettingsStore from '@/features/settings/store/useSettingsStore';
import useAuth from '@/features/auth/store/useAuth';
import { Redirect, Stack } from 'expo-router';
import ScreenLoader from '@/shared/components/loader/screenLoader';
import useActTemplates from '@/features/acts/hooks/useActTemplates';
import { useEffect } from 'react';
import useMe from '@/features/settings/hooks/useMe';
import useNetwork from '@/shared/hooks/offline/useNetwork';

const AuthorizedLayout = () => {
    const isAuthenticated = useAuth((state) => state.isAuthenticated);
    const isAuthChecked = useAuth((state) => state.isAuthChecked);
    const defaultActTemplate = useSettingsStore(
        (state) => state.defaultActTemplate
    );
    const setDefaultActTemplate = useSettingsStore(
        (state) => state.setDefaultActTemplate
    );
    const { requestActTemplates } = useActTemplates({
        defaultActTemplate,
        setDefaultActTemplate,
    });
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
