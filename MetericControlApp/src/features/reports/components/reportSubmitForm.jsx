import { REPORT_API_FIELDS } from '@/features/reports/constants/reportFieldReferences';
import { buildReportImageFile } from '@/features/reports/lib/buildReportPayload';
import {
    REPORT_IMAGE_MAX_BYTES,
    validateReportPhoto,
} from '@/features/reports/lib/validateReportUploadFiles';
import { fillEmptyReportFields } from '@/features/reports/lib/fillEmptyReportFields';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useMutationState } from '@tanstack/react-query';
import { getReportOperationFilters } from '@/features/reports/lib/reportOperation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import {
    Alert,
    Keyboard,
    Pressable,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useRouter } from 'expo-router';

import FormButton from '@/shared/components/button/formButton';
import { getApiErrorMessage } from '@/shared/api/getApiErrorMessage';
import { HighlightWrap } from '@/shared/components/wrapper/highlightWrapper';
import MediaBlock from '@/shared/components/media/mediaBlock';
import useStorePictures from '@/shared/store/useStorePictures';

import { reportSubmitFormSchema } from '@/features/reports/model/reportSubmitFormSchema';
import { reportSubmitFormDefaultValues } from '@/features/reports/constants/reportSubmitFormDefaults';
import { REPORT_PHOTO_CONFIGS } from '@/features/reports/constants/reportPhotoConfigs';
import {
    REPORT_ACT_FIELDS,
    OPTIONAL_BOOLEAN_OPTIONS,
} from '@/features/reports/constants/reportActFields';
import {
    REJECTION_REASON_OPTIONS,
    SEAL_LOCATION_OPTIONS,
} from '@/features/reports/constants/reportFieldOptions';
import useSubmitReport from '@/features/reports/hooks/useSubmitReport';
import { mapTaskToReportDefaults } from '@/features/reports/lib/mapTaskToReportDefaults';
import { createClientReportId } from '@/features/reports/lib/createClientReportId';
import {
    buildReportReplacement,
    mapReportImagesToForm,
    mapReportToFormValues,
} from '@/features/reports/lib/reportFormHydration';
import { mergeReportPhotoMetadata } from '@/features/reports/lib/reportPhotoMetadata';
import useReportDraftStore from '@/features/reports/store/useReportDraftStore';
import useLoadBrigadeReport from '@/features/reports/hooks/useLoadBrigadeReport';
import useNetwork from '@/shared/hooks/offline/useNetwork';
import { areReportDraftsEqual } from '@/features/reports/lib/areReportDraftsEqual';
import { validateReportAct } from '@/features/reports/lib/validateReportAct';
import { ensureActFileExists } from '@/features/reports/lib/ensureActFileExists';
import { generateActPdf } from '@/features/reports/lib/generateActPdf';
import useReportActStore from '@/features/reports/store/useReportActStore';
import * as Sharing from 'expo-sharing';
import useActTemplatesStore from '@/features/reports/store/useActTemplatesStore';
import ActDocumentPanel from '@/features/reports/components/actDocumentPanel';
import ReportDateField from './reportDateField';
import {
    ReportFormSection,
    ReportFieldLayout,
    ReportFormSteps,
} from './reportFormLayout';
import {
    REPORT_FORM_STEPS as FORM_STEPS,
    getFirstReportValidationError,
} from '@/features/reports/lib/reportFormValidation';

const ADMISSION_STATUS_OPTIONS = [
    { label: 'Допущен', value: 'ADMITTED' },
    { label: 'Не допущен', value: 'NOT_ADMITTED' },
];

