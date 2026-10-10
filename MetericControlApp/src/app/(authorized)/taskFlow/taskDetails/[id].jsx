import { useEffect } from 'react';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import ScreenLayout from '@/shared/components/screen/screenLayout';
import TaskDetailsForm from '@/features/tasks/components/taskDetailsForm';
import useTaskById from '@/features/tasks/hooks/useTaskById';
import { ScrollView, StyleSheet } from 'react-native';
import ScreenLoader from '@/shared/components/loader/screenLoader';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import useTaskReport from '@/features/reports/hooks/useTaskReport';
import TaskReportLookupError from '@/features/reports/components/taskReportLookupError';

const TaskDetailsScreen = () => {
    const { id } = useLocalSearchParams();
    const { task, isPending } = useTaskById(+id);
    const router = useRouter();
    const {
        report,
        isReadOnly,
        isPending: isReportPending,
        error,
        refetch,
    } = useTaskReport(task);

    useEffect(() => {
        if (
            (task?.status === 'IN_PROGRESS' || report?.status === 'REJECTED') &&
            !isReportPending &&
            !error &&
            !isReadOnly
        ) {
            router.replace(`/(authorized)/taskFlow/reportSubmit/${id}`);
        }
    }, [
        task?.status,
        report?.status,
        id,
        router,
        isReportPending,
        error,
        isReadOnly,
    ]);

    if (isReadOnly && !isReportPending) {
        return <Redirect href={`/(authorized)/reportDetails/${report.id}`} />;
    }

    return (
        <ScreenLayout safe>
            {isPending || isReportPending ? (
                <ScreenLoader loading />
            ) : error ? (
                <TaskReportLookupError onRetry={refetch} />
            ) : (
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={'translate-with-padding'}
                    keyboardVerticalOffset={100}>
                    <ScrollView
                        contentContainerStyle={styles.content}
                        keyboardShouldPersistTaps='handled'
                        showsVerticalScrollIndicator={false}>
                        <TaskDetailsForm task={task} id={id} />
                    </ScrollView>
                </KeyboardAvoidingView>
            )}
        </ScreenLayout>
    );
};

const styles = StyleSheet.create({
    content: { flexGrow: 1, justifyContent: 'center' },
});

export default TaskDetailsScreen;
