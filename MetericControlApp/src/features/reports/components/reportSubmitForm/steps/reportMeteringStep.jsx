import { Controller } from 'react-hook-form';
import { Text, View, StyleSheet } from 'react-native';
import { REPORT_ACT_FIELDS } from '@/features/reports/constants/reportActFields';
import { SEAL_LOCATION_OPTIONS } from '@/features/reports/constants/reportFieldOptions';
import { ReportFormSection } from '@/features/reports/components/reportFormLayout';
import {
    ReportTextField,
    ReportOptionField,
    ReportToggleField,
} from '@/features/reports/components/reportSubmitForm/reportFormFields';
import { ReportActFields } from '@/features/reports/components/reportSubmitForm/reportActFields';

export const ReportMeteringStep = ({
    control,
    fillPositions,
    highlightedField,
    isEditingDisabled,
    renderRemark,
    errors,
}) => {
    const fieldProps = {
        fillPositions,
        highlightedField,
        isEditingDisabled,
        renderRemark,
    };
    return (
        <View style={styles.sectionList}>
            <ReportFormSection
                title='Демонтаж старого счётчика'
                icon='construct-outline'>
                <Controller
                    control={control}
                    name='metering.dismantlingCompleted'
                    render={({ field: { onChange, onBlur, value } }) => (
                        <ReportToggleField
                            {...fieldProps}
                            name='metering.dismantlingCompleted'
                            label='Демонтаж выполнен'
                            value={value}
                            onChange={onChange}
                            onBlur={onBlur}
                        />
                    )}
                />

                {errors.metering?.dismantlingCompleted && (
                    <Text style={styles.errorText}>
                        {errors.metering.dismantlingCompleted.message}
                    </Text>
                )}
                <ReportTextField
                    {...fieldProps}
                    name='metering.oldReading'
                    label='Последние показания старого ПУ'
                    placeholder='Введите показания'
                    keyboardType='decimal-pad'
                    error={errors.metering?.oldReading}
                    control={control}
                />
            </ReportFormSection>
            <ReportActFields
                {...fieldProps}
                fields={REPORT_ACT_FIELDS.filter((field) =>
                    ['oldT1', 'oldT2'].includes(field.name)
                )}
                title='Тарифные показания старого счётчика'
                errors={errors}
                control={control}
            />
            <ReportFormSection title='Новый счётчик' icon='flash-outline'>
                <ReportTextField
                    {...fieldProps}
                    name='metering.newMeterType'
                    required
                    label='Тип нового ПУ'
                    placeholder='Введите тип нового ПУ'
                    error={errors.metering?.newMeterType}
                    control={control}
                />
                <ReportTextField
                    {...fieldProps}
                    name='metering.newMeterNumber'
                    required
                    label='Номер нового ПУ'
                    placeholder='Введите номер нового ПУ'
                    error={errors.metering?.newMeterNumber}
                    control={control}
                />
                <ReportTextField
                    {...fieldProps}
                    name='metering.installationReading'
                    required
                    label='Показания при установке'
                    placeholder='Введите показания при установке'
                    keyboardType='decimal-pad'
                    error={errors.metering?.installationReading}
                    control={control}
                />
            </ReportFormSection>
            <ReportFormSection
                title='Пломбирование'
                icon='shield-checkmark-outline'>
                <Controller
                    control={control}
                    name='metering.sealLocation'
                    render={({ field: { onChange, onBlur, value } }) => (
                        <ReportOptionField
                            {...fieldProps}
                            name='metering.sealLocation'
                            label='Место установки пломбы'
                            value={value}
                            onChange={onChange}
                            onBlur={onBlur}
                            options={SEAL_LOCATION_OPTIONS}
                            allowEmpty
                        />
                    )}
                />
                {errors.metering?.sealLocation ? (
                    <Text style={styles.errorText}>
                        {errors.metering.sealLocation.message}
                    </Text>
                ) : null}
                <ReportTextField
                    {...fieldProps}
                    name='metering.sealNumber'
                    label='Номер пломбы'
                    placeholder='Введите номер пломбы'
                    error={errors.metering?.sealNumber}
                    control={control}
                />
            </ReportFormSection>
            <ReportActFields
                {...fieldProps}
                fields={REPORT_ACT_FIELDS.filter(
                    (field) =>
                        field.group === 'metering' &&
                        ![
                            'oldT1',
                            'oldT2',
                            'replacementReason',
                            'replacementReasonComment',
                        ].includes(field.name)
                )}
                title='Характеристики нового счётчика'
                errors={errors}
                control={control}
            />
            <ReportActFields
                {...fieldProps}
                fields={REPORT_ACT_FIELDS.filter((field) =>
                    ['replacementReason', 'replacementReasonComment'].includes(
                        field.name
                    )
                )}
                title='Причина замены'
                errors={errors}
                control={control}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    sectionList: { gap: 16 },
    errorText: {
        marginTop: 6,
        marginBottom: 8,
        fontSize: 13,
        lineHeight: 18,
        color: '#c84343',
    },
});
