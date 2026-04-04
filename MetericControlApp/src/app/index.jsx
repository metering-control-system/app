import { ActivityIndicator, StyleSheet } from 'react-native';
// eslint-disable-next-line import/no-unresolved
import ScreenLayout from '@/shared/components/screen/screenLayout';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

const App = () => {
    const router = useRouter();

    useEffect(() => {
        if (!router) {
            return;
        }

        router.replace('(tabs)/tasks');
    }, [router]);

    return (
        <ScreenLayout style={styles.container}>
            <ActivityIndicator size='large' color='#ddd' />
        </ScreenLayout>
    );
};

const styles = StyleSheet.create({
    container: { justifyContent: 'center', alignItems: 'center' },
});

export default App;
