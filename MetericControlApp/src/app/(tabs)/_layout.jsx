import { Tabs } from 'expo-router';

const DashbordLayout = () => {
    return (
        <Tabs screenOption={{ headerShown: false }}>
            <Tabs.Screen
                name='tasks'
                options={{ title: 'Tasks', headerShown: false }}
            />
        </Tabs>
    );
};

export default DashbordLayout;
