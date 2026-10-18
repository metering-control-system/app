import useActStore from '@/features/acts/store/useActStore';
import { validateAct } from '@/features/acts/lib/validateAct';
import {
    savePdfToDocuments,
    deleteAct,
} from '@/features/acts/lib/savePdfToDocuments';
import { buildSignaturesPayload } from '@/features/acts/lib/buildSignaturesPayload';
import { generateActPdf } from '@/features/acts/lib/generateActPdf';
import { ensureActFileExists } from '@/features/acts/lib/ensureActFileExists';

import useSettingsStore from '@/features/settings/store/useSettingsStore';
import { getActReportFields } from '@/features/reports/lib/getActReportFields';
import useSubmitReport from '@/features/reports/hooks/useSubmitReport';
import { getTaskById } from '@/features/tasks/api/getTaskByIdApi';
import {
    isTaskReportReadOnly,
    filterSubmittedTasks,
} from '@/features/tasks/lib/taskReportVisibility';
import useTaskReports from '@/features/reports/hooks/useTaskReports';
import TasksList from '@/features/tasks/components/taskList';
import ScreenLayout from '@/shared/components/screen/screenLayout';
import { useCallback, useMemo, useState } from 'react';
import Notification from '@/shared/components/notification/Notification';
import { sortingVariants } from '@/features/tasks/constants/taskSortingVariants';
import { taskStatus } from '@/features/tasks/constants/taskStatus';
import { taskPriority } from '@/features/tasks/constants/taskPriority';
import { ControlPanel } from '@/shared/components/control/controlPanel';
import useTaskOfflineMutationStore from '@/features/tasks/store/useTaskOfflineMutationStore';
import { useOfflineTasksSync } from '@/features/tasks/hooks/useOfflineTasksSync';
import { useOfflineReportsSync } from '@/features/reports/hooks/useOfflineReportsSync';
import useReportDraftStore from '@/features/reports/store/useReportDraftStore';
import { OverlayButton } from '@/shared/components/button/overlayButton';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import useActTemplates from '@/features/acts/hooks/useActTemplates';
import { Modal, Pressable, StyleSheet, Text } from 'react-native';
import useTasksStore from '@/features/tasks/store/useTasksStore';
import useReportsStore from '@/features/reports/store/useReportsStore';
import { selectReportForTask } from '@/features/reports/lib/reportUpsert';
import { REPORT_OPERATION_KEY } from '@/features/reports/lib/reportOperation';
import { useMutationState } from '@tanstack/react-query';
import FormButton from '@/shared/components/button/formButton';
import useNetwork from '@/shared/hooks/offline/useNetwork';

