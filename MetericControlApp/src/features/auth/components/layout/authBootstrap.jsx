import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import useSession from '@/features/auth/hooks/useSession';
import ScreenLoader from '@/shared/components/loader/screenLoader';
import useNetwork from '@/shared/hooks/offline/useNetwork';
import useAuth from '@/features/auth/store/useAuth';
import resetAccountStores from '@/features/auth/lib/resetAccountStores';
import rehydrateAccountStores from '@/features/auth/lib/rehydrateAccountStores';
import { initializeAccountMMKVStorage } from '@/features/auth/store/createAccountMMKVStorage';

const AuthBootstrap = ({ children }) => {
    const { isChecked, isOnline } = useNetwork();
    const { isPending, refreshSession } = useSession();
    const didInit = useRef(false);
    const isAuthChecked = useAuth((state) => state.isAuthChecked);
    const login = useAuth((state) => state.login);
    const [hydratedLogin, setHydratedLogin] = useState(undefined);

    useLayoutEffect(() => {
        initializeAccountMMKVStorage();
        let isCurrentAccount = true;
        if (!login) {
            resetAccountStores();
            setHydratedLogin(null);
        } else {
            void rehydrateAccountStores().then(() => {
                if (isCurrentAccount) {
                    setHydratedLogin(login);
                }
            });
        }
        return () => {
            isCurrentAccount = false;
        };
    }, [login]);

    useEffect(() => {
        if (didInit.current || isAuthChecked || hydratedLogin !== login) {
            return;
        }

        if (!isChecked) {
            return;
        }
        didInit.current = true;
        void refreshSession({ offline: !isOnline });
    }, [
        refreshSession,
        isChecked,
        isOnline,
        isAuthChecked,
        hydratedLogin,
        login,
    ]);

    if (hydratedLogin !== login || !isAuthChecked || isPending) {
        return <ScreenLoader />;
    }

    return children;
};

export default AuthBootstrap;
