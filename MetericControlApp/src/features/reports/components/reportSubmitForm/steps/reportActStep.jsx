import { Controller } from 'react-hook-form';
import { HighlightWrap } from '@/shared/components/wrapper/highlightWrapper';
import { reportSubmitFormDefaultValues } from '@/features/reports/constants/reportSubmitFormDefaults';
import * as Sharing from 'expo-sharing';
import {
    ReportFormSection,
    ReportFieldLayout,
} from '@/features/reports/components/reportFormLayout';
import { ReportToggleField } from '@/features/reports/components/reportSubmitForm/reportFormFields';
export const ReportActStep = ({
    templates,
    template,
    isEditingDisabled,
    generatingPdfRef,
    onActionStart,
    setIsGeneratingPdf,
    getValues,
    draftId,
    setValue,
    onError,
    fillPositions,
    highlightedField,
    renderRemark,
    control,
    hasTemplates,
    isGeneratingPdf,
    actOperations,
    renderActDocument,
    router,
}) => {
    const {
        validateReportAct,
        ensureActFileExists,
        generateActPdf,
        getActRecord,
        saveAct,
        startSignatureSession,
    } = actOperations;
    const fieldProps = {
        fillPositions,
        highlightedField,
        isEditingDisabled,
        renderRemark,
    };
    const selectedTemplate = templates.find((temp) => temp?.id === template);
    const printToFile = async () => {
        if (isEditingDisabled || generatingPdfRef.current) return;
        onActionStart();
        generatingPdfRef.current = true;
        setIsGeneratingPdf(true);
        try {
            const actPdf = await generateActPdf({
                template: selectedTemplate,
                values: getValues(),
                previousAct: getActRecord(draftId),
            });
            saveAct(draftId, actPdf);
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
                        render={({ field: { onChange, onBlur, value } }) => (
                            <ReportToggleField
                                {...fieldProps}
                                name='actPdf.isRefused'
                                label='Пропустить генерацию цифрового акта'
                                value={value}
                                disabled={!hasTemplates}
                                onBlur={onBlur}
                                onChange={(nextValue) => {
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
                                }}
                            />
                        )}
                    />
                    {renderActDocument({
                        onError: onError,
                        templates: templates,
                        template: template,
                        actPdf: getValues('actPdf'),
                        isBusy: isEditingDisabled,
                        isGenerating: isGeneratingPdf,
                        onGenerate: printToFile,
                        onShare: async () => {
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
                        },
                        onSign: async (role) => {
                            if (isEditingDisabled || generatingPdfRef.current)
                                return;
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
                        },
                    })}
                </ReportFormSection>
            </HighlightWrap>
        </ReportFieldLayout>
    );
};
