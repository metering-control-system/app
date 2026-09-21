import { StyleSheet, Text } from 'react-native';
import { Stack } from 'expo-router';
import ScreenLayout from '@/shared/components/screen/screenLayout';
import PhotoQualityPicker from '@/features/settings/components/photoQualityPicker';

const SettingsScreen = () => {
    return (
        <ScreenLayout safe>
            <Stack.Screen options={{ headerShown: true, title: 'Настройки' }} />
            <Text style={styles.sectionTitle}>Качество фото в задачах</Text>
            <PhotoQualityPicker />
        </ScreenLayout>
    );
};

const styles = StyleSheet.create({
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#727272',
        marginBottom: 15,
    },
});

export default SettingsScreen;
