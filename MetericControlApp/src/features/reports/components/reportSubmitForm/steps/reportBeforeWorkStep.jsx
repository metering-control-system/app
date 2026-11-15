import { Controller } from 'react-hook-form';
import { Text, TextInput, View, StyleSheet } from 'react-native';
import { REPORT_ACT_FIELDS } from '@/features/reports/constants/reportActFields';
import { ReportFormSection } from '@/features/reports/components/reportFormLayout';
import {
    ReportTextField,
    ReportToggleField,
} from '@/features/reports/components/reportSubmitForm/reportFormFields';
import { ReportActFields } from '@/features/reports/components/reportSubmitForm/reportActFields';

export const ReportBeforeWorkStep = ({
    errors,
    fillPositions,
    highlightedField,
    control,
    isEditingDisabled,
    renderRemark,
    task,
    isActualMeterDifferent,
}) => {
    const fieldProps = {
        fillPositions,
        highlightedField,
        isEditingDisabled,
        renderRemark,
    };
    return (
        <View style={styles.sectionList}>
            <ReportFormSection title='Данные потребителя' icon='person-outline'>
                <ReportTextField
                    {...fieldProps}
                    name='customerName'
                    required
                    label='ФИО'
                    placeholder='Введите ФИО'
                    error={errors.customerName}
                    control={control}
                />
                <ReportTextField
                    {...fieldProps}
                    name='personalAccount'
                    required
                    label='Лицевой счет'
                    placeholder='Введите лицевой счет'
                    keyboardType='number-pad'
                    error={errors.personalAccount}
                    control={control}
                />
                <View style={styles.control}>
                    <Text style={styles.label}>Номер телефона</Text>
                    <TextInput
                        style={styles.input}
                        value={task?.consumer?.phone_number ?? ''}
                        placeholder='Не указан'
                        accessibilityLabel='Номер телефона из заявки'
                        editable={false}
                    />
                </View>
            </ReportFormSection>
            <ReportFormSection
                title='Старый счётчик'
                icon='speedometer-outline'>
                <ReportTextField
                    {...fieldProps}
                    name='meterBefore.type'
                    label='Тип старого ПУ'
                    placeholder='Введите тип старого ПУ'
                    error={errors.meterBefore?.type}
                    control={control}
                />
                <ReportTextField
                    {...fieldProps}
                    name='meterBefore.number'
                    label='Номер старого ПУ'
                    placeholder='Введите номер старого ПУ'
                    error={errors.meterBefore?.number}
                    control={control}
                />
                <Controller
                    control={control}
                    name='meterBefore.isActualDifferent'
                    render={({ field: { onChange, onBlur, value } }) => (
                        <ReportToggleField
                            {...fieldProps}
                            name='meterBefore.isActualDifferent'
                            label='Фактический ПУ отличается'
                            value={value}
                            onChange={onChange}
                            onBlur={onBlur}
                        />
                    )}
                />
                {isActualMeterDifferent ? (
                    <>
                        <ReportTextField
                            {...fieldProps}
                            name='meterBefore.actualType'
                            label='Фактический тип старого ПУ'
                            placeholder='Введите фактический тип при отличии'
                            error={errors.meterBefore?.actualType}
                            control={control}
                        />
                        <ReportTextField
                            {...fieldProps}
                            name='meterBefore.actualNumber'
                            label='Фактический номер старого ПУ'
                            placeholder='Введите фактический номер при отличии'
                            error={errors.meterBefore?.actualNumber}
                            control={control}
                        />
                    </>
                ) : null}
            </ReportFormSection>
            <ReportActFields
                {...fieldProps}
                fields={REPORT_ACT_FIELDS.filter(
                    (field) => field.group === 'meterBefore'
                )}
                title='Характеристики старого счётчика'
                errors={errors}
                control={control}
            />
            <ReportFormSection
                title='Заметки по задаче'
                icon='chatbubble-ellipses-outline'>
                <View style={styles.control}>
                    <Text style={styles.label}>Причина замены</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={task?.task_data?.service_reason ?? ''}
                        placeholder='Не указана'
                        accessibilityLabel='Причина замены из заявки'
                        editable={false}
                        multiline
                    />
                </View>
                <ReportTextField
                    {...fieldProps}
                    name='comment'
                    label='Комментарий к задаче'
                    placeholder='Добавьте комментарий при необходимости'
                    multiline
                    numberOfLines={4}
                    error={errors.comment}
                    control={control}
                />
            </ReportFormSection>
        </View>
    );
};

const styles = StyleSheet.create({
    sectionList: { gap: 16 },
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
});
