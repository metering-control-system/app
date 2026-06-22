import { Stack } from 'expo-router';

const ReportDetailsLayout = () => {
    return (
        <Stack>
            <Stack.Screen name='[id]' options={{ title: 'Описание' }} />
        </Stack>
    );
};

export default ReportDetailsLayout;
