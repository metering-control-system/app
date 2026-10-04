import { Stack } from 'expo-router';
import ScreenLayout from '@/shared/components/screen/screenLayout';
import PhotoQualityPicker from '@/features/settings/components/photoQualityPicker';
import { DefaultActTemplatePicker } from '@/features/settings/components/defaultActTemplatePicker';
import { StyleSheet } from 'react-native';
import useActTemplatesStore from '@/features/reports/store/useActTemplatesStore';

const SettingsScreen = () => {
    const templates = useActTemplatesStore((state) => state.templates);

    return (
        <ScreenLayout safe style={styles.container}>
            <Stack.Screen options={{ headerShown: true, title: 'Настройки' }} />
            <PhotoQualityPicker />
            <DefaultActTemplatePicker templates={templates} />
        </ScreenLayout>
    );
};

const styles = StyleSheet.create({ container: { flex: 1, gap: 50 } });
export default SettingsScreen;
