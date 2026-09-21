import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useSettingsStore from '@/features/settings/store/useSettingsStore';
import { PHOTO_QUALITY_PRESETS } from '@/features/settings/lib/photoQualityPresets';
import { colors } from '@/shared/consts/baseColors';

const PhotoQualityPicker = () => {
    const photoQuality = useSettingsStore((state) => state.photoQuality);
    const setPhotoQuality = useSettingsStore((state) => state.setPhotoQuality);

    return (
        <View style={styles.container}>
            {Object.entries(PHOTO_QUALITY_PRESETS).map(([key, preset]) => {
                const isSelected = key === photoQuality;

                return (
                    <Pressable
                        key={key}
                        style={[
                            styles.option,
                            isSelected && {
                                backgroundColor:
                                    colors.secondary.backgroundColor,
                                borderColor: colors.secondary.borderColor,
                            },
                        ]}
                        onPress={() => setPhotoQuality(key)}>
                        <Ionicons
                            name={
                                isSelected
                                    ? 'radio-button-on'
                                    : 'radio-button-off'
                            }
                            size={18}
                            color={isSelected ? colors.secondary.color : '#999'}
                        />
                        <Text
                            style={[
                                styles.optionText,
                                isSelected && { color: colors.secondary.color },
                            ]}>
                            {preset.label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { gap: 10 },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        backgroundColor: '#fafafa',
    },
    optionText: { fontSize: 14, color: '#333' },
});

export default PhotoQualityPicker;
