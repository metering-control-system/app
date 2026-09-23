import { StyleSheet, Text, View } from 'react-native';
import Picker from '@/shared/components/picker/picker';
import { actTemplates } from '@/features/reports/constants/actTemplates';
import useSettingsStore from '@/features/settings/store/useSettingsStore';

export const DefaultActTemplatePicker = () => {
    const defaultTemplate = useSettingsStore(
        (state) => state.defaultActTemplate
    );
    const setDefaultTemplate = useSettingsStore(
        (state) => state.setDefaultActTemplate
    );

    const templatesVariants = actTemplates.map((template) => [
        template.id,
        template.name,
    ]);
    return (
        <View>
            <Text style={styles.sectionTitle}>Шаблон акта (по умолчанию)</Text>
            <Picker
                state={defaultTemplate}
                variants={templatesVariants}
                setState={(callback) => {
                    const result = callback(defaultTemplate);
                    setDefaultTemplate(result);
                }}
                label='Выбор шаблона'
                canBeOpened={true}
                icon='sticky-note'
            />
        </View>
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
