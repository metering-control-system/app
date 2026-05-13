import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const DashboardLayout = () => {
    return (
        <Tabs screenOptions={{ headerShown: false }}>
            <Tabs.Screen
                name='tasks'
                options={{
                    title: 'Tasks',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <Ionicons
                            name={focused ? 'build' : 'build-outline'}
                            size={24}
                            color={focused ? '#0080ff' : '#989898'}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name='profile'
                options={{
                    title: 'Profile',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <Ionicons
                            name={focused ? 'person' : 'person-outline'}
                            size={24}
                            color={focused ? '#0080ff' : '#989898'}
                        />
                    ),
                }}
            />
        </Tabs>
    );
};

export default DashboardLayout;
