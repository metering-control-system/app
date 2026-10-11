import useReportDetailsNavigation from '@/features/reports/hooks/useReportDetailsNavigation';
import useErrors from '@/shared/hooks/useErrors';
import Notification from '@/shared/components/notification/Notification';
import {
    Redirect,
    useLocalSearchParams,
    useNavigation,
    useRouter,
} from 'expo-router';
import ScreenLayout from '@/shared/components/screen/screenLayout';
import ReportDetailsForm from '@/features/reports/components/reportDetailsForm';
import useReportById from '@/features/reports/hooks/useReportById';
import { ScrollView, StyleSheet } from 'react-native';
import ScreenLoader from '@/shared/components/loader/screenLoader';
import useTaskById from '@/features/tasks/hooks/useTaskById';
import ShortenedTaskForm from '@/features/tasks/components/shortenedTaskForm';
import { useCallback, useEffect } from 'react';
import { ShrinkedChat } from '@/features/comments/components/shrinkedChat';

const ReportDescription = () => {
    const { error: errorMessage, handleError, dismissError } = useErrors();

    const { id, reference, viewOnly } = useLocalSearchParams();
    const { report, isPending: isReportPending } = useReportById(+id);

    const navigation = useNavigation();
    const router = useRouter();
    const openComments = useCallback(() => {
        if (report?.id) {
            router.push(`/(authorized)/commentsScreen/${report.id}`);
        }
    }, [report?.id, router]);

    const tiedTaskId = report?.task_id ? +report.task_id : null;
    const { task, isPending: isTaskPending } = useTaskById(tiedTaskId);
    const {
        scrollRef,
        fillPositions,
        scrollToReference,
        target,
        isResolvingReference,
        canOpenTask,
        redirect,
    } = useReportDetailsNavigation({
        report,
        task,
        isTaskPending,
        reference,
        viewOnly,
    });

    useEffect(() => {
        if (!report) return;
        navigation.setOptions({
            headerStyle: { backgroundColor: '#f5f7fa' },
            headerTintColor: '#1e293b',
            title: `Отчёт №${report.id}`,
        });
    }, [report, navigation]);

    if (redirect) return <Redirect href={redirect} />;

    return (
        <ScreenLayout safe style={styles.screen}>
            <ScrollView
                ref={scrollRef}
                onContentSizeChange={scrollToReference}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}>
                {isReportPending || isResolvingReference ? (
                    <ScreenLoader loading />
                ) : (
                    <ReportDetailsForm
                        onError={handleError}
                        report={report}
                        task={task}
                        highlightedField={target?.field}
                        fillPositions={fillPositions}
                    />
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
            {report?.id && (
                <ShrinkedChat reportId={report.id} onPress={openComments} />
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
    screen: { backgroundColor: '#f5f7fa', paddingHorizontal: 0 },
    content: { flexGrow: 1, padding: 16, paddingBottom: 32, gap: 16 },
});

export default ReportDescription;
