import { fillEmptyReportFields } from '@/features/reports/lib/fillEmptyReportFields';
import { FontAwesome } from '@expo/vector-icons';
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

import Card from '@/shared/components/wrapper/card';
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
        <View
            onLayout={(e) => {
                fillPositions({ e, name });
            }}>
            <HighlightWrap isActive={highlightedField === name}>
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
            </HighlightWrap>
        </View>
    );

    const renderSingleOptionGroup = ({
        label,
        value,
        onChange,
        options,
        name,
        allowEmpty = false,
    }) => (
        <View
            onLayout={(e) => {
                fillPositions({ e, name });
            }}>
            <HighlightWrap isActive={highlightedField === name}>
                <View style={styles.control}>
                    <Text style={styles.label}>{label}</Text>
                    <View style={styles.chipsRow}>
                        {options.map((option) => {
                            const isSelected = value === option.value;

                            return (
                                <Pressable
                                    key={String(option.value)}
                                    accessibilityRole='radio'
                                    accessibilityState={{ checked: isSelected }}
                                    onPress={() =>
                                        onChange(
                                            allowEmpty && isSelected
                                                ? ''
                                                : option.value
                                        )
                                    }
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
            </HighlightWrap>
        </View>
    );

    const renderToggleRow = ({
        label,
        value,
        onChange,
        name,
        disabled = false,
    }) => (
        <View
            onLayout={(e) => {
                fillPositions({ e, name });
            }}>
            <HighlightWrap isActive={highlightedField === name}>
                <Pressable
                    onPress={() => onChange(!value)}
                    style={({ pressed }) => [
                        styles.switchRow,
                        pressed && !disabled && styles.switchRowPressed,
                    ]}>
                    <Text style={styles.switchLabel}>{label}</Text>
                    <Switch
                        value={value}
                        onValueChange={onChange}
                        disabled={disabled}
                    />
                </Pressable>
            </HighlightWrap>
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

    const renderActFields = (fields, title) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <Text style={styles.hintText}>
                Дополнительные сведения можно оставить незаполненными.
            </Text>
            {fields.map((field) => {
                const name = `${field.group}.${field.name}`;
                const error = errors[field.group]?.[field.name];
                if (field.kind === 'choice' || field.kind === 'boolean')
                    return (
                        <View key={name}>
                            <Controller
                                control={control}
                                name={name}
                                render={({ field: { value, onChange } }) =>
                                    renderSingleOptionGroup({
                                        name,
                                        label: field.label,
                                        value,
                                        onChange,
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
                                field.kind === 'date'
                                    ? 'ДД.ММ.ГГГГ'
                                    : field.kind === 'datetime'
                                      ? 'ДД.ММ.ГГГГ ЧЧ:ММ'
                                      : field.kind === 'integer'
                                        ? 'Например, 0'
                                        : field.kind === 'reading'
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
            <View style={styles.control}>
                <Text style={styles.label}>Адрес из задачи</Text>
                <Text>
                    {Object.entries(initialValues.address)
                        .filter(([, value]) => value)
                        .map(([key, value]) =>
                            key === 'room' ? `Помещение: ${value}` : value
                        )
                        .join(', ') || 'Не указан'}
                </Text>
            </View>
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
                render={({ field: { onChange, value } }) =>
                    renderToggleRow({
                        name: 'meterBefore.isActualDifferent',
                        label: 'Фактический ПУ отличается',
                        value,
                        onChange,
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
                        placeholder: 'Введите фактический номер при отличии',
                        error: errors.meterBefore?.actualNumber,
                    })}
                </>
            ) : null}
            {renderTextField({
                name: 'comment',
                label: 'Комментарий к задаче',
                placeholder: 'Добавьте комментарий при необходимости',
                multiline: true,
                numberOfLines: 4,
                error: errors.comment,
            })}
            {renderActFields(
                REPORT_ACT_FIELDS.filter(
                    (field) => field.group === 'meterBefore'
                ),
                'Характеристики старого счётчика'
            )}
        </View>
    );

    const renderMeteringStep = () => (
        <View style={styles.section}>
            <Controller
                control={control}
                name='metering.dismantlingCompleted'
                render={({ field: { onChange, value } }) =>
                    renderToggleRow({
                        name: 'metering.dismantlingCompleted',
                        label: 'Демонтаж выполнен',
                        value,
                        onChange,
                    })
                }
            />

            {renderTextField({
                name: 'metering.oldReading',
                label: 'Последние показания старого ПУ',
                placeholder: 'Введите показания',
                keyboardType: 'decimal-pad',
                error: errors.metering?.oldReading,
            })}
            {renderActFields(
                REPORT_ACT_FIELDS.filter((field) =>
                    ['oldT1', 'oldT2'].includes(field.name)
                ),
                'Тарифные показания старого счётчика'
            )}
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
                        name: 'metering.sealLocation',
                        label: 'Место установки пломбы',
                        value,
                        onChange,
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
            {renderTextField({
                name: 'metering.installationReading',
                label: 'Показания при установке',
                placeholder: 'Введите показания при установке',
                keyboardType: 'decimal-pad',
                error: errors.metering?.installationReading,
            })}
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
            <View
                key={photoField.name}
                onLayout={(e) => {
                    fillPositions({ e, name: photoFieldName });
                }}>
                <HighlightWrap isActive={highlightedField === photoFieldName}>
                    <View style={styles.control}>
                        <Text style={styles.label}>{title}</Text>
                        <MediaBlock
                            onError={onError}
                            uris={uris}
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
                    </View>
                </HighlightWrap>
            </View>
        );
    };

    const renderPhotosStep = () => (
        <View style={styles.section}>
            {REPORT_PHOTO_CONFIGS.map(renderPhotoField)}
        </View>
    );

    const renderAdmissionStep = () => (
        <View style={styles.section}>
            <Controller
                control={control}
                name='admission.status'
                render={({ field: { onChange, value } }) =>
                    renderSingleOptionGroup({
                        name: 'admission.status',
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
                            name: 'admission.rejectionReason',
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
            {admissionStatus === 'NOT_ADMITTED' &&
                renderTextField({
                    name: 'admission.rejectionComment',
                    label: 'Пояснение причины недопуска',
                    placeholder: 'Укажите причину недопуска',
                    multiline: true,
                    error: errors.admission?.rejectionComment,
                })}
            {renderActFields(
                REPORT_ACT_FIELDS.filter(
                    (field) => field.group === 'admission'
                ),
                'Дополнительные сведения о допуске'
            )}
        </View>
    );

    const renderContactsStep = () => (
        <View style={styles.section}>
            <Controller
                control={control}
                name='consumerContact.isRefusedContact'
                render={({ field: { onChange, value } }) =>
                    renderToggleRow({
                        name: 'consumerContact.isRefusedContact',
                        label: 'Отказ от предоставления контактов',
                        value,
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
        </View>
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
            <View style={{ flex: 1, paddingVertical: 20 }}>
                <Controller
                    control={control}
                    name='actPdf.isRefused'
                    disabled={templates?.length === 0}
                    render={({ field: { onChange, value } }) =>
                        renderToggleRow({
                            name: 'actPdf.isRefused',
                            label: 'Пропустить генерацию цифрового акта',
                            value,
                            disabled: !hasTemplates,
                            onChange: (nextValue) => {
                                onChange(nextValue);
                                if (nextValue) {
                                    setValue(
                                        'actPdf.uri',
                                        reportSubmitFormDefaultValues.actPdf
                                            .uri,
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
                            ensureActFileExists(getValues('actPdf.uri'));
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
            </View>
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
        <Card title='Отчет по задаче' style={styles.card}>
            {task?.is_team_task && (
                <View style={styles.brigadeBadge}>
                    <FontAwesome name='users' size={16} color='#245ca6' />
                    <Text style={styles.brigadeBadgeText}>
                        Работа в бригаде
                    </Text>
                </View>
            )}
            <Text style={styles.description}>
                Заполните отчет по выполненным работам и отправьте его на
                проверку.
            </Text>

            {task?.is_team_task && (
                <View style={styles.brigadeActions}>
                    <FormButton
                        message='Загрузить отправленный отчёт'
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
                            textStyle={styles.secondaryButtonText}
                        />
                    ) : (
                        <View style={styles.buttonSpacer} />
                    )}

                    {isLastStep ? (
                        <FormButton
                            message='Сохранить отчет'
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
                            onPress={() =>
                                setStepIndex((currentStep) => currentStep + 1)
                            }
                            style={styles.primaryButton}
                        />
                    )}
                </View>
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    sectionTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#172b4d',
        marginTop: 12,
    },
    card: { gap: 16, marginTop: 16 },
    brigadeActions: { gap: 10 },
    brigadeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: '#edf4ff',
    },
    brigadeBadgeText: { color: '#245ca6', fontSize: 14, fontWeight: '600' },
    formBody: { gap: 16 },
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
    hintText: {
        marginTop: -6,
        marginBottom: 12,
        fontSize: 12,
        lineHeight: 18,
        color: '#7b8794',
    },
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
    switchRowPressed: { opacity: 0.8 },
    switchLabel: { flex: 1, fontSize: 13, color: '#4d5f73' },
    navigationRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
    primaryButton: {
        flex: 1,
        backgroundColor: '#278cff',
        borderWidth: 1,
        borderColor: '#1a73e8',
    },
    secondaryButton: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#278cff',
    },
    secondaryButtonText: { color: '#278cff' },
    buttonSpacer: { flex: 1 },
});

export default ReportSubmitForm;
