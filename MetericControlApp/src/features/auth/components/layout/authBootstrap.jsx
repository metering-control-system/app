import { useEffect, useRef } from 'react';
import useSession from '@/features/auth/hooks/useSession';
import ScreenLoader from '@/shared/components/loader/screenLoader';
import useNetwork from '@/shared/hooks/offline/useNetwork';

const AuthBootstrap = ({ children }) => {
    const { isChecked, isOnline } = useNetwork();
    const { isPending, refreshSession } = useSession();
    const didInit = useRef(false);

    useEffect(() => {
        if (didInit.current) {
            return;
        }

        if (!isChecked) {
            return;
        }
        didInit.current = true;
        void refreshSession({ offline: !isOnline });
    }, [refreshSession, isChecked, isOnline]);

    if (isPending) {
        return <ScreenLoader />;
    }

    return children;
};

export default AuthBootstrap;
