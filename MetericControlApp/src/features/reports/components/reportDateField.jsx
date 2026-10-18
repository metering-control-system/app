import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Keyboard,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import DateTimePicker, {
    DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import {
    formatReportDateTime,
    parseReportDate,
    parseReportDateTime,
} from '@/features/reports/lib/reportActFieldValues';

const ReportDateField = ({
    label,
    value,
    onChange,
    onBlur,
    dateTime = false,
    disabled = false,
    error,
}) => {
    const [picker, setPicker] = useState(null);
    const activeMode = useRef(null);

    useEffect(() => {
        const dismiss = () => {
            const mode = activeMode.current;
            activeMode.current = null;
            if (Platform.OS === 'android' && mode)
                void DateTimePickerAndroid.dismiss(mode);
        };
        if (disabled) {
            dismiss();
            setPicker(null);
        }
        return dismiss;
    }, [disabled]);

    const close = () => {
        activeMode.current = null;
        setPicker(null);
        onBlur?.();
    };
    const commit = (date) => {
        const formatted = formatReportDateTime(date);
        onChange(dateTime ? formatted : formatted.split(' ')[0]);
        close();
    };
    const openAndroid = (mode, date) => {
        activeMode.current = mode;
        DateTimePickerAndroid.open({
            mode,
            value: date,
            display: mode === 'time' ? 'spinner' : 'default',
            is24Hour: true,
            positiveButton: { label: 'Выбрать' },
            negativeButton: { label: 'Отмена' },
            onError: () => {
                if (activeMode.current !== mode) return;
                close();
                Alert.alert(
                    'Ошибка',
                    'Не удалось открыть выбор даты и времени.'
                );
            },
            onChange: (event, selected) => {
                if (activeMode.current !== mode) return;
                if (event.type !== 'set' || !selected) {
                    close();
                    return;
                }
                const next = new Date(date);
                if (mode === 'date')
                    next.setFullYear(
                        selected.getFullYear(),
                        selected.getMonth(),
                        selected.getDate()
                    );
                else
                    next.setHours(
                        selected.getHours(),
                        selected.getMinutes(),
                        0,
                        0
                    );
                if (mode === 'date' && dateTime) openAndroid('time', next);
                else commit(next);
            },
        });
    };
    const open = (mode = 'date') => {
        if (disabled || activeMode.current) return;
        Keyboard.dismiss();
        const parsed = dateTime
            ? parseReportDateTime(value)
            : parseReportDate(value);
        const date = parsed
            ? new Date(dateTime ? parsed : `${parsed}T12:00:00`)
            : new Date();
        activeMode.current = mode;
        setPicker({ mode, date });
        if (Platform.OS === 'android') openAndroid(mode, date);
    };

    return (
        <View style={styles.control}>
            <Text style={styles.label}>{label}</Text>
            {Platform.OS === 'web' ? (
                <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    editable={!disabled}
                    placeholder={dateTime ? 'ДД.ММ.ГГГГ ЧЧ:ММ' : 'ДД.ММ.ГГГГ'}
                    style={[styles.input, error && styles.inputError]}
                />
            ) : (
                <Pressable
                    accessibilityRole='button'
                    accessibilityLabel={`${label}: ${value || 'не указано'}`}
                    accessibilityState={{
                        disabled: disabled || Boolean(picker),
                    }}
                    disabled={disabled || Boolean(picker)}
                    onPress={() => open('date')}
                    style={[
                        styles.input,
                        disabled && styles.disabled,
                        error && styles.inputError,
                    ]}>
                    <Text style={value ? styles.value : styles.placeholder}>
                        {value ||
                            (dateTime
                                ? 'Выбрать дату и время'
                                : 'Выбрать дату')}
                    </Text>
                </Pressable>
            )}
            <View style={styles.fieldActions}>
                {dateTime &&
                    Platform.OS !== 'web' &&
                    parseReportDateTime(value) && (
                        <Pressable
                            accessibilityRole='button'
                            accessibilityLabel={`Изменить время: ${label}`}
                            disabled={disabled || Boolean(picker)}
                            onPress={() => open('time')}
                            style={styles.clear}>
                            <Text
                                style={
                                    disabled
                                        ? styles.placeholder
                                        : styles.buttonText
                                }>
                                Изменить время
                            </Text>
                        </Pressable>
                    )}
                {Boolean(value) && (
                    <Pressable
                        accessibilityRole='button'
                        accessibilityLabel={`Очистить: ${label}`}
                        disabled={disabled || Boolean(picker)}
                        onPress={() => {
                            onChange('');
                            onBlur?.();
                        }}
                        style={styles.clear}>
                        <Text
                            style={
                                disabled
                                    ? styles.placeholder
                                    : styles.buttonText
                            }>
                            Очистить
                        </Text>
                    </Pressable>
                )}
            </View>
            {error && <Text style={styles.error}>{error}</Text>}
            {Platform.OS === 'ios' && picker && (
                <Modal transparent animationType='fade' onRequestClose={close}>
                    <View style={styles.backdrop}>
                        <View style={styles.dialog}>
                            <Text style={styles.title}>{label}</Text>
                            <DateTimePicker
                                value={picker.date}
                                mode={picker.mode}
                                display={
                                    picker.mode === 'date'
                                        ? 'inline'
                                        : 'spinner'
                                }
                                themeVariant='light'
                                onChange={(_, date) => {
                                    if (!date) return;
                                    const next = new Date(picker.date);
                                    if (picker.mode === 'time')
                                        next.setHours(
                                            date.getHours(),
                                            date.getMinutes(),
                                            0,
                                            0
                                        );
                                    else
                                        next.setFullYear(
                                            date.getFullYear(),
                                            date.getMonth(),
                                            date.getDate()
                                        );
                                    setPicker({ ...picker, date: next });
                                }}
                            />
                            <View style={styles.actions}>
                                <Pressable
                                    accessibilityRole='button'
                                    onPress={close}
                                    style={styles.button}>
                                    <Text style={styles.buttonText}>
                                        Отмена
                                    </Text>
                                </Pressable>
                                <Pressable
                                    accessibilityRole='button'
                                    style={styles.button}
                                    onPress={() => {
                                        if (
                                            dateTime &&
                                            picker.mode === 'date'
                                        ) {
                                            activeMode.current = 'time';
                                            setPicker({
                                                ...picker,
                                                mode: 'time',
                                            });
                                        } else commit(picker.date);
                                    }}>
                                    <Text style={styles.buttonText}>
                                        {dateTime && picker.mode === 'date'
                                            ? 'Далее'
                                            : 'Готово'}
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    control: { marginBottom: 14 },
    label: {
        marginBottom: 8,
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
        color: '#42536c',
    },
    input: {
        minHeight: 52,
        borderWidth: 1,
        borderColor: '#dce4ef',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 13,
        fontSize: 16,
        color: '#183153',
        backgroundColor: '#f8fafc',
    },
    value: { fontSize: 16, color: '#1d314c' },
    placeholder: { fontSize: 16, color: '#8996a9' },
    disabled: { backgroundColor: '#f5f7fa' },
    inputError: { borderColor: '#d84c4c', backgroundColor: '#fff5f5' },
    error: { marginTop: 6, fontSize: 12, color: '#d84c4c' },
    clear: {
        alignSelf: 'flex-start',
        minHeight: 44,
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    fieldActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    buttonText: { color: '#1a5eb0', fontSize: 15, fontWeight: '600' },
    backdrop: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#0008',
    },
    dialog: { padding: 16, borderRadius: 16, backgroundColor: '#fff' },
    title: {
        color: '#183153',
        fontSize: 17,
        fontWeight: '600',
        marginBottom: 12,
    },
    actions: { flexDirection: 'row', justifyContent: 'space-between' },
    button: { padding: 12 },
});

export default ReportDateField;
