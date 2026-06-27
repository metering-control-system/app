import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import {
    Alert,
    Pressable,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useRouter } from 'expo-router';

import Card from '@/shared/components/wrapper/card';
import FormButton from '@/shared/components/button/formButton';
import { colors } from '@/shared/consts/baseColors';
import { getApiErrorMessage } from '@/shared/api/getApiErrorMessage';
import MediaBlock from '@/shared/components/media/mediaBlock';
import useStorePictures from '@/shared/store/useStorePictures';

import { reportSubmitFormSchema } from '@/features/reports/model/reportSubmitFormSchema';
import { reportSubmitFormDefaultValues } from '@/features/reports/constants/reportSubmitFormDefaults';
import useSubmitReport from '@/features/reports/hooks/useSubmitReport';
import { createClientReportId } from '@/features/reports/lib/createClientReportId';
import useReportDraftStore from '@/features/reports/store/useReportDraftStore';

const FORM_STEPS = [
    { key: 'beforeWork', title: 'До начала работ' },
    { key: 'metering', title: 'Демонтаж и монтаж' },
    { key: 'photos', title: 'Фотофиксация' },
    { key: 'admission', title: 'Итог и допуск' },
    { key: 'contacts', title: 'Контактные данные' },
];

const SEAL_LOCATION_OPTIONS = [
    { label: 'Автоматический выключатель', value: 'CIRCUIT_BREAKER' },
    { label: 'Клеммная крышка', value: 'TERMINAL_COVER' },
    { label: 'Трансформатор', value: 'TRANSFORMER' },
];

const ADMISSION_STATUS_OPTIONS = [
    { label: 'Допущен', value: 'ADMITTED' },
    { label: 'Не допущен', value: 'NOT_ADMITTED' },
];

const REJECTION_REASON_OPTIONS = [
    { label: 'Нарушена схема питания', value: 'POWER_SCHEME_VIOLATION' },
    { label: 'Нет доступа', value: 'NO_ACCESS' },
    { label: 'Неисправность прибора', value: 'DEVICE_FAULT' },
    { label: 'Другое', value: 'OTHER' },
];

const PHOTO_FIELDS = [
    { name: 'oldMeter', title: 'Фото старого счетчика' },
    { name: 'seal', title: 'Фото пломбы' },
    { name: 'frontPanel', title: 'Фото лицевой панели счетчика' },
    { name: 'generalView', title: 'Общий вид' },
    { name: 'actPaper', title: 'Фото бумажного акта' },
    { name: 'refusalProof', title: 'Фото подтверждения отказа' },
];

const mapTaskToReportDefaults = (task) => ({
    ...reportSubmitFormDefaultValues,
    customerName: task?.consumer?.full_name || '',
    personalAccount: task?.address?.account_number || '',
    meterBefore: {
        ...reportSubmitFormDefaultValues.meterBefore,
        type: task?.meter?.type || '',
        number: task?.meter?.number || '',
    },
});

