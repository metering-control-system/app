import { QueryClientProvider } from '@tanstack/react-query';

import { queryClient } from '@/shared/api/queryClient';
import { Stack } from 'expo-router';
import AuthBootstrap from '@/features/auth/components/layout/authBootstrap';
import { UIManager, Platform, KeyboardAvoidingView } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';

let TanstackQueryDevTools = ({ children }) => children;

if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

if (__DEV__) {
    TanstackQueryDevTools =
        require('@/shared/lib/devtools/tanstackQueryDevTools').default;
}

const RootLayout = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <TanstackQueryDevTools>
                <KeyboardProvider preload={false}>
                    <AuthBootstrap>
                        <Stack screenOptions={{ headerShown: false }} />
                    </AuthBootstrap>
                </KeyboardProvider>
            </TanstackQueryDevTools>
        </QueryClientProvider>
    );
};

export default RootLayout;
