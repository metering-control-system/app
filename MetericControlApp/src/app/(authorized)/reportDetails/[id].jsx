import { useLocalSearchParams, useNavigation } from 'expo-router';
import ScreenLayout from '@/shared/components/screen/screenLayout';
import ReportDetailsForm from '@/features/reports/components/reportDetailsForm';
import useReportById from '@/features/reports/hooks/useReportById';
import { ScrollView, StyleSheet } from 'react-native';
import ScreenLoader from '@/shared/components/loader/screenLoader';
import useTaskById from '@/features/tasks/hooks/useTaskById';
import ShortenedTaskForm from '@/features/tasks/components/shortenedTaskForm';
import { useEffect } from 'react';
import useReportDraftStore from '@/features/reports/store/useReportDraftStore';
import { isTaskReportReadOnly } from '@/features/tasks/lib/taskReportVisibility';

const ReportDescription = () => {
    const { id } = useLocalSearchParams();
    const { report, isPending: isReportPending } = useReportById(+id);

    const navigation = useNavigation();

    const tiedTaskId = report?.task_id ? +report.task_id : null;
    const { task, isPending: isTaskPending } = useTaskById(tiedTaskId);
    const draft = useReportDraftStore((state) => state.drafts?.[tiedTaskId]);
    const canOpenTask = Boolean(
        task &&
        report &&
        (report.status === 'REJECTED' || draft) &&
        !isTaskReportReadOnly(task, report, draft)
    );

    useEffect(() => {
        if (!report) return;
        navigation.setOptions({
            headerStyle: { backgroundColor: '#f5f7fa' },
            headerTintColor: '#1e293b',
            title: `Отчёт №${report.id}`,
        });
    }, [report, navigation]);

    return (
        <ScreenLayout safe style={styles.screen}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}>
                {isReportPending ? (
                    <ScreenLoader loading={isReportPending} />
                ) : (
                    <ReportDetailsForm report={report} task={task} />
                )}
                {report &&
                    (isTaskPending ? (
                        <ScreenLoader loading={isTaskPending} />
                    ) : (
                        <ShortenedTaskForm
                            task={task}
                            id={tiedTaskId}
                            clickable={canOpenTask}
                        />
                    ))}
            </ScrollView>
        </ScreenLayout>
    );
};

const styles = StyleSheet.create({
    screen: { backgroundColor: '#f5f7fa', paddingHorizontal: 0 },
    content: { flexGrow: 1, padding: 16, paddingBottom: 32, gap: 16 },
});

export default ReportDescription;
