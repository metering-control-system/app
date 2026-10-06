import { useLocalSearchParams, useNavigation } from 'expo-router';
import ScreenLayout from '@/shared/components/screen/screenLayout';
import ReportDetailsForm from '@/features/reports/components/reportDetailsForm';
import useReportById from '@/features/reports/hooks/useReportById';
import { ScrollView, View } from 'react-native';
import ScreenLoader from '@/shared/components/loader/screenLoader';
import useTaskById from '@/features/tasks/hooks/useTaskById';
import ShortenedTaskForm from '@/features/tasks/components/shortenedTaskForm';
import { useEffect } from 'react';
import { colors } from '@/shared/consts/baseColors';
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
        (task.is_team_task ||
            ((report.status === 'REJECTED' || draft) &&
                !isTaskReportReadOnly(task, report, draft)))
    );

    useEffect(() => {
        if (!report) return;
        const accepted =
            report?.status === 'ACCEPTED' &&
            report?.admission.status === 'ADMITTED';
        const rejected =
            report?.status === 'REJECTED' ||
            report?.admission.status === 'NOT_ADMITTED';
        navigation.setOptions({
            headerStyle: {
                backgroundColor: accepted
                    ? colors.primary.backgroundColor
                    : rejected
                      ? colors.warning.backgroundColor
                      : '#fff',
            },
            headerTintColor: accepted
                ? colors.primary.color
                : rejected
                  ? colors.warning.color
                  : '#000',
            title: `Отчет №${report.id}${accepted ? ' ✓' : rejected ? ' ✗' : ''}`,
        });
    }, [report, navigation]);

    const bgColor = !report
        ? colors.ordinary.backgroundTintColor
        : report.status === 'ACCEPTED' &&
            report?.admission.status === 'ADMITTED'
          ? colors.primary.backgroundTintColor
          : report.status === 'REJECTED' ||
              report?.admission.status === 'NOT_ADMITTED'
            ? colors.warning.backgroundTintColor
            : colors.ordinary.backgroundTintColor;

    return (
        <ScreenLayout safe style={{ backgroundColor: bgColor }}>
            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: 'center',
                }}
                showsVerticalScrollIndicator>
                {isTaskPending ? (
                    <ScreenLoader loading={isTaskPending} />
                ) : (
                    <ShortenedTaskForm
                        task={task}
                        id={tiedTaskId}
                        clickable={canOpenTask}
                    />
                )}
                <View style={{ height: 30 }}></View>
                {isReportPending ? (
                    <ScreenLoader loading={isReportPending} />
                ) : (
                    <ReportDetailsForm report={report} id={id} />
                )}
            </ScrollView>
        </ScreenLayout>
    );
};

export default ReportDescription;
