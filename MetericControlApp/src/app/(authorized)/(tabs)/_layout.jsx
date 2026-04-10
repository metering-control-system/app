import { Tabs } from 'expo-router';

const DashboardLayout = () => {
    return (
        <Tabs screenOptions={{ headerShown: false }}>
            <Tabs.Screen
                name='tasks'
                options={{ title: 'Tasks', headerShown: false }}
            />
            <Tabs.Screen
                name='profile'
                options={{ title: 'Profile', headerShown: false }}
            />
        </Tabs>
    );
};

export default DashboardLayout;
