import { Controller } from 'react-hook-form';
import { Text, StyleSheet } from 'react-native';
import { ReportFormSection } from '@/features/reports/components/reportFormLayout';
import {
    ReportTextField,
    ReportToggleField,
} from '@/features/reports/components/reportSubmitForm/reportFormFields';

export const ReportContactsStep = ({
    control,
    setValue,
    fillPositions,
    highlightedField,
    isEditingDisabled,
    renderRemark,
    errors,
    isRefusedContact,
}) => {
    const fieldProps = {
        fillPositions,
        highlightedField,
        isEditingDisabled,
        renderRemark,
    };
    return (
        <ReportFormSection
            title='Контакты потребителя'
            icon='call-outline'
            description='Если потребитель отказался, включите переключатель ниже.'>
            <Controller
                control={control}
                name='consumerContact.isRefusedContact'
                render={({ field: { onChange, onBlur, value } }) => (
                    <ReportToggleField
                        {...fieldProps}
                        name='consumerContact.isRefusedContact'
                        label='Отказ от предоставления контактов'
                        value={value}
                        onBlur={onBlur}
                        onChange={(nextValue) => {
                            onChange(nextValue);
                            if (nextValue) {
                                setValue('consumerContact.phoneNumber', '', {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                });
                                setValue('consumerContact.phoneNumber2', '', {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                });
                                setValue('consumerContact.email', '', {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                });
                                setValue('consumerContact.fullName', '', {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                });
                            }
                        }}
                    />
                )}
            />
            {errors.consumerContact?.isRefusedContact ? (
                <Text style={styles.errorText}>
                    {errors.consumerContact.isRefusedContact.message}
                </Text>
            ) : null}

            <ReportTextField
                {...fieldProps}
                name='consumerContact.phoneNumber'
                label='Телефон 1'
                placeholder='Введите телефон'
                keyboardType='phone-pad'
                editable={!isRefusedContact}
                error={errors.consumerContact?.phoneNumber}
                control={control}
            />
            <ReportTextField
                {...fieldProps}
                name='consumerContact.phoneNumber2'
                label='Телефон 2'
                placeholder='Введите дополнительный телефон'
                keyboardType='phone-pad'
                editable={!isRefusedContact}
                error={errors.consumerContact?.phoneNumber2}
                control={control}
            />
            <Text style={styles.hintText}>
                Поле Телефон 2 заполняется только при наличии дополнительного
                номера.
            </Text>
            <ReportTextField
                {...fieldProps}
                name='consumerContact.email'
                label='Электронная почта'
                placeholder='Введите адрес электронной почты'
                keyboardType='email-address'
                editable={!isRefusedContact}
                error={errors.consumerContact?.email}
                control={control}
            />
            <ReportTextField
                {...fieldProps}
                name='consumerContact.fullName'
                label='ФИО потребителя или его представителя'
                placeholder='Фамилия Имя Отчество'
                editable={!isRefusedContact}
                error={errors.consumerContact?.fullName}
                control={control}
            />
        </ReportFormSection>
    );
};

const styles = StyleSheet.create({
    errorText: {
        marginTop: 6,
        marginBottom: 8,
        fontSize: 13,
        lineHeight: 18,
        color: '#c84343',
    },
    hintText: {
        marginTop: -6,
        marginBottom: 16,
        fontSize: 12,
        lineHeight: 18,
        color: '#758399',
    },
});
