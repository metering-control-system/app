import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import {
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { taskFormSchema } from '@/features/tasks/model/taskFormSchema';
import { taskFormDefaultValues } from '@/features/tasks/constants/taskFormDefaults';

const TaskDetailsForm = ({ initialValues }) => {
    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm({
        resolver: zodResolver(taskFormSchema),
        mode: 'onChange',
        defaultValues: initialValues || taskFormDefaultValues,
    });

    const onSubmit = () => {
        Alert.alert(
            'Форма валидна',
            'Пока отправка работает как заглушка. Позже подключим API.'
        );
    };

    return (
        <View style={styles.form}>
            <View style={styles.control}>
                <Text nativeID='name' style={styles.label}>
                    ФИО
                </Text>
                <Controller
                    control={control}
                    name='customerName'
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            placeholder='Введите имя'
                            value={value}
                            style={[
                                styles.input,
                                errors.customerName && styles.inputError,
                            ]}
                            accessibilityLabelledBy='name'
                            onBlur={onBlur}
                            onChangeText={onChange}
                        />
                    )}
                />
                {errors.customerName ? (
                    <Text style={styles.errorText}>
                        {errors.customerName.message}
                    </Text>
                ) : null}
            </View>

            <View style={styles.control}>
                <Text nativeID='personalAccount' style={styles.label}>
                    Лицевой счет
                </Text>
                <Controller
                    control={control}
                    name='personalAccount'
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            placeholder='Введите номер ЛС'
                            value={value}
                            style={[
                                styles.input,
                                errors.personalAccount && styles.inputError,
                            ]}
                            accessibilityLabelledBy='personalAccount'
                            keyboardType='number-pad'
                            onBlur={onBlur}
                            onChangeText={onChange}
                        />
                    )}
                />
                {errors.personalAccount ? (
                    <Text style={styles.errorText}>
                        {errors.personalAccount.message}
                    </Text>
                ) : null}
            </View>

            <View style={styles.control}>
                <Text nativeID='meterType' style={styles.label}>
                    Тип старого ПУ
                </Text>
                <Controller
                    control={control}
                    name='meter.type'
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            placeholder='Введите тип старого ПУ'
                            value={value}
                            style={[
                                styles.input,
                                errors.meter?.type && styles.inputError,
                            ]}
                            accessibilityLabelledBy='meterType'
                            onBlur={onBlur}
                            onChangeText={onChange}
                        />
                    )}
                />
                {errors.meter?.type ? (
                    <Text style={styles.errorText}>
                        {errors.meter.type.message}
                    </Text>
                ) : null}
            </View>

            <View style={styles.control}>
                <Text nativeID='meterNumber' style={styles.label}>
                    Номер старого ПУ
                </Text>
                <Controller
                    control={control}
                    name='meter.number'
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            placeholder='Введите номер старого ПУ'
                            value={value}
                            style={[
                                styles.input,
                                errors.meter?.number && styles.inputError,
                            ]}
                            accessibilityLabelledBy='meterNumber'
                            onBlur={onBlur}
                            onChangeText={onChange}
                        />
                    )}
                />
                {errors.meter?.number ? (
                    <Text style={styles.errorText}>
                        {errors.meter.number.message}
                    </Text>
                ) : null}
            </View>

            <Pressable
                onPress={handleSubmit(onSubmit)}
                style={[
                    styles.submitButton,
                    !isValid && styles.submitButtonDisabled,
                ]}>
                <Text style={styles.submitButtonText}>Сохранить</Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    form: {
        paddingHorizontal: 15,
        width: '100%',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    control: { paddingHorizontal: 5, marginVertical: 10 },
    label: { fontSize: 12, color: '#7a7a7a', marginBottom: 10 },
    input: {
        backgroundColor: '#e1ebfd',
        color: '#000',
        width: '100%',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    inputError: { borderColor: '#d84c4c', backgroundColor: '#fff5f5' },
    errorText: { marginTop: 6, fontSize: 12, color: '#d84c4c' },
    submitButton: {
        marginTop: 20,
        marginBottom: 12,
        backgroundColor: '#2d6cdf',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    submitButtonDisabled: { opacity: 0.5 },
    submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default TaskDetailsForm;
