import { Controller } from 'react-hook-form';
import { Text, View, StyleSheet } from 'react-native';
import { REPORT_ACT_FIELDS } from '@/features/reports/constants/reportActFields';
import { REJECTION_REASON_OPTIONS } from '@/features/reports/constants/reportFieldOptions';
import { ReportFormSection } from '@/features/reports/components/reportFormLayout';
import {
    ReportTextField,
    ReportOptionField,
} from '@/features/reports/components/reportSubmitForm/reportFormFields';
import { ReportActFields } from '@/features/reports/components/reportSubmitForm/reportActFields';

const ADMISSION_STATUS_OPTIONS = [
    { label: 'Допущен', value: 'ADMITTED' },
    { label: 'Не допущен', value: 'NOT_ADMITTED' },
];

export const ReportAdmissionStep = ({
    control,
    fillPositions,
    highlightedField,
    isEditingDisabled,
    renderRemark,
    errors,
    admissionStatus,
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
                title='Результат работ'
                icon='checkmark-circle-outline'>
                <Controller
                    control={control}
                    name='admission.status'
                    render={({ field: { onChange, onBlur, value } }) => (
                        <ReportOptionField
                            {...fieldProps}
                            name='admission.status'
                            required
                            label='Статус допуска'
                            value={value}
                            onChange={onChange}
                            onBlur={onBlur}
                            options={ADMISSION_STATUS_OPTIONS}
                        />
                    )}
                />
                {errors.admission?.status ? (
                    <Text style={styles.errorText}>
                        {errors.admission.status.message}
                    </Text>
                ) : null}

                {admissionStatus === 'NOT_ADMITTED' ? (
                    <Controller
                        control={control}
                        name='admission.rejectionReason'
                        render={({ field: { onChange, onBlur, value } }) => (
                            <ReportOptionField
                                {...fieldProps}
                                name='admission.rejectionReason'
                                label='Причина недопуска'
                                value={value}
                                onChange={onChange}
                                onBlur={onBlur}
                                options={REJECTION_REASON_OPTIONS}
                            />
                        )}
                    />
                ) : null}
                {errors.admission?.rejectionReason ? (
                    <Text style={styles.errorText}>
                        {errors.admission.rejectionReason.message}
                    </Text>
                ) : null}
                {admissionStatus === 'NOT_ADMITTED' && (
                    <ReportTextField
                        {...fieldProps}
                        name='admission.rejectionComment'
                        label='Пояснение причины недопуска'
                        placeholder='Укажите причину недопуска'
                        multiline
                        error={errors.admission?.rejectionComment}
                        control={control}
                    />
                )}
            </ReportFormSection>
            <ReportActFields
                {...fieldProps}
                fields={REPORT_ACT_FIELDS.filter(
                    (field) => field.group === 'admission'
                )}
                title='Дополнительные сведения о допуске'
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
