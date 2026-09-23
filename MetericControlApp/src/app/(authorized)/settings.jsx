import { Stack } from 'expo-router';
import ScreenLayout from '@/shared/components/screen/screenLayout';
import PhotoQualityPicker from '@/features/settings/components/photoQualityPicker';
import { DefaultActTemplatePicker } from '@/features/settings/components/defaultActTemplatePicker';
import { StyleSheet } from 'react-native';

const SettingsScreen = () => {
    return (
        <ScreenLayout safe style={styles.container}>
            <Stack.Screen options={{ headerShown: true, title: 'Настройки' }} />
            <PhotoQualityPicker />
            <DefaultActTemplatePicker />
        </ScreenLayout>
    );
};

const styles = StyleSheet.create({ container: { flex: 1, gap: 50 } });
export default SettingsScreen;
