import { QueryClientProvider } from '@tanstack/react-query';

import { queryClient } from '@/shared/api/queryClient';
import { Stack } from 'expo-router';
import AuthBootstrap from '@/features/auth/components/layout/authBootstrap';

let TanstackQueryDevTools = ({ children }) => children;

if (__DEV__) {
    TanstackQueryDevTools =
        require('@/shared/lib/devtools/tanstackQueryDevTools').default;
}

const RootLayout = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <TanstackQueryDevTools>
                <AuthBootstrap>
                    <Stack screenOptions={{ headerShown: false }} />
                </AuthBootstrap>
            </TanstackQueryDevTools>
        </QueryClientProvider>
    );
};

export default RootLayout;
