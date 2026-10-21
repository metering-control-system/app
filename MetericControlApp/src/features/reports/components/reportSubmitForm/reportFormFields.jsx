import { Controller } from 'react-hook-form';
import {
    Pressable,
    Switch,
    Text,
    TextInput,
    View,
    StyleSheet,
} from 'react-native';
import { ReportFieldLayout } from '@/features/reports/components/reportFormLayout';

export const ReportTextField = ({
    name,
    label,
    placeholder,
    keyboardType = 'default',
    multiline = false,
    numberOfLines = 1,
    error,
    editable = true,
    required = false,
    fillPositions,
    highlightedField,
    control,
    isEditingDisabled,
    renderRemark,
}) => (
    <ReportFieldLayout
        name={name}
        fillPositions={fillPositions}
        highlightedField={highlightedField}>
        <View style={styles.control}>
            <Text style={styles.label}>
                {label}
                {required && <Text style={styles.requiredMark}> *</Text>}
            </Text>
            <Controller
                control={control}
                name={name}
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        placeholder={placeholder}
                        placeholderTextColor='#8996a9'
                        accessibilityLabel={label}
                        value={value}
                        style={[
                            styles.input,
                            multiline && styles.textArea,
                            !editable && styles.inputDisabled,
                            error && styles.inputError,
                        ]}
                        keyboardType={keyboardType}
                        multiline={multiline}
                        numberOfLines={numberOfLines}
                        textAlignVertical={multiline ? 'top' : 'center'}
                        editable={editable && !isEditingDisabled}
                        onBlur={onBlur}
                        onChangeText={onChange}
                    />
                )}
            />
            {error ? (
                <Text style={styles.errorText}>{error.message}</Text>
            ) : null}
        </View>
        {renderRemark(name)}
    </ReportFieldLayout>
);

export const ReportOptionField = ({
    label,
    value,
    onChange,
    onBlur,
    options,
    name,
    allowEmpty = false,
    required = false,
    fillPositions,
    highlightedField,
    isEditingDisabled,
    renderRemark,
}) => (
    <ReportFieldLayout
        name={name}
        fillPositions={fillPositions}
        highlightedField={highlightedField}>
        <View style={styles.control}>
            <Text style={styles.label}>
                {label}
                {required && <Text style={styles.requiredMark}> *</Text>}
            </Text>
            <View style={styles.chipsRow}>
                {options.map((option) => {
                    const isSelected = value === option.value;
                    return (
                        <Pressable
                            key={String(option.value)}
                            accessibilityRole='radio'
                            disabled={isEditingDisabled}
                            accessibilityState={{ checked: isSelected }}
                            onPress={() => {
                                onChange(
                                    allowEmpty && isSelected ? '' : option.value
                                );
                                onBlur?.();
                            }}
                            style={[
                                styles.chip,
                                isSelected && styles.chipSelected,
                            ]}>
                            <Text
                                style={[
                                    styles.chipText,
                                    isSelected && styles.chipTextSelected,
                                ]}>
                                {option.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
        {renderRemark(name)}
    </ReportFieldLayout>
);

export const ReportToggleField = ({
    label,
    value,
    onChange,
    onBlur,
    name,
    disabled = false,
    fillPositions,
    highlightedField,
    isEditingDisabled,
    renderRemark,
}) => (
    <ReportFieldLayout
        name={name}
        fillPositions={fillPositions}
        highlightedField={highlightedField}>
        <Pressable
            accessibilityRole='switch'
            accessibilityState={{
                checked: Boolean(value),
                disabled: disabled || isEditingDisabled,
            }}
            disabled={disabled || isEditingDisabled}
            onPress={() => {
                onChange(!value);
                onBlur?.();
            }}
            style={({ pressed }) => [
                styles.switchRow,
                pressed && !disabled && styles.switchRowPressed,
            ]}>
            <Text style={styles.switchLabel}>{label}</Text>
            <Switch
                value={value}
                onValueChange={(nextValue) => {
                    onChange(nextValue);
                    onBlur?.();
                }}
                disabled={disabled || isEditingDisabled}
                trackColor={{ false: '#d8e0ec', true: '#b7d5ff' }}
                thumbColor={value ? '#2469c9' : '#fff'}
            />
        </Pressable>
        {renderRemark(name)}
    </ReportFieldLayout>
);

const styles = StyleSheet.create({
    control: { marginBottom: 16, alignSelf: 'stretch', minWidth: 0 },
    label: {
        marginBottom: 8,
        fontSize: 14,
        fontWeight: '500',
        color: '#42536c',
        lineHeight: 20,
        alignSelf: 'stretch',
        flexShrink: 1,
    },
    requiredMark: { color: '#c84343' },
    input: {
        minHeight: 52,
        borderWidth: 1,
        borderColor: '#dce4ef',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 13,
        fontSize: 16,
        color: '#1d314c',
        backgroundColor: '#f8fafc',
    },
    textArea: { minHeight: 110 },
    inputDisabled: { backgroundColor: '#f1f4f8', color: '#97a3b1' },
    inputError: { borderColor: '#d84c4c', backgroundColor: '#fff5f5' },
    errorText: {
        marginTop: 6,
        marginBottom: 8,
        fontSize: 13,
        lineHeight: 18,
        color: '#c84343',
    },
    chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
        minHeight: 44,
        justifyContent: 'center',
        maxWidth: '100%',
        paddingHorizontal: 14,
        paddingVertical: 11,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#dce4ef',
        backgroundColor: '#f8fafc',
    },
    chipSelected: { borderColor: '#2469c9', backgroundColor: '#edf4fe' },
    chipText: { fontSize: 14, color: '#52627a', fontWeight: '500' },
    chipTextSelected: { color: '#2469c9', fontWeight: '600' },
    switchRow: {
        marginBottom: 16,
        minHeight: 62,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#f4f7fc',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
    },
    switchRowPressed: { opacity: 0.8 },
    switchLabel: { flex: 1, fontSize: 14, lineHeight: 20, color: '#42536c' },
});
