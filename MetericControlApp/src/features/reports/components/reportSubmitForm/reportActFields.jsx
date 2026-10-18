import { Controller } from 'react-hook-form';
import { Text, View, StyleSheet } from 'react-native';
import { HighlightWrap } from '@/shared/components/wrapper/highlightWrapper';
import { OPTIONAL_BOOLEAN_OPTIONS } from '@/features/reports/constants/reportActFields';
import ReportDateField from '@/features/reports/components/reportDateField';
import {
    ReportFormSection,
    ReportFieldLayout,
} from '@/features/reports/components/reportFormLayout';
import {
    ReportTextField,
    ReportOptionField,
} from '@/features/reports/components/reportSubmitForm/reportFormFields';

export const ReportActFields = ({
    fields,
    title,
    errors,
    fillPositions,
    highlightedField,
    control,
    isEditingDisabled,
    renderRemark,
}) => {
    const fieldProps = {
        fillPositions,
        highlightedField,
        isEditingDisabled,
        renderRemark,
    };
    return (
        <ReportFormSection
            title={title}
            description='Необязательные сведения — заполните, если они известны.'>
            {fields.map((field) => {
                const name = `${field.group}.${field.name}`;
                const error = errors[field.group]?.[field.name];
                if (field.kind === 'date' || field.kind === 'datetime')
                    return (
                        <ReportFieldLayout
                            key={name}
                            name={name}
                            fillPositions={fillPositions}>
                            <HighlightWrap isActive={highlightedField === name}>
                                <Controller
                                    control={control}
                                    name={name}
                                    render={({
                                        field: { value, onChange, onBlur },
                                    }) => (
                                        <ReportDateField
                                            label={field.label}
                                            value={value}
                                            onChange={onChange}
                                            onBlur={onBlur}
                                            dateTime={field.kind === 'datetime'}
                                            disabled={isEditingDisabled}
                                            error={error?.message}
                                        />
                                    )}
                                />
                                {renderRemark(name)}
                            </HighlightWrap>
                        </ReportFieldLayout>
                    );
                if (field.kind === 'choice' || field.kind === 'boolean')
                    return (
                        <View key={name}>
                            <Controller
                                control={control}
                                name={name}
                                render={({
                                    field: { value, onChange, onBlur },
                                }) => (
                                    <ReportOptionField
                                        {...fieldProps}
                                        name={name}
                                        label={field.label}
                                        value={value}
                                        onChange={onChange}
                                        onBlur={onBlur}
                                        options={
                                            field.options ??
                                            OPTIONAL_BOOLEAN_OPTIONS
                                        }
                                        allowEmpty={field.kind === 'choice'}
                                    />
                                )}
                            />
                            {error && (
                                <Text style={styles.errorText}>
                                    {error.message}
                                </Text>
                            )}
                        </View>
                    );
                return (
                    <View key={name}>
                        <ReportTextField
                            {...fieldProps}
                            name={name}
                            label={field.label}
                            error={error}
                            placeholder={
                                field.kind === 'reading'
                                    ? 'Введите показания'
                                    : 'Не указано'
                            }
                            keyboardType={
                                field.kind === 'integer'
                                    ? 'number-pad'
                                    : field.kind === 'reading'
                                      ? 'decimal-pad'
                                      : 'default'
                            }
                            multiline={
                                field.maxLength === null &&
                                field.kind === 'text'
                            }
                            control={control}
                        />
                    </View>
                );
            })}
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
});