const TaskScreen = () => {
    const [error, setError] = useState(null);
    const [showQueue, setShowQueue] = useState(false);
    const closeQueue = useCallback(() => setShowQueue(false), []);
    const drafts = useReportDraftStore((state) => state.drafts);
    const queueCount = Object.values(drafts ?? {}).filter((draft) =>
        ['pending', 'error'].includes(draft?.reportState)
    ).length;
    const defaultActTemplate = useSettingsStore(
        (state) => state.defaultActTemplate
    );
    const setDefaultActTemplate = useSettingsStore(
        (state) => state.setDefaultActTemplate
    );
    const { requestedTemplatesError, requestActTemplates } = useActTemplates({
        defaultActTemplate,
        setDefaultActTemplate,
    });

    const [dismissedTemplateError, setDismissedTemplateError] = useState(null);
    const templateErrorVisible =
        requestedTemplatesError &&
        requestedTemplatesError !== dismissedTemplateError;
    const router = useRouter();

    const [filtering, setFiltering] = useState(new Set());
    const [sorting, setSorting] = useState(null);
    const [search, setSearch] = useState('');

    const taskSortingVariants = Object.entries(sortingVariants);
    const taskFilteringVariants = Object.entries(taskStatus).concat(
        Object.entries(taskPriority)
    );

    const syncTasks = useOfflineTasksSync();
    const pendingCount = useTaskOfflineMutationStore(
        (state) => Object.keys(state.tasksStatuses ?? {}).length
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
    const { submitTaskReport } = useSubmitReport({
        getTasks: () => useTasksStore.getState().tasks,
        getTaskById,
        isTaskReportReadOnly,
        actOperations,
    });
    const syncReportsRecords = useOfflineReportsSync(
        submitTaskReport,
        deleteAct
    );
    const reportsPending = Object.entries(
        useReportDraftStore((state) => state.drafts)
    ).reduce((prev, curr) => {
        if (curr[1].reportState === 'pending') {
            return { ...prev, [curr[0]]: curr[1] };
        }
        return prev;
    }, {});

    const reportsPendingCount = Object.keys(reportsPending).length;

    const {
        isPending: isReportsPending,
        isFetching: isReportsFetching,
        error: reportsError,
        refreshReports,
    } = useTaskReports();
    const tasks = useTasksStore((state) => state.tasks);
    const reports = useReportsStore((state) => state.reports);
    const prepareTasks = useCallback(
        (tasks) =>
            filterSubmittedTasks(
                tasks,
                (taskId) => selectReportForTask(reports, taskId),
                drafts
            ).map((task) => {
                const report = selectReportForTask(reports, task.id);
                return report?.status === 'REJECTED'
                    ? { ...task, status: 'REJECTED' }
                    : task;
            }),
        [reports, drafts]
    );
    const { isChecked, isOnline } = useNetwork();
    const [isSyncing, setIsSyncing] = useState(false);
    const operations = useMutationState({
        filters: { mutationKey: REPORT_OPERATION_KEY, status: 'pending' },
    });
    const queuedTasks = useMemo(() => {
        const tasksById = new Map(
            (tasks ?? []).map((task) => [String(task.id), task])
        );
        return Object.entries(drafts ?? {})
            .filter(([, draft]) =>
                ['pending', 'error'].includes(draft?.reportState)
            )
            .map(([taskId, draft]) => {
                const report = selectReportForTask(reports, taskId);
                return (
                    tasksById.get(taskId) ?? {
                        id: taskId,
                        address: report?.address ??
                            draft.address ?? {
                                ['display_address']: `Задача №${taskId}`,
                            },
                        consumer: report?.consumer,
                    }
                );
            });
    }, [drafts, tasks, reports]);
    const synchronize = useCallback(async () => {
        if (!isChecked || !isOnline) {
            setError('Для синхронизации нужен интернет.');
            return;
        }
        if (isSyncing) return;
        setIsSyncing(true);
        setError(null);
        try {
            const failed = await syncReportsRecords();
            if (failed) setError(`Не синхронизировано отчётов: ${failed}.`);
        } catch {
            setError('Не удалось синхронизировать отчёты.');
        } finally {
            setIsSyncing(false);
        }
    }, [isChecked, isOnline, isSyncing, syncReportsRecords, setError]);

    const openQueuedReport = useCallback(
        (task) => {
            closeQueue();
            router.push({
                pathname: '/(authorized)/taskFlow/reportSubmit/[id]',
                params: { id: String(task.id), queueView: '1' },
            });
        },
        [closeQueue, router]
    );

    return (
        <ScreenLayout safe>
            <ControlPanel
                filteringVariants={taskFilteringVariants}
                sortingVariants={taskSortingVariants}
                filtering={filtering}
                setFiltering={setFiltering}
                sorting={sorting}
                setSorting={setSorting}
                setSearch={setSearch}
                search={search}
            />
            {queueCount > 0 && (
                <Pressable
                    accessibilityRole='button'
                    onPress={() => setShowQueue(true)}
                    style={styles.queueButton}>
                    <Text style={styles.queueButtonText}>
                        Отчётов на синхронизацию: {queueCount}
                    </Text>
                </Pressable>
            )}
            <TasksList
                prepareTasks={prepareTasks}
                isReportsPending={isReportsPending}
                isReportsFetching={isReportsFetching}
                reportsError={reportsError}
                refreshReports={refreshReports}
                setError={setError}
                sorting={sorting}
                filtering={filtering}
                search={search}
                sync={async () => {
                    if (pendingCount) {
                        void syncTasks();
                    }
                    if (reportsPendingCount) {
                        return await syncReportsRecords();
                    }
                }}
                syncingRecords={reportsPending}
            />
            <OverlayButton
                onPress={() => router.push('/(authorized)/gis/map')}
                icon={<FontAwesome name='map' size={20} color='white' />}
            />
            <Modal
                visible={showQueue}
                animationType='slide'
                onRequestClose={() => setShowQueue(false)}>
                <ScreenLayout safe>
                    <Pressable
                        accessibilityRole='button'
                        onPress={() => setShowQueue(false)}
                        style={styles.queueButton}>
                        <Text style={styles.queueButtonText}>
                            Назад к задачам
                        </Text>
                    </Pressable>
                    <FormButton
                        message='Синхронизировать все'
                        onPress={synchronize}
                        isPending={isSyncing}
                        disabled={
                            !reportsPendingCount ||
                            isSyncing ||
                            operations.length > 0
                        }
                        style={styles.syncButton}
                    />
                    <TasksList
                        tasks={queuedTasks}
                        onTaskPress={openQueuedReport}
                        refreshing={isSyncing}
                        onRefresh={synchronize}
                        emptyMessage='Нет несинхронизированных отчётов'
                    />
                    <Notification
                        variant='warning'
                        message={error}
                        handleClose={() => setError(null)}
                    />
                </ScreenLayout>
            </Modal>
            <Notification
                variant='warning'
                message={
                    error ||
                    (templateErrorVisible
                        ? 'Не удалось обновить шаблоны актов. Проверьте подключение и повторите загрузку.'
                        : null)
                }
                handleClose={() =>
                    error
                        ? setError(null)
                        : setDismissedTemplateError(requestedTemplatesError)
                }
                onPress={
                    !error && templateErrorVisible
                        ? requestActTemplates
                        : undefined
                }
            />
        </ScreenLayout>
    );
};

const styles = StyleSheet.create({
    syncButton: { marginBottom: 16 },
    queueButton: {
        paddingVertical: 14,
        borderRadius: 10,
        backgroundColor: '#dbeafe',
        marginBottom: 16,
    },
    queueButtonText: {
        textAlign: 'center',
        fontWeight: '600',
        color: '#2469c9',
    },
});

export default TaskScreen;