const ReportSubmitForm = ({ task, id }) => {
    const router = useRouter();
    const [stepIndex, setStepIndex] = useState(0);
    const draftId = String(task?.id ?? id);
    const reportPhotos = useStorePictures(
        (state) => state.photos.report?.[id] ?? {}
    );
    const setPhoto = useStorePictures((state) => state.setPhoto);
    const clearPhoto = useStorePictures((state) => state.clearPhoto);
    const clearEntityPhotos = useStorePictures(
        (state) => state.clearEntityPhotos
    );
    const { submitTaskReport, isPending: isSubmitting } = useSubmitReport();
    const draftValues = useReportDraftStore(
        (state) => state.drafts?.[draftId] ?? null
    );
    const setDraft = useReportDraftStore((state) => state.setDraft);
    const clearDraft = useReportDraftStore((state) => state.clearDraft);

    const initialValues = useMemo(() => {
        const taskDefaults = mapTaskToReportDefaults(task);

        return {
            ...taskDefaults,
            ...draftValues,
            meterBefore: {
                ...taskDefaults.meterBefore,
                ...draftValues?.meterBefore,
            },
            metering: {
                ...reportSubmitFormDefaultValues.metering,
                ...draftValues?.metering,
            },
            photos: {
                ...reportSubmitFormDefaultValues.photos,
                ...draftValues?.photos,
            },
            admission: {
                ...reportSubmitFormDefaultValues.admission,
                ...draftValues?.admission,
            },
            consumerContact: {
                ...reportSubmitFormDefaultValues.consumerContact,
                ...draftValues?.consumerContact,
            },
        };
    }, [draftValues, task]);

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(reportSubmitFormSchema),
        mode: 'onChange',
        shouldUnregister: false,
        defaultValues: initialValues,
    });
    const formValues = useWatch({ control });

    useEffect(() => {
        reset(initialValues);
    }, [initialValues, reset]);

    useEffect(() => {
        if (watch('clientReportId')) {
            return;
        }

        setValue('clientReportId', createClientReportId(), {
            shouldDirty: true,
            shouldValidate: false,
        });
    }, [setValue, watch]);

    const admissionStatus = watch('admission.status');
    const isRefusedContact = watch('consumerContact.isRefusedContact');
    const isLastStep = stepIndex === FORM_STEPS.length - 1;
    const isFirstStep = stepIndex === 0;

    useEffect(() => {
        if (admissionStatus === 'NOT_ADMITTED') {
            return;
        }

        setValue('admission.rejectionReason', '', {
            shouldDirty: true,
            shouldValidate: true,
        });
        setValue('admission.rejectionComment', '', {
            shouldDirty: true,
            shouldValidate: true,
        });
    }, [admissionStatus, setValue]);

    useEffect(() => {
        Object.entries(reportPhotos).forEach(([slot, uri]) => {
            setValue(`photos.${slot}`, uri, {
                shouldDirty: true,
                shouldValidate: false,
            });
        });
    }, [reportPhotos, setValue]);

    useEffect(() => {
        if (!formValues) {
            return;
        }

        setDraft({ draftId, values: formValues });
    }, [draftId, formValues, setDraft]);

    const onSubmit = async (values) => {
        try {
            await submitTaskReport({ taskId: task?.id ?? id, values });
            clearDraft(draftId);
            clearEntityPhotos({ entity: 'report', entityId: id });
            reset(mapTaskToReportDefaults(task));

            Alert.alert(
                'Успешно',
                'Отчет успешно сохранен и отправлен на проверку.'
            );
        } catch (error) {
            Alert.alert(
                'Ошибка отправки',
                getApiErrorMessage(error, 'Не удалось отправить отчет.')
            );
        }
    };

    const renderTextField = ({
        name,
        label,
        placeholder,
        keyboardType = 'default',
        multiline = false,
        numberOfLines = 1,
        error,
        editable = true,
    }) => (
        <View style={styles.control}>
            <Text style={styles.label}>{label}</Text>
            <Controller
                control={control}
                name={name}
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        placeholder={placeholder}
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
                        editable={editable}
                        onBlur={onBlur}
                        onChangeText={onChange}
                    />
                )}
            />
            {error ? (
                <Text style={styles.errorText}>{error.message}</Text>
            ) : null}
        </View>
    );

    const renderSingleOptionGroup = ({ label, value, onChange, options }) => (
        <View style={styles.control}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.chipsRow}>
                {options.map((option) => {
                    const isSelected = value === option.value;

                    return (
                        <Pressable
                            key={option.value}
                            onPress={() => onChange(option.value)}
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
    );

    const renderStepIndicators = () => (
        <View style={styles.stepsWrap}>
            {FORM_STEPS.map((step, index) => {
                const isActive = index === stepIndex;
                const isCompleted = index < stepIndex;

                return (
                    <Pressable
                        key={step.key}
                        onPress={() => setStepIndex(index)}
                        style={styles.stepItem}>
                        <View
                            style={[
                                styles.stepBadge,
                                isActive && styles.stepBadgeActive,
                                isCompleted && styles.stepBadgeCompleted,
                            ]}>
                            <Text
                                style={[
                                    styles.stepBadgeText,
                                    (isActive || isCompleted) &&
                                        styles.stepBadgeTextActive,
                                ]}>
                                {index + 1}
                            </Text>
                        </View>
                    </Pressable>
                );
            })}
        </View>
    );

    const renderBeforeWorkStep = () => (
        <View style={styles.section}>
            {renderTextField({
                name: 'customerName',
                label: 'ФИО',
                placeholder: 'Введите ФИО',
                error: errors.customerName,
            })}
            {renderTextField({
                name: 'personalAccount',
                label: 'Лицевой счет',
                placeholder: 'Введите лицевой счет',
                keyboardType: 'number-pad',
                error: errors.personalAccount,
            })}
            {renderTextField({
                name: 'meterBefore.type',
                label: 'Тип старого ПУ',
                placeholder: 'Введите тип старого ПУ',
                error: errors.meterBefore?.type,
            })}
            {renderTextField({
                name: 'meterBefore.number',
                label: 'Номер старого ПУ',
                placeholder: 'Введите номер старого ПУ',
                error: errors.meterBefore?.number,
            })}
            {renderTextField({
                name: 'meterBefore.actualType',
                label: 'Фактический тип старого ПУ',
                placeholder: 'Введите фактический тип при отличии',
                error: errors.meterBefore?.actualType,
            })}
            {renderTextField({
                name: 'meterBefore.actualNumber',
                label: 'Фактический номер старого ПУ',
                placeholder: 'Введите фактический номер при отличии',
                error: errors.meterBefore?.actualNumber,
            })}
            {renderTextField({
                name: 'comment',
                label: 'Комментарий к отчету',
                placeholder: 'Добавьте комментарий при необходимости',
                multiline: true,
                numberOfLines: 4,
                error: errors.comment,
            })}
        </View>
    );

    const renderMeteringStep = () => (
        <View style={styles.section}>
            <View style={styles.switchRow}>
                <Text style={styles.label}>Демонтаж выполнен</Text>
                <Controller
                    control={control}
                    name='metering.dismantlingCompleted'
                    render={({ field: { onChange, value } }) => (
                        <Switch value={value} onValueChange={onChange} />
                    )}
                />
            </View>

            {renderTextField({
                name: 'metering.oldReading',
                label: 'Последние показания старого ПУ',
                placeholder: 'Введите показания',
                keyboardType: 'decimal-pad',
                error: errors.metering?.oldReading,
            })}
            {renderTextField({
                name: 'metering.newMeterType',
                label: 'Тип нового ПУ',
                placeholder: 'Введите тип нового ПУ',
                error: errors.metering?.newMeterType,
            })}
            {renderTextField({
                name: 'metering.newMeterNumber',
                label: 'Номер нового ПУ',
                placeholder: 'Введите номер нового ПУ',
                error: errors.metering?.newMeterNumber,
            })}
            <Controller
                control={control}
                name='metering.sealLocation'
                render={({ field: { onChange, value } }) =>
                    renderSingleOptionGroup({
                        label: 'Место установки пломбы',
                        value,
                        onChange,
                        options: SEAL_LOCATION_OPTIONS,
                    })
                }
            />
            {errors.metering?.sealLocation ? (
                <Text style={styles.errorText}>
                    {errors.metering.sealLocation.message}
                </Text>
            ) : null}
            {renderTextField({
                name: 'metering.sealNumber',
                label: 'Номер пломбы',
                placeholder: 'Введите номер пломбы',
                error: errors.metering?.sealNumber,
            })}
            {renderTextField({
                name: 'metering.installationReading',
                label: 'Показания при установке',
                placeholder: 'Введите показания при установке',
                keyboardType: 'decimal-pad',
                error: errors.metering?.installationReading,
            })}
        </View>
    );

    const renderPhotoField = (photoField) => {
        const uri = reportPhotos?.[photoField.name] || null;

        return (
            <View key={photoField.name} style={styles.control}>
                <Text style={styles.label}>{photoField.title}</Text>
                <MediaBlock
                    uri={uri}
                    handleOpenCamera={() => {
                        router.push({
                            pathname: '/(authorized)/camera',
                            params: {
                                action: 'reports',
                                id,
                                slot: photoField.name,
                            },
                        });
                    }}
                    handleUploadPhoto={(uriValue) => {
                        setPhoto({
                            entity: 'report',
                            entityId: id,
                            slot: photoField.name,
                            uri: uriValue,
                        });
                        setValue(`photos.${photoField.name}`, uriValue, {
                            shouldDirty: true,
                            shouldValidate: true,
                        });
                    }}
                    handleUpdatePhoto={(uriValue) => {
                        setPhoto({
                            entity: 'report',
                            entityId: id,
                            slot: photoField.name,
                            uri: uriValue,
                        });
                        setValue(`photos.${photoField.name}`, uriValue, {
                            shouldDirty: true,
                            shouldValidate: true,
                        });
                    }}
                    handleDeletePhoto={() => {
                        clearPhoto({
                            entity: 'report',
                            entityId: id,
                            slot: photoField.name,
                        });
                        setValue(`photos.${photoField.name}`, null, {
                            shouldDirty: true,
                            shouldValidate: true,
                        });
                    }}
                    disabled={isSubmitting}
                />
            </View>
        );
    };

    const renderPhotosStep = () => (
        <View style={styles.section}>{PHOTO_FIELDS.map(renderPhotoField)}</View>
    );

    const renderAdmissionStep = () => (
        <View style={styles.section}>
            <Controller
                control={control}
                name='admission.status'
                render={({ field: { onChange, value } }) =>
                    renderSingleOptionGroup({
                        label: 'Статус допуска',
                        value,
                        onChange,
                        options: ADMISSION_STATUS_OPTIONS,
                    })
                }
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
                    render={({ field: { onChange, value } }) =>
                        renderSingleOptionGroup({
                            label: 'Причина недопуска',
                            value,
                            onChange,
                            options: REJECTION_REASON_OPTIONS,
                        })
                    }
                />
            ) : null}
            {errors.admission?.rejectionReason ? (
                <Text style={styles.errorText}>
                    {errors.admission.rejectionReason.message}
                </Text>
            ) : null}

            {renderTextField({
                name: 'admission.rejectionComment',
                label: 'Комментарий',
                placeholder: 'Добавьте комментарий при необходимости',
                multiline: true,
                numberOfLines: 4,
                error: errors.admission?.rejectionComment,
            })}
        </View>
    );

    const renderContactsStep = () => (
        <View style={styles.section}>
            <View style={styles.switchRow}>
                <Text style={styles.label}>
                    Отказ от предоставления контактов
                </Text>
                <Controller
                    control={control}
                    name='consumerContact.isRefusedContact'
                    render={({ field: { onChange, value } }) => (
                        <Switch
                            value={value}
                            onValueChange={(nextValue) => {
                                onChange(nextValue);

                                if (nextValue) {
                                    setValue(
                                        'consumerContact.phoneNumber',
                                        '',
                                        {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                        }
                                    );
                                    setValue(
                                        'consumerContact.phoneNumber2',
                                        '',
                                        {
                                            shouldDirty: true,
                                            shouldValidate: true,
                                        }
                                    );
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
            </View>
            {errors.consumerContact?.isRefusedContact ? (
                <Text style={styles.errorText}>
                    {errors.consumerContact.isRefusedContact.message}
                </Text>
            ) : null}

            {renderTextField({
                name: 'consumerContact.phoneNumber',
                label: 'Телефон 1',
                placeholder: 'Введите телефон',
                keyboardType: 'phone-pad',
                editable: !isRefusedContact,
                error: errors.consumerContact?.phoneNumber,
            })}
            {renderTextField({
                name: 'consumerContact.phoneNumber2',
                label: 'Телефон 2',
                placeholder: 'Введите дополнительный телефон',
                keyboardType: 'phone-pad',
                editable: !isRefusedContact,
                error: errors.consumerContact?.phoneNumber2,
            })}
            {renderTextField({
                name: 'consumerContact.email',
                label: 'Email',
                placeholder: 'Введите email',
                keyboardType: 'email-address',
                editable: !isRefusedContact,
                error: errors.consumerContact?.email,
            })}
            {renderTextField({
                name: 'consumerContact.fullName',
                label: 'ФИО контактного лица',
                placeholder: 'Введите ФИО контактного лица',
                editable: !isRefusedContact,
                error: errors.consumerContact?.fullName,
            })}
        </View>
    );

    const renderCurrentStep = () => {
        switch (FORM_STEPS[stepIndex].key) {
            case 'beforeWork':
                return renderBeforeWorkStep();
            case 'metering':
                return renderMeteringStep();
            case 'photos':
                return renderPhotosStep();
            case 'admission':
                return renderAdmissionStep();
            case 'contacts':
                return renderContactsStep();
            default:
                return null;
        }
    };

    return (
        <Card title='Отчет по задаче' style={styles.card}>
            <Text style={styles.description}>
                Заполните отчет по выполненным работам и отправьте его на
                проверку.
            </Text>

            {renderStepIndicators()}

            <View style={styles.stepTitleWrap}>
                <Text style={styles.stepTitle}>
                    {FORM_STEPS[stepIndex].title}
                </Text>
            </View>

            {renderCurrentStep()}

            <View style={styles.navigationRow}>
                {!isFirstStep ? (
                    <FormButton
                        message='Назад'
                        onPress={() =>
                            setStepIndex((currentStep) => currentStep - 1)
                        }
                        style={styles.secondaryButton}
                    />
                ) : (
                    <View style={styles.buttonSpacer} />
                )}

                {isLastStep ? (
                    <FormButton
                        message='Сохранить отчет'
                        onPress={handleSubmit(onSubmit)}
                        isPending={isSubmitting}
                        disabled={isSubmitting}
                        style={styles.primaryButton}
                    />
                ) : (
                    <FormButton
                        message='Далее'
                        onPress={() =>
                            setStepIndex((currentStep) => currentStep + 1)
                        }
                        style={styles.primaryButton}
                    />
                )}
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: { gap: 16, marginTop: 16 },
    description: { fontSize: 14, lineHeight: 20, color: '#62758f' },
    stepsWrap: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 10,
    },
    stepItem: { flex: 1, alignItems: 'center' },
    stepBadge: {
        width: 34,
        height: 34,
        borderRadius: 17,
        borderWidth: 1,
        borderColor: '#c8d3df',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    stepBadgeActive: { borderColor: '#278cff', backgroundColor: '#278cff' },
    stepBadgeCompleted: { borderColor: '#6bbf59', backgroundColor: '#dff6da' },
    stepBadgeText: { color: '#62758f', fontWeight: '700' },
    stepBadgeTextActive: { color: '#fff' },
    stepTitleWrap: { paddingTop: 4 },
    stepTitle: { fontSize: 18, fontWeight: '700', color: '#183153' },
    section: { gap: 2 },
    control: { marginBottom: 14 },
    label: { marginBottom: 8, fontSize: 13, color: '#4d5f73' },
    input: {
        minHeight: 48,
        borderWidth: 1,
        borderColor: '#d5deea',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: '#183153',
        backgroundColor: '#fff',
    },
    textArea: { minHeight: 110 },
    inputDisabled: { backgroundColor: '#f5f7fa', color: '#97a3b1' },
    inputError: { borderColor: '#d84c4c', backgroundColor: '#fff5f5' },
    errorText: { marginTop: 6, fontSize: 12, color: '#d84c4c' },
    chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: '#d5deea',
        backgroundColor: '#fff',
    },
    chipSelected: { borderColor: '#278cff', backgroundColor: '#eaf4ff' },
    chipText: { color: '#4d5f73', fontWeight: '600' },
    chipTextSelected: { color: '#1a5eb0' },
    switchRow: {
        marginBottom: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
    },
    navigationRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
    primaryButton: { flex: 1, ...colors.secondary },
    secondaryButton: { flex: 1, ...colors.ordinary },
    buttonSpacer: { flex: 1 },
});

export default ReportSubmitForm;
