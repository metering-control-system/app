import { QueryClientProvider } from '@tanstack/react-query';
// eslint-disable-next-line import/no-unresolved
import { queryClient } from '@/shared/api/queryClient';
import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';
// eslint-disable-next-line import/no-unresolved
import TanstackQueryDevTools from '@/shared/lib/devtools/tanstackQueryDevTools';

const MainLayout = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <TanstackQueryDevTools>
                <StatusBar hidden={true} />
                <Stack
                    screenOptions={{
                        headerShown: { justifyContent: 'center' },
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
