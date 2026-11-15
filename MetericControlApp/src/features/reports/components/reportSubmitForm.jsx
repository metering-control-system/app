import { REPORT_STATUS } from '@/features/reports/constants/reportStatus';
import { formatReportDateTime } from '@/features/reports/lib/reportActFieldValues';
import { REPORT_ADMISSION_STATUS } from '@/features/reports/constants/reportAdmissionStatus';
import {
    REPORT_DRAFT_STATE,
    REPORT_QUEUE_STATES,
} from '@/features/reports/constants/reportDraftState';
import { REPORT_API_FIELDS } from '@/features/reports/constants/reportFieldReferences';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { Text, View, StyleSheet, Alert, Keyboard } from 'react-native';
import FormButton from '@/shared/components/button/formButton';
import { REPORT_ACT_FIELDS } from '@/features/reports/constants/reportActFields';
import { ReportFormSteps } from '@/features/reports/components/reportFormLayout';
import {
    REPORT_FORM_STEPS as FORM_STEPS,
    getFirstReportValidationError,
} from '@/features/reports/lib/reportFormValidation';
import { ReportActFields } from '@/features/reports/components/reportSubmitForm/reportActFields';
import { ReportBeforeWorkStep } from '@/features/reports/components/reportSubmitForm/steps/reportBeforeWorkStep';
import { ReportMeteringStep } from '@/features/reports/components/reportSubmitForm/steps/reportMeteringStep';
import { ReportPhotosStep } from '@/features/reports/components/reportSubmitForm/steps/reportPhotosStep';
import { ReportAdmissionStep } from '@/features/reports/components/reportSubmitForm/steps/reportAdmissionStep';
import { ReportContactsStep } from '@/features/reports/components/reportSubmitForm/steps/reportContactsStep';
import { ReportActStep } from '@/features/reports/components/reportSubmitForm/steps/reportActStep';
import { mergeReportPhotoMetadata } from '@/features/reports/lib/reportPhotoMetadata';
import useLoadBrigadeReport from '@/features/reports/hooks/useLoadBrigadeReport';
import { useMutationState, useQueryClient } from '@tanstack/react-query';
import { getReportOperationFilters } from '@/features/reports/lib/reportOperation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { getApiErrorMessage } from '@/shared/api/getApiErrorMessage';
import useStorePictures from '@/shared/store/useStorePictures';
import { reportSubmitFormSchema } from '@/features/reports/model/reportSubmitFormSchema';
import { mapTaskToReportDefaults } from '@/features/reports/lib/mapTaskToReportDefaults';
import {
    mapReportImagesToForm,
    mapReportToFormValues,
    getReportFormInitialValues,
} from '@/features/reports/lib/reportFormHydration';
import useReportDraftStore from '@/features/reports/store/useReportDraftStore';
import useNetwork from '@/shared/hooks/offline/useNetwork';
import { createClientReportId } from '@/features/reports/lib/createClientReportId';

