import { useEffect, useRef } from 'react';
import useSession from '@/features/auth/hooks/useSession';
import ScreenLoader from '@/shared/components/loader/screenLoader';

const AuthBootstrap = ({ children }) => {
    const { isPending, refreshSession } = useSession();
    const didInit = useRef(false);

    useEffect(() => {
        if (didInit.current) {
            return;
        }

        didInit.current = true;
        void refreshSession();
    }, [refreshSession]);

    if (isPending) {
        return <ScreenLoader />;
    }

    return children;
};

export default AuthBootstrap;
