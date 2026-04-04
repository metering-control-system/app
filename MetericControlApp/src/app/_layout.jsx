import { QueryClientProvider } from '@tanstack/react-query';
// eslint-disable-next-line import/no-unresolved
import { queryClient } from '@/shared/api/queryClient';
import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';

let TanstackQueryDevTools = ({ children }) => children;

if (__DEV__) {
    TanstackQueryDevTools =
        require('@/shared/lib/devtools/tanstackQueryDevTools').default;
}

const MainLayout = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <TanstackQueryDevTools>
                <StatusBar hidden={true} />
                <Stack
                    screenOptions={{
                        headerTitleAlign: 'center',
                        headerTintColor: 'grey',
                    }}>
                    <Stack.Screen
                        name='index'
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name='(tabs)'
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name='taskDetails'
                        options={{ headerShown: false }}
                    />
                </Stack>
            </TanstackQueryDevTools>
        </QueryClientProvider>
    );
};

export default MainLayout;
