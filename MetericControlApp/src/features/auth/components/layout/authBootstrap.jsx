import { useEffect, useRef } from 'react';
import useSession from '@/features/auth/hooks/useSession';
import ScreenLoader from '@/shared/components/loader/screenLoader';

const AuthBootstrap = ({ children }) => {
    const { isPending, refreshTokens } = useSession();
    const didInit = useRef(false);

    useEffect(() => {
        if (didInit.current) {
            return;
        }

        didInit.current = true;
        void refreshTokens();
    }, [refreshTokens]);

    if (isPending) {
        return <ScreenLoader />;
    }

    return children;
};

export default AuthBootstrap;
