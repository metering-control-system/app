import useActStore from '@/features/acts/store/useActStore';
import { validateAct } from '@/features/acts/lib/validateAct';
import { savePdfToDocuments } from '@/features/acts/lib/savePdfToDocuments';
import { buildSignaturesPayload } from '@/features/acts/lib/buildSignaturesPayload';
import { generateActPdf } from '@/features/acts/lib/generateActPdf';
import { ensureActFileExists } from '@/features/acts/lib/ensureActFileExists';

import useActTemplatesStore from '@/features/acts/store/useActTemplatesStore';
import ActDocumentPanel from '@/features/acts/components/actDocumentPanel';
import { useCallback } from 'react';
import { getActReportFields } from '@/features/reports/lib/getActReportFields';
import useSubmitReport from '@/features/reports/hooks/useSubmitReport';
import useTasksStore from '@/features/tasks/store/useTasksStore';
import { getTaskById } from '@/features/tasks/api/getTaskByIdApi';
import { isTaskReportReadOnly } from '@/features/tasks/lib/taskReportVisibility';
import useReportSubmitNavigation from '@/features/reports/hooks/useReportSubmitNavigation';
import useErrors from '@/shared/hooks/useErrors';
import Notification from '@/shared/components/notification/Notification';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import ScreenLayout from '@/shared/components/screen/screenLayout';
import ReportSubmitForm from '@/features/reports/components/reportSubmitForm';
import useTaskById from '@/features/tasks/hooks/useTaskById';
import { ScrollView, StyleSheet, Text } from 'react-native';
import ScreenLoader from '@/shared/components/loader/screenLoader';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import useSettingsStore from '@/features/settings/store/useSettingsStore';
import useTaskReport from '@/features/reports/hooks/useTaskReport';
import TaskReportLookupError from '@/features/reports/components/taskReportLookupError';
import useReportDraftStore from '@/features/reports/store/useReportDraftStore';

const ReportSubmitScreen = () => {
    const { error: errorMessage, handleError, dismissError } = useErrors();

    const { id, reference, sourceReportId, queueView } = useLocalSearchParams();
    const draft = useReportDraftStore((state) => state.drafts?.[id]);
    const isQueueView =
        queueView === '1' && ['pending', 'error'].includes(draft?.reportState);
    const { task: loadedTask, isPending: isTaskPending } = useTaskById(+id);
    const task =
        loadedTask ??
        (isQueueView ? { id: Number(id), address: draft?.address } : null);
    const isPending = isTaskPending && !isQueueView;
    const reportQuery = useTaskReport(task, isTaskReportReadOnly);
    const {
        scrollRef,
        fillPositions,
        step,
        setStep,
        highlightedField,
        onValidationError,
        isResolvingSource,
        redirect,
    } = useReportSubmitNavigation({
        id,
        task,
        reportQuery,
        isPending,
        reference,
        sourceReportId,
        queueView: isQueueView,
    });
    const defaultActTemplate = useSettingsStore(
        (state) => state.defaultActTemplate
    );
    const signatureResult = useActStore((state) => state.result);
    const savedAct = useActStore(
        (state) => state.actMetadataByTask[String(task?.id ?? id)]
    );
    const templates = useActTemplatesStore((state) => state.templates);
    const renderActDocument = useCallback(
        (props) => <ActDocumentPanel {...props} />,
        []
    );

    const actOperations = {
        validateReportAct: ({ taskId, values }) =>
            validateAct({
                taskId,
                actPdf: values.actPdf,
                fields: values.actPdf?.isRefused
                    ? undefined
                    : getActReportFields(values),
            }),
        getActRecord: (taskId) =>
            useActStore.getState().actMetadataByTask[String(taskId)],
        clearTaskAct: (taskId, expectedAct) =>
            useActStore.getState().clearTaskAct(taskId, expectedAct),
        savePdfToDocuments,
        buildReportSignaturesPayload: buildSignaturesPayload,
        ensureActFileExists,
        generateActPdf: ({ template, values, previousAct }) =>
            generateActPdf({
                template,
                fields: getActReportFields(values),
                actPdf: values.actPdf,
                previousAct,
            }),
        saveAct: useActStore.getState().saveAct,
        clearSignatureResult: useActStore.getState().clearResult,
        startSignatureSession: (session) =>
            useActStore
                .getState()
                .startSession({
                    ...session,
                    fields: getActReportFields(session.values),
                }),
    };
    const reportSubmission = useSubmitReport({
        getTasks: () => useTasksStore.getState().tasks,
        getTaskById,
        isTaskReportReadOnly,
        actOperations,
    });
    const router = useRouter();

    if (redirect) return <Redirect href={redirect} />;

    return (
        <ScreenLayout safe style={styles.screen}>
            {isPending ||
            (!isQueueView && reportQuery.isPending) ||
            isResolvingSource ? (
                <ScreenLoader loading />
            ) : reportQuery.isError && !isQueueView ? (
                <TaskReportLookupError
                    onRetry={reportQuery.refetch}
                    onClose={() => router.replace('/(authorized)/(tabs)/tasks')}
                />
            ) : (
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={'translate-with-padding'}
                    keyboardVerticalOffset={100}>
                    <ScrollView
                        ref={scrollRef}
                        contentContainerStyle={{ flexGrow: 1 }}
                        keyboardShouldPersistTaps='handled'
                        showsVerticalScrollIndicator={false}>
                        {isQueueView && !loadedTask && (
                            <Text style={styles.missingTask}>
                                {draft?.reportState === 'pending'
                                    ? 'Исходная задача отсутствует на устройстве. Редактирование недоступно. Отчёт остаётся в очереди и будет отправлен при появлении интернета.'
                                    : 'Исходная задача отсутствует на устройстве. Редактирование недоступно. Для загрузки задачи подключитесь к интернету. Отчёт с ошибкой необходимо отправить вручную.'}
                            </Text>
                        )}
                        <ReportSubmitForm
                            reportSubmission={reportSubmission}
                            actState={{ signatureResult, savedAct, templates }}
                            actOperations={actOperations}
                            renderActDocument={renderActDocument}
                            hasSourceTask={Boolean(loadedTask)}
                            readOnly={isQueueView}
                            onError={handleError}
                            onActionStart={dismissError}
                            key={id}
                            task={task}
                            existingReport={reportQuery.data}
                            id={id}
                            fillPositions={fillPositions}
                            stepIndex={step}
                            setStepIndex={setStep}
                            highlightedField={highlightedField}
                            defaultActTemplate={defaultActTemplate}
                            onValidationError={onValidationError}
                        />
                    </ScrollView>
                </KeyboardAvoidingView>
            )}
            <Notification
                variant='warning'
                message={errorMessage}
                handleClose={dismissError}
            />
        </ScreenLayout>
    );
};

const styles = StyleSheet.create({
    screen: { backgroundColor: '#f3f6fa' },
    missingTask: {
        padding: 16,
        marginBottom: 12,
        borderRadius: 10,
        backgroundColor: '#fff3cd',
        color: '#664d03',
        lineHeight: 21,
    },
});

export default ReportSubmitScreen;