const ReportSubmitForm = ({
    onError,
    onActionStart,
    task,
    existingReport,
    id,
    fillPositions,
    stepIndex,
    setStepIndex,
    highlightedField,
    defaultActTemplate,
    onValidationError,
}) => {
    const router = useRouter();
    const [clearedRemarks, setClearedRemarks] = useState(null);
    const renderRemark = (name) => {
        if (
            existingReport?.status !== 'REJECTED' ||
            clearedRemarks === existingReport
        )
            return null;
        const messages = (existingReport.rejected_fields ?? [])
            .filter((remark) => {
                let field = REPORT_API_FIELDS[remark.field];
                if (!getValues('meterBefore.isActualDifferent')) {
                    if (field === 'meterBefore.actualNumber')
                        field = 'meterBefore.number';
                    if (field === 'meterBefore.actualType')
                        field = 'meterBefore.type';
                }
                return field === name;
            })
            .map((remark) => remark.comment)
            .filter(Boolean);
        return messages.length ? (
            <Text style={styles.errorText}>
                {[...new Set(messages)].join('\n')}
            </Text>
        ) : null;
    };
    const { isOnline } = useNetwork();
    const hydratedDraftIdRef = useRef(null);
    const hydratedPhotosIdRef = useRef(null);
    const draftId = String(task?.id ?? id);
    const pendingOperations = useMutationState({
        filters: getReportOperationFilters(draftId),
    });
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const generatingPdfRef = useRef(false);
    const isReportBusy = pendingOperations.length > 0 || isGeneratingPdf;
    const signatureResult = useReportActStore((state) => state.result);
    const startSignatureSession = useReportActStore(
        (state) => state.startSession
    );
    const clearSignatureSession = useReportActStore(
        (state) => state.clearSession
    );
    const reportPhotosRaw = useStorePictures(
        (state) => state.photos.report?.[id]
    );
    const reportPhotos = useMemo(
        () => reportPhotosRaw ?? {},
        [reportPhotosRaw]
    );
    const reportPhotoMetadataRaw = useStorePictures(
        (state) => state.photoMetadata.report?.[id]
    );
    const reportPhotoMetadata = useMemo(
        () => reportPhotoMetadataRaw ?? {},
        [reportPhotoMetadataRaw]
    );
    const replaceEntityPhotos = useStorePictures(
        (state) => state.replaceEntityPhotos
    );
    const appendPhoto = useStorePictures((state) => state.appendPhoto);
    const setPhoto = useStorePictures((state) => state.setPhoto);
    const updatePhoto = useStorePictures((state) => state.updatePhoto);
    const removePhotoAt = useStorePictures((state) => state.removePhotoAt);
    const clearEntityPhotos = useStorePictures(
        (state) => state.clearEntityPhotos
    );
    const setEntityPhotoMetadata = useStorePictures(
        (state) => state.setEntityPhotoMetadata
    );
    const addRemovedPhotoId = useStorePictures(
        (state) => state.addRemovedPhotoId
    );
    const { submitTaskReport, isPending: isSubmitting } = useSubmitReport();
    const draftValues = useReportDraftStore(
        (state) => state.drafts?.[draftId] ?? null
    );
    const savedAct = useReportActStore(
        (state) => state.actMetadataByTask[draftId]
    );
    const setDraft = useReportDraftStore((state) => state.setDraft);
    const clearDraft = useReportDraftStore((state) => state.clearDraft);
    const templates = useActTemplatesStore((state) => state.templates);
    const initialValues = useMemo(() => {
        const taskDefaults = mapReportToFormValues(
            task?.is_team_task ? null : existingReport,
            mapTaskToReportDefaults(task)
        );
        const draftFormValues = draftValues ? { ...draftValues } : null;
        if (draftFormValues) {
            delete draftFormValues.photoMetadata;
            delete draftFormValues.removedPhotoIds;
            delete draftFormValues.act;
            delete draftFormValues.address;
        }

        return {
            ...taskDefaults,
            ...draftFormValues,
            address: taskDefaults.address,
            actDetails: {
                ...taskDefaults.actDetails,
                ...draftFormValues?.actDetails,
            },
            meterBefore: {
                ...taskDefaults.meterBefore,
                ...draftFormValues?.meterBefore,
            },
            metering: {
                ...taskDefaults.metering,
                ...draftFormValues?.metering,
            },
            photos: { ...taskDefaults.photos, ...draftFormValues?.photos },
            admission: {
                ...taskDefaults.admission,
                ...draftFormValues?.admission,
            },
            consumerContact: {
                ...taskDefaults.consumerContact,
                ...draftFormValues?.consumerContact,
            },
            actPdf: {
                ...reportSubmitFormDefaultValues.actPdf,
                ...draftValues?.actPdf,
                signatures: savedAct?.signatures ?? {},
                checksum: savedAct?.checksum,
                templateId: savedAct?.templateId,
                uri:
                    savedAct?.checksum &&
                    savedAct.checksum === draftValues?.actPdf?.checksum &&
                    areReportDraftsEqual(
                        savedAct.signatures,
                        draftValues?.actPdf?.signatures ?? {}
                    )
                        ? (draftValues?.actPdf?.uri ?? '')
                        : '',
            },
        };
    }, [draftValues, existingReport, task, savedAct]);

    const initialPhotoMetadata = useMemo(
        () =>
            mapReportImagesToForm(
                task?.is_team_task ? [] : existingReport?.images
            ).photoMetadata,
        [existingReport?.images, task?.is_team_task]
    );

    const template =
        templates.find(
            (item) => String(item.id) === initialValues.actPdf.templateId
        )?.id ?? defaultActTemplate;

    const {
        control,
        handleSubmit,
        getValues,
        setError,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(reportSubmitFormSchema),
        mode: 'onTouched',
        reValidateMode: 'onChange',
        shouldUnregister: false,
        defaultValues: initialValues,
    });
    useWatch({ control });

    useEffect(() => {
        if (hydratedDraftIdRef.current === draftId) {
            return;
        }

        reset(initialValues);
        hydratedDraftIdRef.current = draftId;
    }, [draftId, initialValues, reset]);

    useEffect(() => {
        if (signatureResult?.taskId !== draftId) return;
        setValue('actPdf', signatureResult.actPdf, {
            shouldDirty: true,
            shouldValidate: true,
        });
        clearSignatureSession();
    }, [signatureResult, draftId, setValue, clearSignatureSession]);

    useEffect(() => {
        if (hydratedPhotosIdRef.current === draftId) {
            return;
        }

        Object.entries(initialValues.photos).forEach(([slot, uris]) => {
            const localUris = Array.isArray(reportPhotos[slot])
                ? reportPhotos[slot]
                : reportPhotos[slot]
                  ? [reportPhotos[slot]]
                  : [];
            const mergedUris = [
                ...uris,
                ...localUris.filter((uri) => !uris.includes(uri)),
            ];

            if (
                mergedUris.length &&
                mergedUris.some((uri, index) => uri !== localUris[index])
            ) {
                setPhoto({
                    entity: 'report',
                    entityId: id,
                    slot,
                    uri: mergedUris,
                });
            }
        });
        setEntityPhotoMetadata({
            entity: 'report',
            entityId: id,
            photoMetadata: mergeReportPhotoMetadata({
                serverMetadata: initialPhotoMetadata,
                localMetadata: reportPhotoMetadata,
            }),
        });
        hydratedPhotosIdRef.current = draftId;
    }, [
        draftId,
        id,
        initialPhotoMetadata,
        initialValues.photos,
        reportPhotoMetadata,
        reportPhotos,
        setEntityPhotoMetadata,
        setPhoto,
    ]);

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
    const isActualMeterDifferent = watch('meterBefore.isActualDifferent');
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
        if (isActualMeterDifferent) {
            return;
        }

        setValue('meterBefore.actualType', '', {
            shouldDirty: true,
            shouldValidate: true,
        });
        setValue('meterBefore.actualNumber', '', {
            shouldDirty: true,
            shouldValidate: true,
        });
    }, [isActualMeterDifferent, setValue]);

    useEffect(() => {
        Object.entries(reportPhotos).forEach(([slot, uris]) => {
            setValue(`photos.${slot}`, Array.isArray(uris) ? uris : [uris], {
                shouldDirty: true,
                shouldValidate: false,
            });
        });
    }, [reportPhotos, setValue]);

    const { loadReport, isLoading: isLoadingReport } = useLoadBrigadeReport({
        onError,
        taskId: task?.id ?? id,
        onLoaded: (report, mode) => {
            const replacement = buildReportReplacement(
                report,
                mapTaskToReportDefaults(task)
            );
            const pictures = useStorePictures.getState();
            const {
                values,
                photoMetadata,
                removedPhotoIds = [],
            } = mode === 'empty'
                ? fillEmptyReportFields({
                      currentValues: {
                          ...getValues(),
                          photos:
                              pictures.photos.report?.[id] ??
                              getValues('photos'),
                      },
                      replacement,
                      localPhotoMetadata: pictures.photoMetadata.report?.[id],
                      removedPhotoIds: pictures.removedPhotoIds.report?.[id],
                  })
                : replacement;
            hydratedDraftIdRef.current = draftId;
            hydratedPhotosIdRef.current = draftId;
            replaceEntityPhotos({
                entity: 'report',
                entityId: id,
                photos: values.photos,
                photoMetadata,
                removedPhotoIds,
            });
            reset(values);
            setDraft({ draftId, values });
            setStepIndex(0);
        },
    });

    const confirmLoadReport = () => {
        if (!isOnline || isReportBusy) return;
        onActionStart();
        const load = (mode) => {
            Keyboard.dismiss();
            void loadReport(mode);
        };
        Alert.alert(
            'Загрузить отчёт бригады',
            'Заменить весь отчёт или заполнить только пустые поля? Во втором случае ваши заполненные значения и фото-разделы сохранятся. Выключенные галочки включатся, если они включены на сервере; уже включённые останутся включёнными. После загрузки отчёт нужно отправить вручную.',
            [
                { text: 'Отмена', style: 'cancel' },
                { text: 'Только пустые поля', onPress: () => load('empty') },
                {
                    text: 'Заменить всё',
                    style: 'destructive',
                    onPress: () =>
                        Alert.alert(
                            'Заменить ваш отчёт?',
                            'Все поля и фотографии будут заменены данными с сервера, включая пустые поля. Ожидающая отправка старого черновика будет отменена. Отменить замену нельзя.',
                            [
                                { text: 'Отмена', style: 'cancel' },
                                {
                                    text: 'Заменить',
                                    style: 'destructive',
                                    onPress: () => load('replace'),
                                },
                            ]
                        ),
                },
            ]
        );
    };

    const onSubmit = async (values) => {
        if (isReportBusy) return;
        onActionStart();
        try {
            const res = await submitTaskReport({
                taskId: task?.id ?? id,
                values,
            });
            if (res.skipped) {
                return;
            }
            if (res.offline) {
                Alert.alert(
                    'Успешно',
                    'Отчет сохранен и будет отправлен при появлении интернета.'
                );
            } else {
                setClearedRemarks(existingReport);
                clearDraft(draftId);
                clearEntityPhotos({ entity: 'report', entityId: id });
                const nextValues = mapReportToFormValues(
                    res.reportResponse,
                    mapTaskToReportDefaults(task)
                );
                const nextPhotoMetadata = mapReportImagesToForm(
                    res.reportResponse.images
                ).photoMetadata;
                reset(nextValues);
                hydratedDraftIdRef.current = draftId;
                hydratedPhotosIdRef.current = draftId;
                Object.entries(nextValues.photos).forEach(([slot, uris]) => {
                    if (uris.length) {
                        setPhoto({
                            entity: 'report',
                            entityId: id,
                            slot,
                            uri: uris,
                        });
                    }
                });
                setEntityPhotoMetadata({
                    entity: 'report',
                    entityId: id,
                    photoMetadata: nextPhotoMetadata,
                });

                Alert.alert(
                    'Успешно',
                    'Отчет успешно сохранен и отправлен на проверку.'
                );
            }
        } catch (error) {
            if (error.code === 'REPORT_VALIDATION_ERROR') {
                for (const issue of error.issues)
                    setError(issue.path.join('.'), {
                        type: 'validate',
                        message: issue.message,
                    });
                onInvalid(error.validationErrors);
                return;
            }
            if (error.code === 'REPORT_ACT_INVALID') {
                setStepIndex(
                    FORM_STEPS.findIndex((step) => step.key === 'act')
                );
                onValidationError?.('actPdf');
            }
            onError(
                'Ошибка отправки',
                getApiErrorMessage(
                    error,
                    'Не удалось отправить отчёт. Проверьте подключение и повторите отправку.'
                )
            );
        }
    };

    const onInvalid = (validationErrors) => {
        const error = getFirstReportValidationError(validationErrors);
        Keyboard.dismiss();
        if (error.stepIndex !== null) {
            setStepIndex(error.stepIndex);
        }
        onValidationError?.(error.field);
        onError('Проверьте отчёт', error.message);
    };

    const goToStep = (nextStep) => {
        if (isReportBusy) return;
        Keyboard.dismiss();
        setStepIndex(nextStep);
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
        required = false,
    }) => (
        <ReportFieldLayout name={name} fillPositions={fillPositions}>
            <HighlightWrap isActive={highlightedField === name}>
                <View style={styles.control}>
                    <Text style={styles.label}>
                        {label}
                        {required && (
                            <Text style={styles.requiredMark}> *</Text>
                        )}
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
                                editable={editable && !isReportBusy}
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
            </HighlightWrap>
        </ReportFieldLayout>
    );

    const renderSingleOptionGroup = ({
        label,
        value,
        onChange,
        onBlur,
        options,
        name,
        allowEmpty = false,
        required = false,
    }) => (
        <ReportFieldLayout name={name} fillPositions={fillPositions}>
            <HighlightWrap isActive={highlightedField === name}>
                <View style={styles.control}>
                    <Text style={styles.label}>
                        {label}
                        {required && (
                            <Text style={styles.requiredMark}> *</Text>
                        )}
                    </Text>
                    <View style={styles.chipsRow}>
                        {options.map((option) => {
                            const isSelected = value === option.value;

                            return (
                                <Pressable
                                    key={String(option.value)}
                                    accessibilityRole='radio'
                                    accessibilityState={{ checked: isSelected }}
                                    onPress={() => {
                                        onChange(
                                            allowEmpty && isSelected
                                                ? ''
                                                : option.value
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
                                            isSelected &&
                                                styles.chipTextSelected,
                                        ]}>
                                        {option.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>
                {renderRemark(name)}
            </HighlightWrap>
        </ReportFieldLayout>
    );

    const renderToggleRow = ({
        label,
        value,
        onChange,
        onBlur,
        name,
        disabled = false,
    }) => (
        <ReportFieldLayout name={name} fillPositions={fillPositions}>
            <HighlightWrap isActive={highlightedField === name}>
                <Pressable
                    accessibilityRole='switch'
                    accessibilityState={{
                        checked: Boolean(value),
                        disabled: disabled || isReportBusy,
                    }}
                    disabled={disabled || isReportBusy}
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
                        disabled={disabled || isReportBusy}
                        trackColor={{ false: '#d8e0ec', true: '#b7d5ff' }}
                        thumbColor={value ? '#2469c9' : '#fff'}
                    />
                </Pressable>
                {renderRemark(name)}
            </HighlightWrap>
        </ReportFieldLayout>
    );

    const renderActFields = (fields, title) => (
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
                                            disabled={isReportBusy}
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
                                }) =>
                                    renderSingleOptionGroup({
                                        name,
                                        label: field.label,
                                        value,
                                        onChange,
                                        onBlur,
                                        options:
                                            field.options ??
                                            OPTIONAL_BOOLEAN_OPTIONS,
                                        allowEmpty: field.kind === 'choice',
                                    })
                                }
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
                        {renderTextField({
                            name,
                            label: field.label,
                            error,
                            placeholder:
                                field.kind === 'reading'
                                    ? 'Введите показания'
                                    : 'Не указано',
                            keyboardType:
                                field.kind === 'integer'
                                    ? 'number-pad'
                                    : field.kind === 'reading'
                                      ? 'decimal-pad'
                                      : 'default',
                            multiline:
                                field.maxLength === null &&
                                field.kind === 'text',
                        })}
                    </View>
                );
            })}
        </ReportFormSection>
    );

    const renderBeforeWorkStep = () => (
        <View style={styles.sectionList}>
            <ReportFormSection title='Данные потребителя' icon='person-outline'>
                {renderTextField({
                    name: 'customerName',
                    required: true,
                    label: 'ФИО',
                    placeholder: 'Введите ФИО',
                    error: errors.customerName,
                })}
                {renderTextField({
                    name: 'personalAccount',
                    required: true,
                    label: 'Лицевой счет',
                    placeholder: 'Введите лицевой счет',
                    keyboardType: 'number-pad',
                    error: errors.personalAccount,
                })}
            </ReportFormSection>
            <ReportFormSection
                title='Старый счётчик'
                icon='speedometer-outline'>
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
                <Controller
                    control={control}
                    name='meterBefore.isActualDifferent'
                    render={({ field: { onChange, onBlur, value } }) =>
                        renderToggleRow({
                            name: 'meterBefore.isActualDifferent',
                            label: 'Фактический ПУ отличается',
                            value,
                            onChange,
                            onBlur,
                        })
                    }
                />
                {isActualMeterDifferent ? (
                    <>
                        {renderTextField({
                            name: 'meterBefore.actualType',
                            label: 'Фактический тип старого ПУ',
                            placeholder: 'Введите фактический тип при отличии',
                            error: errors.meterBefore?.actualType,
                        })}
                        {renderTextField({
                            name: 'meterBefore.actualNumber',
                            label: 'Фактический номер старого ПУ',
                            placeholder:
                                'Введите фактический номер при отличии',
                            error: errors.meterBefore?.actualNumber,
                        })}
                    </>
                ) : null}
            </ReportFormSection>
            {renderActFields(
                REPORT_ACT_FIELDS.filter(
                    (field) => field.group === 'meterBefore'
                ),
                'Характеристики старого счётчика'
            )}
            <ReportFormSection
                title='Заметки по задаче'
                icon='chatbubble-ellipses-outline'>
                {renderTextField({
                    name: 'comment',
                    label: 'Комментарий к задаче',
                    placeholder: 'Добавьте комментарий при необходимости',
                    multiline: true,
                    numberOfLines: 4,
                    error: errors.comment,
                })}
            </ReportFormSection>
        </View>
    );

    const renderMeteringStep = () => (
        <View style={styles.sectionList}>
            <ReportFormSection
                title='Демонтаж старого счётчика'
                icon='construct-outline'>
                <Controller
                    control={control}
                    name='metering.dismantlingCompleted'
                    render={({ field: { onChange, onBlur, value } }) =>
                        renderToggleRow({
                            name: 'metering.dismantlingCompleted',
                            label: 'Демонтаж выполнен',
                            value,
                            onChange,
                            onBlur,
                        })
                    }
                />

                {errors.metering?.dismantlingCompleted && (
                    <Text style={styles.errorText}>
                        {errors.metering.dismantlingCompleted.message}
                    </Text>
                )}
                {renderTextField({
                    name: 'metering.oldReading',
                    label: 'Последние показания старого ПУ',
                    placeholder: 'Введите показания',
                    keyboardType: 'decimal-pad',
                    error: errors.metering?.oldReading,
                })}
            </ReportFormSection>
            {renderActFields(
                REPORT_ACT_FIELDS.filter((field) =>
                    ['oldT1', 'oldT2'].includes(field.name)
                ),
                'Тарифные показания старого счётчика'
            )}
            <ReportFormSection title='Новый счётчик' icon='flash-outline'>
                {renderTextField({
                    name: 'metering.newMeterType',
                    required: true,
                    label: 'Тип нового ПУ',
                    placeholder: 'Введите тип нового ПУ',
                    error: errors.metering?.newMeterType,
                })}
                {renderTextField({
                    name: 'metering.newMeterNumber',
                    required: true,
                    label: 'Номер нового ПУ',
                    placeholder: 'Введите номер нового ПУ',
                    error: errors.metering?.newMeterNumber,
                })}
                {renderTextField({
                    name: 'metering.installationReading',
                    required: true,
                    label: 'Показания при установке',
                    placeholder: 'Введите показания при установке',
                    keyboardType: 'decimal-pad',
                    error: errors.metering?.installationReading,
                })}
            </ReportFormSection>
            <ReportFormSection
                title='Пломбирование'
                icon='shield-checkmark-outline'>
                <Controller
                    control={control}
                    name='metering.sealLocation'
                    render={({ field: { onChange, onBlur, value } }) =>
                        renderSingleOptionGroup({
                            name: 'metering.sealLocation',
                            label: 'Место установки пломбы',
                            value,
                            onChange,
                            onBlur,
                            options: SEAL_LOCATION_OPTIONS,
                            allowEmpty: true,
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
            </ReportFormSection>
            {renderActFields(
                REPORT_ACT_FIELDS.filter(
                    (field) =>
                        field.group === 'metering' &&
                        ![
                            'oldT1',
                            'oldT2',
                            'replacementReason',
                            'replacementReasonComment',
                        ].includes(field.name)
                ),
                'Характеристики нового счётчика'
            )}
            {renderActFields(
                REPORT_ACT_FIELDS.filter((field) =>
                    ['replacementReason', 'replacementReasonComment'].includes(
                        field.name
                    )
                ),
                'Причина замены'
            )}
        </View>
    );

    const renderPhotoField = (photoField) => {
        const uris = Array.isArray(reportPhotos?.[photoField.name])
            ? reportPhotos[photoField.name]
            : reportPhotos?.[photoField.name]
              ? [reportPhotos[photoField.name]]
              : [];
        const title =
            photoField.name === 'oldMeter' && isActualMeterDifferent
                ? 'Фото текущего счетчика'
                : photoField.title;

        const photoFieldName = `photos.${photoField.name}`;
        const markExistingPhotoRemoved = (uri) => {
            const metadata = reportPhotoMetadata[photoField.name];
            const clientImageId = metadata?.find(
                (entry) => entry.uri === uri
            )?.clientImageId;
            if (!clientImageId) {
                if (
                    existingReport?.images?.some((image) => image.url === uri)
                ) {
                    onError(
                        'Не удалось удалить фото',
                        'Не удалось обновить это фото. Загрузите отчёт бригады заново и повторите попытку.'
                    );
                    return false;
                }
                return true;
            }

            addRemovedPhotoId({
                entity: 'report',
                entityId: id,
                clientImageId,
            });
            return true;
        };

        return (
            <ReportFieldLayout
                key={photoField.name}
                name={photoFieldName}
                fillPositions={fillPositions}>
                <HighlightWrap isActive={highlightedField === photoFieldName}>
                    <ReportFormSection
                        title={title}
                        icon='camera-outline'
                        description={
                            uris.length
                                ? `Добавлено фото: ${uris.length}`
                                : 'Сделайте снимок или выберите фото из галереи.'
                        }>
                        <MediaBlock
                            onError={onError}
                            uris={uris}
                            maxSizeBytes={REPORT_IMAGE_MAX_BYTES}
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
                            handleUploadPhoto={async (uriValue) => {
                                try {
                                    await validateReportPhoto(
                                        buildReportImageFile(
                                            uriValue,
                                            photoField.fileName
                                        ),
                                        ['photos', photoField.name]
                                    );
                                } catch (error) {
                                    onError(
                                        'Некорректная фотография',
                                        error.message
                                    );
                                    return;
                                }
                                appendPhoto({
                                    entity: 'report',
                                    entityId: id,
                                    slot: photoField.name,
                                    uri: uriValue,
                                });
                                setValue(
                                    `photos.${photoField.name}`,
                                    [...uris, uriValue],
                                    { shouldDirty: true, shouldValidate: true }
                                );
                            }}
                            handleUpdatePhoto={(uriValue, index) => {
                                if (!markExistingPhotoRemoved(uris[index])) {
                                    return;
                                }
                                updatePhoto({
                                    entity: 'report',
                                    entityId: id,
                                    slot: photoField.name,
                                    index,
                                    uri: uriValue,
                                });
                                const nextUris = [...uris];
                                nextUris[index] = uriValue;
                                setValue(
                                    `photos.${photoField.name}`,
                                    nextUris,
                                    { shouldDirty: true, shouldValidate: true }
                                );
                            }}
                            handleDeletePhoto={(index) => {
                                if (!markExistingPhotoRemoved(uris[index])) {
                                    return;
                                }
                                removePhotoAt({
                                    entity: 'report',
                                    entityId: id,
                                    slot: photoField.name,
                                    index,
                                });
                                setValue(
                                    `photos.${photoField.name}`,
                                    uris.filter(
                                        (_, uriIndex) => uriIndex !== index
                                    ),
                                    { shouldDirty: true, shouldValidate: true }
                                );
                            }}
                            disabled={isReportBusy}
                        />
                        {errors.photos?.[photoField.name]?.message && (
                            <Text style={styles.errorText}>
                                {errors.photos[photoField.name].message}
                            </Text>
                        )}
                        {renderRemark(photoFieldName)}
                    </ReportFormSection>
                </HighlightWrap>
            </ReportFieldLayout>
        );
    };

    const renderPhotosStep = () => (
        <View style={styles.sectionList}>
            {REPORT_PHOTO_CONFIGS.map(renderPhotoField)}
            {errors.photos?.message && (
                <Text style={styles.errorText}>{errors.photos.message}</Text>
            )}
        </View>
    );

    const renderAdmissionStep = () => (
        <View style={styles.sectionList}>
            <ReportFormSection
                title='Результат работ'
                icon='checkmark-circle-outline'>
                <Controller
                    control={control}
                    name='admission.status'
                    render={({ field: { onChange, onBlur, value } }) =>
                        renderSingleOptionGroup({
                            name: 'admission.status',
                            required: true,
                            label: 'Статус допуска',
                            value,
                            onChange,
                            onBlur,
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
                        render={({ field: { onChange, onBlur, value } }) =>
                            renderSingleOptionGroup({
                                name: 'admission.rejectionReason',
                                label: 'Причина недопуска',
                                value,
                                onChange,
                                onBlur,
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
                {admissionStatus === 'NOT_ADMITTED' &&
                    renderTextField({
                        name: 'admission.rejectionComment',
                        label: 'Пояснение причины недопуска',
                        placeholder: 'Укажите причину недопуска',
                        multiline: true,
                        error: errors.admission?.rejectionComment,
                    })}
            </ReportFormSection>
            {renderActFields(
                REPORT_ACT_FIELDS.filter(
                    (field) => field.group === 'admission'
                ),
                'Дополнительные сведения о допуске'
            )}
        </View>
    );

    const renderContactsStep = () => (
        <ReportFormSection
            title='Контакты потребителя'
            icon='call-outline'
            description='Если потребитель отказался, включите переключатель ниже.'>
            <Controller
                control={control}
                name='consumerContact.isRefusedContact'
                render={({ field: { onChange, onBlur, value } }) =>
                    renderToggleRow({
                        name: 'consumerContact.isRefusedContact',
                        label: 'Отказ от предоставления контактов',
                        value,
                        onBlur,
                        onChange: (nextValue) => {
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
                        },
                    })
                }
            />
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
            <Text style={styles.hintText}>
                Поле Телефон 2 заполняется только при наличии дополнительного
                номера.
            </Text>
            {renderTextField({
                name: 'consumerContact.email',
                label: 'Электронная почта',
                placeholder: 'Введите адрес электронной почты',
                keyboardType: 'email-address',
                editable: !isRefusedContact,
                error: errors.consumerContact?.email,
            })}
            {renderTextField({
                name: 'consumerContact.fullName',
                label: 'ФИО потребителя или его представителя',
                placeholder: 'Фамилия Имя Отчество',
                editable: !isRefusedContact,
                error: errors.consumerContact?.fullName,
            })}
        </ReportFormSection>
    );

    const hasTemplates = (templates?.length ?? 0) > 0;

    useEffect(() => {
        if (!hasTemplates) {
            setValue('actPdf.isRefused', true, {
                shouldDirty: true,
                shouldValidate: false,
            });
            setValue('actPdf.uri', '', {
                shouldDirty: true,
                shouldValidate: false,
            });
        }
    }, [hasTemplates, setValue]);

    const renderPdfStep = () => {
        const selectedTemplate = templates.find(
            (temp) => temp?.id === template
        );

        const printToFile = async () => {
            if (generatingPdfRef.current) return;
            onActionStart();
            generatingPdfRef.current = true;
            setIsGeneratingPdf(true);
            try {
                const actPdf = await generateActPdf({
                    template: selectedTemplate,
                    values: getValues(),
                    previousAct:
                        useReportActStore.getState().actMetadataByTask[draftId],
                });
                useReportActStore.getState().saveAct(draftId, actPdf);
                setValue('actPdf', actPdf, { shouldDirty: true });
            } catch {
                onError(
                    'Не удалось подготовить акт',
                    'Попробуйте ещё раз. Если ошибка повторится, пересоздайте акт.'
                );
            } finally {
                generatingPdfRef.current = false;
                setIsGeneratingPdf(false);
            }
        };

        return (
            <ReportFieldLayout name='actPdf' fillPositions={fillPositions}>
                <HighlightWrap isActive={highlightedField === 'actPdf'}>
                    {renderRemark('actPdf')}
                    <ReportFormSection
                        title='Цифровой акт'
                        icon='document-text-outline'>
                        <Controller
                            control={control}
                            name='actPdf.isRefused'
                            disabled={templates?.length === 0}
                            render={({ field: { onChange, onBlur, value } }) =>
                                renderToggleRow({
                                    name: 'actPdf.isRefused',
                                    label: 'Пропустить генерацию цифрового акта',
                                    value,
                                    disabled: !hasTemplates,
                                    onBlur,
                                    onChange: (nextValue) => {
                                        onChange(nextValue);
                                        if (nextValue) {
                                            setValue(
                                                'actPdf.uri',
                                                reportSubmitFormDefaultValues
                                                    .actPdf.uri,
                                                {
                                                    shouldDirty: true,
                                                    shouldValidate: false,
                                                }
                                            );
                                        }
                                    },
                                })
                            }
                        />
                        <ActDocumentPanel
                            onError={onError}
                            templates={templates}
                            template={template}
                            actPdf={getValues('actPdf')}
                            isBusy={isReportBusy}
                            isGenerating={isGeneratingPdf}
                            onGenerate={printToFile}
                            onShare={async () => {
                                onActionStart();
                                try {
                                    ensureActFileExists(
                                        getValues('actPdf.uri')
                                    );
                                    if (await Sharing.isAvailableAsync()) {
                                        await Sharing.shareAsync(
                                            getValues('actPdf.uri')
                                        );
                                    } else {
                                        onError(
                                            'Недоступно',
                                            'На этом устройстве нельзя поделиться файлом.'
                                        );
                                    }
                                } catch {
                                    onError(
                                        'Не удалось поделиться актом',
                                        'Попробуйте ещё раз. Если ошибка повторится, пересоздайте акт.'
                                    );
                                }
                            }}
                            onSign={async (role) => {
                                if (generatingPdfRef.current) return;
                                onActionStart();
                                generatingPdfRef.current = true;
                                try {
                                    const values = JSON.parse(
                                        JSON.stringify(getValues())
                                    );
                                    await validateReportAct({
                                        taskId: draftId,
                                        values,
                                    });
                                    startSignatureSession({
                                        taskId: draftId,
                                        role,
                                        template: selectedTemplate,
                                        values,
                                    });
                                    router.push('/(authorized)/signature');
                                } catch {
                                    onError(
                                        'Нужно пересоздать акт',
                                        'Данные отчёта изменились или файл акта недоступен. Сгенерируйте акт заново и повторите подписание.'
                                    );
                                } finally {
                                    generatingPdfRef.current = false;
                                }
                            }}
                        />
                    </ReportFormSection>
                </HighlightWrap>
            </ReportFieldLayout>
        );
    };

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
            case 'reportDetails':
                return renderActFields(
                    REPORT_ACT_FIELDS.filter(
                        (field) => field.group === 'actDetails'
                    ),
                    'Дата, представители и доверенность'
                );
            case 'act':
                return renderPdfStep();
            default:
                return null;
        }
    };

    return (
        <View collapsable={false} style={styles.form}>
            <View style={styles.header}>
                <View style={styles.headerTitleRow}>
                    <View style={styles.headerIcon}>
                        <Ionicons
                            name='clipboard-outline'
                            size={24}
                            color='#2469c9'
                        />
                    </View>
                    <View style={styles.headerText}>
                        <Text style={styles.eyebrow}>
                            ЗАДАЧА №{task?.id ?? id}
                        </Text>
                        <Text style={styles.formTitle}>Заполнение отчёта</Text>
                    </View>
                </View>
                <View style={styles.addressRow}>
                    <Ionicons
                        name='location-outline'
                        size={18}
                        color='#758399'
                    />
                    <Text style={styles.addressText}>
                        {Object.entries(initialValues.address)
                            .filter(([, value]) => value)
                            .map(([key, value]) =>
                                key === 'room' ? `Помещение: ${value}` : value
                            )
                            .join(', ') || 'Адрес не указан'}
                    </Text>
                </View>
                {task?.is_team_task && (
                    <View style={styles.brigadeBadge}>
                        <FontAwesome name='users' size={14} color='#245ca6' />
                        <Text style={styles.brigadeBadgeText}>
                            Работа в бригаде
                        </Text>
                    </View>
                )}
                {!isOnline && (
                    <Text style={styles.offlineHint}>
                        Нет интернета. При сохранении отчёт останется в очереди
                        отправки.
                    </Text>
                )}
            </View>

            {task?.is_team_task && (
                <View style={styles.brigadeActions}>
                    <FormButton
                        message='Загрузить отправленный отчёт'
                        style={styles.loadButton}
                        textStyle={styles.secondaryButtonText}
                        onPress={confirmLoadReport}
                        isPending={isLoadingReport}
                        disabled={!isOnline || isReportBusy}
                    />
                    <Text style={styles.description}>
                        {isLoadingReport
                            ? 'Загружаем отчёт. Дождитесь завершения.'
                            : !isOnline
                              ? 'Для загрузки отчёта бригады нужен интернет.'
                              : 'Вы можете загрузить отчёт бригады или продолжить заполнять свой.'}
                    </Text>
                </View>
            )}
            <View
                pointerEvents={isReportBusy ? 'none' : 'auto'}
                style={styles.formBody}>
                <ReportFormSteps
                    steps={FORM_STEPS}
                    activeIndex={stepIndex}
                    onChange={goToStep}
                    disabled={isReportBusy}
                />

                {renderCurrentStep()}

                <View style={styles.navigationRow}>
                    {!isFirstStep ? (
                        <FormButton
                            message='Назад'
                            onPress={() => goToStep(stepIndex - 1)}
                            style={styles.secondaryButton}
                            textStyle={styles.secondaryButtonText}
                        />
                    ) : null}

                    {isLastStep ? (
                        <FormButton
                            message='Сохранить отчёт'
                            onPress={() => {
                                if (isReportBusy) return;
                                onActionStart();
                                return handleSubmit(onSubmit, onInvalid)();
                            }}
                            isPending={isSubmitting}
                            disabled={isReportBusy}
                            style={styles.primaryButton}
                        />
                    ) : (
                        <FormButton
                            message='Далее'
                            onPress={() => goToStep(stepIndex + 1)}
                            style={styles.primaryButton}
                        />
                    )}
                </View>
                <Text style={styles.footerHint}>
                    {isLastStep
                        ? 'Проверьте данные перед отправкой на проверку.'
                        : `Следующий шаг: ${FORM_STEPS[stepIndex + 1].title}`}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    form: { paddingTop: 14, paddingBottom: 20 },
    header: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 18,
        borderWidth: 1,
        borderColor: '#e4eaf2',
        gap: 14,
    },
    headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    headerIcon: {
        width: 48,
        height: 48,
        borderRadius: 15,
        backgroundColor: '#edf4fe',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerText: { flex: 1, gap: 4 },
    eyebrow: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 1,
        color: '#758399',
    },
    formTitle: {
        fontSize: 20,
        fontWeight: '700',
        lineHeight: 27,
        color: '#1d314c',
    },
    addressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
    addressText: { flex: 1, fontSize: 14, lineHeight: 21, color: '#52627a' },
    offlineHint: {
        fontSize: 13,
        lineHeight: 19,
        color: '#956a20',
        backgroundColor: '#fff7e7',
        padding: 12,
        borderRadius: 10,
    },
    brigadeActions: {
        gap: 10,
        marginTop: 12,
        padding: 16,
        backgroundColor: '#edf4fe',
        borderRadius: 16,
    },
    brigadeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: '#edf4fe',
    },
    brigadeBadgeText: { color: '#245ca6', fontSize: 12, fontWeight: '600' },
    formBody: { gap: 14 },
    description: { fontSize: 13, lineHeight: 19, color: '#62758f' },
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
    hintText: {
        marginTop: -6,
        marginBottom: 16,
        fontSize: 12,
        lineHeight: 18,
        color: '#758399',
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
    navigationRow: { flexDirection: 'row', gap: 10, marginTop: 6 },
    primaryButton: {
        flex: 2,
        width: 'auto',
        minHeight: 54,
        paddingVertical: 16,
        borderRadius: 14,
        backgroundColor: '#2469c9',
    },
    secondaryButton: {
        flex: 1,
        width: 'auto',
        minHeight: 54,
        paddingVertical: 16,
        borderRadius: 14,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#dce4ef',
    },
    secondaryButtonText: { color: '#2469c9', fontWeight: '600', fontSize: 14 },
    loadButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#d3e2f7',
        paddingVertical: 14,
        borderRadius: 12,
    },
    footerHint: {
        fontSize: 12,
        lineHeight: 18,
        textAlign: 'center',
        color: '#758399',
        paddingBottom: 8,
    },
});

export default ReportSubmitForm;
