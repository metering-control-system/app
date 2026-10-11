import { Image } from 'expo-image';
import { useMemo } from 'react';
import useAuth from '@/features/auth/store/useAuth';

const AuthenticatedImage = ({ source, ...props }) => {
    const accessToken = useAuth((state) => state.accessToken);
    const authenticatedSource = useMemo(() => {
        const uri = typeof source === 'string' ? source : source?.uri;
        if (!uri || !accessToken || !process.env.EXPO_PUBLIC_HOST_ADDR) {
            return source;
        }
        try {
            const imageUrl = new URL(uri);
            const serverUrl = new URL(process.env.EXPO_PUBLIC_HOST_ADDR);
            if (
                imageUrl.origin !== serverUrl.origin ||
                !imageUrl.pathname.startsWith('/api/')
            ) {
                return source;
            }
            const imageSource = typeof source === 'string' ? { uri } : source;
            return {
                ...imageSource,
                headers: {
                    ...imageSource.headers,
                    Authorization: `Bearer ${accessToken}`,
                },
            };
        } catch {
            return source;
        }
    }, [source, accessToken]);

    return <Image {...props} source={authenticatedSource} />;
};

export default AuthenticatedImage;
