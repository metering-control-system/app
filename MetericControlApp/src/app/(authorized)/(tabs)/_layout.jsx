import { Tabs } from 'expo-router';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import useTaskOfflineMutationStore from '@/features/tasks/store/useTaskOfflineMutationStore';

const DashboardLayout = () => {
    const pendingCount = useTaskOfflineMutationStore(
        (state) => Object.keys(state.tasksStatuses ?? {}).length
    );

    return (
        <Tabs screenOptions={{ headerShown: false }}>
            <Tabs.Screen
                name='tasks'
                options={{
                    title: 'Tasks',
                    tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
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
                name='reports'
                options={{
                    title: 'Reports',
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <AntDesign
                            name='file-done'
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