const ReportSubmitForm = ({
    onError,
    reportSubmission,
    actState,
    actOperations,
    renderActDocument,
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
    readOnly = false,
    hasSourceTask = true,
}) => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [clearedRemarks, setClearedRemarks] = useState(null);
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
    const { signatureResult, savedAct, templates } = actState;
    const { clearSignatureResult } = actOperations;
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
    const { submitTaskReport, isPending: isSubmitting } = reportSubmission;
    const draftValues = useReportDraftStore(
        (state) => state.drafts?.[draftId] ?? null
    );
    const hasServerRemarks =
        Number(draftValues?.serverReportSource?.id) ===
            Number(existingReport?.id) &&
        draftValues?.serverReportSource?.updatedAt ===
            existingReport?.updated_at;
    const isQueued = draftValues?.reportState === REPORT_DRAFT_STATE.PENDING;
    const isReadOnly = readOnly || isQueued;
    const isEditingDisabled = isReportBusy || isReadOnly;
    const canReturnToDraft =
        hasSourceTask && REPORT_QUEUE_STATES.includes(draftValues?.reportState);
    const returnToDraft = useReportDraftStore((state) => state.returnToDraft);
    const handleReturnToDraft = () => {
        if (
            !hasSourceTask ||
            isReportBusy ||
            queryClient.isMutating(getReportOperationFilters(draftId))
        )
            return;
        returnToDraft(draftId);
        router.replace({
            pathname: '/(authorized)/taskFlow/reportSubmit/[id]',
            params: { id: draftId },
        });
    };
    const clearDraft = useReportDraftStore((state) => state.clearDraft);
    const initialValues = useMemo(
        () =>
            getReportFormInitialValues({
                draftValues,
                existingReport,
                task,
                savedAct,
                taskDefaults: mapTaskToReportDefaults(task, {
                    clientReportId: createClientReportId(),
                    compiledAt: formatReportDateTime(new Date()),
                }),
            }),
        [draftValues, existingReport, task, savedAct]
    );
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
    const form = useForm({
        resolver: zodResolver(reportSubmitFormSchema),
        mode: 'onTouched',
        reValidateMode: 'onChange',
        shouldUnregister: false,
        defaultValues: initialValues,
    });
    const {
        control,
        handleSubmit,
        getValues,
        watch,
        setError,
        setValue,
        reset,
        formState: { errors },
    } = form;
    useWatch({ control });
    useEffect(() => {
        if (hydratedDraftIdRef.current === draftId) {
            return;
        }
        reset(initialValues);
        hydratedDraftIdRef.current = draftId;
    }, [draftId, initialValues, reset, hydratedDraftIdRef]);
    useEffect(() => {
        if (isReadOnly || signatureResult?.taskId !== draftId) return;
        setValue('actPdf', signatureResult.actPdf, {
            shouldDirty: true,
            shouldValidate: true,
        });
        clearSignatureResult();
    }, [signatureResult, draftId, setValue, clearSignatureResult, isReadOnly]);
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
        hydratedPhotosIdRef,
    ]);
    useEffect(() => {
        if (!task?.is_team_task || isReadOnly || isReportBusy) return;
        const subscription = watch((values) => {
            const store = useReportDraftStore.getState();
            const current = store.getDraft(draftId);
            if (current?.reportState === REPORT_DRAFT_STATE.PENDING) return;
            store.setDraft({
                draftId,
                values: {
                    ...current,
                    ...values,
                    reportState: REPORT_DRAFT_STATE.DRAFT,
                },
            });
        });
        return () => subscription.unsubscribe();
    }, [task?.is_team_task, isReadOnly, isReportBusy, watch, draftId]);
    useEffect(() => {
        if (isReadOnly || watch('clientReportId')) {
            return;
        }
        setValue('clientReportId', createClientReportId(), {
            shouldDirty: true,
            shouldValidate: false,
        });
    }, [setValue, watch, isReadOnly]);
    const admissionStatus = watch('admission.status');
    const isRefusedContact = watch('consumerContact.isRefusedContact');
    const isActualMeterDifferent = watch('meterBefore.isActualDifferent');
    useEffect(() => {
        if (
            isReadOnly ||
            admissionStatus === REPORT_ADMISSION_STATUS.NOT_ADMITTED
        ) {
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
    }, [admissionStatus, setValue, isReadOnly]);
    useEffect(() => {
        if (isReadOnly || isActualMeterDifferent) {
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
    }, [isActualMeterDifferent, setValue, isReadOnly]);
    useEffect(() => {
        if (isReadOnly) return;
        Object.entries(reportPhotos).forEach(([slot, uris]) => {
            setValue(`photos.${slot}`, Array.isArray(uris) ? uris : [uris], {
                shouldDirty: true,
                shouldValidate: false,
            });
        });
    }, [reportPhotos, setValue, isReadOnly]);
    const isLastStep = stepIndex === FORM_STEPS.length - 1;
    const isFirstStep = stepIndex === 0;
    const { loadReport, isLoading: isLoadingReport } = useLoadBrigadeReport({
        onError,
        task,
        id,
        getValues,
        hydratedDraftIdRef,
        hydratedPhotosIdRef,
        reset,
        setStepIndex,
    });
    const confirmLoadReport = () => {
        if (!isOnline || isEditingDisabled) return;
        onActionStart();
        const load = (mode) => {
            Keyboard.dismiss();
            void loadReport(mode);
        };
        if (existingReport?.status === REPORT_STATUS.REJECTED) {
            Alert.alert(
                'Загрузить отчёт с замечаниями?',
                'Поля и фотографии вашего локального черновика будут заменены отклонённым отчётом с сервера.',
                [
                    { text: 'Отмена', style: 'cancel' },
                    { text: 'Загрузить', onPress: () => load('replace') },
                ]
            );
            return;
        }
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
        if (isEditingDisabled) return;
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
                    mapTaskToReportDefaults(task, {
                        clientReportId: createClientReportId(),
                        compiledAt: formatReportDateTime(new Date()),
                    })
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
    const hasTemplates = (templates?.length ?? 0) > 0;
    useEffect(() => {
        if (!isReadOnly && !hasTemplates) {
            setValue('actPdf.isRefused', true, {
                shouldDirty: true,
                shouldValidate: false,
            });
            setValue('actPdf.uri', '', {
                shouldDirty: true,
                shouldValidate: false,
            });
        }
    }, [hasTemplates, setValue, isReadOnly]);
    const renderRemark = (name) => {
        if (
            existingReport?.status !== REPORT_STATUS.REJECTED ||
            (task?.is_team_task && !hasServerRemarks) ||
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
    const fieldProps = {
        fillPositions,
        highlightedField,
        isEditingDisabled,
        renderRemark,
    };
    const renderCurrentStep = () => {
        switch (FORM_STEPS[stepIndex].key) {
            case 'beforeWork':
                return (
                    <ReportBeforeWorkStep
                        {...fieldProps}
                        errors={errors}
                        control={control}
                        task={task}
                        isActualMeterDifferent={isActualMeterDifferent}
                    />
                );
            case 'metering':
                return (
                    <ReportMeteringStep
                        {...fieldProps}
                        control={control}
                        errors={errors}
                    />
                );
            case 'photos':
                return (
                    <ReportPhotosStep
                        {...fieldProps}
                        reportPhotos={reportPhotos}
                        isActualMeterDifferent={isActualMeterDifferent}
                        reportPhotoMetadata={reportPhotoMetadata}
                        existingReport={existingReport}
                        onError={onError}
                        addRemovedPhotoId={addRemovedPhotoId}
                        id={id}
                        router={router}
                        appendPhoto={appendPhoto}
                        setValue={setValue}
                        updatePhoto={updatePhoto}
                        removePhotoAt={removePhotoAt}
                        errors={errors}
                    />
                );
            case 'admission':
                return (
                    <ReportAdmissionStep
                        {...fieldProps}
                        control={control}
                        errors={errors}
                        admissionStatus={admissionStatus}
                    />
                );
            case 'contacts':
                return (
                    <ReportContactsStep
                        {...fieldProps}
                        control={control}
                        setValue={setValue}
                        errors={errors}
                        isRefusedContact={isRefusedContact}
                    />
                );
            case 'reportDetails':
                return (
                    <ReportActFields
                        {...fieldProps}
                        fields={REPORT_ACT_FIELDS.filter(
                            (field) => field.group === 'actDetails'
                        )}
                        title='Дата, представители и доверенность'
                        errors={errors}
                        control={control}
                    />
                );
            case 'act':
                return (
                    <ReportActStep
                        {...fieldProps}
                        templates={templates}
                        template={template}
                        generatingPdfRef={generatingPdfRef}
                        onActionStart={onActionStart}
                        setIsGeneratingPdf={setIsGeneratingPdf}
                        getValues={getValues}
                        draftId={draftId}
                        setValue={setValue}
                        onError={onError}
                        control={control}
                        hasTemplates={hasTemplates}
                        isGeneratingPdf={isGeneratingPdf}
                        actOperations={actOperations}
                        renderActDocument={renderActDocument}
                        router={router}
                    />
                );
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
                        message={
                            existingReport?.status === REPORT_STATUS.REJECTED
                                ? 'Загрузить отчёт с замечаниями'
                                : 'Загрузить отправленный отчёт'
                        }
                        style={styles.loadButton}
                        textStyle={styles.secondaryButtonText}
                        onPress={confirmLoadReport}
                        isPending={isLoadingReport}
                        disabled={!isOnline || isEditingDisabled}
                    />
                    <Text style={styles.description}>
                        {isLoadingReport
                            ? 'Загружаем отчёт. Дождитесь завершения.'
                            : !isOnline
                              ? 'Для загрузки отчёта бригады нужен интернет.'
                              : existingReport?.status ===
                                      REPORT_STATUS.REJECTED &&
                                  !hasServerRemarks
                                ? 'Открыт ваш личный черновик. Замечания относятся к отчёту с сервера. Продолжите свой вариант или загрузите отчёт с замечаниями.'
                                : 'Вы можете загрузить отчёт бригады или продолжить заполнять свой.'}
                    </Text>
                </View>
            )}
            {canReturnToDraft && (
                <FormButton
                    message='Вернуть в черновик'
                    onPress={handleReturnToDraft}
                    disabled={isReportBusy}
                    style={styles.secondaryButton}
                    textStyle={styles.secondaryButtonText}
                />
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
                                if (isEditingDisabled) return;
                                onActionStart();
                                return handleSubmit(onSubmit, onInvalid)();
                            }}
                            isPending={isSubmitting}
                            disabled={isEditingDisabled}
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
    errorText: {
        marginTop: 6,
        marginBottom: 8,
        fontSize: 13,
        lineHeight: 18,
        color: '#c84343',
    },
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
