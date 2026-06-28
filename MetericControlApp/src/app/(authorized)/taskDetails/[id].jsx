import { useLocalSearchParams } from 'expo-router';
import ScreenLayout from '@/shared/components/screen/screenLayout';
import TaskDetailsForm from '@/features/tasks/components/taskDetailsForm';
import ReportSubmitForm from '@/features/reports/components/reportSubmitForm';
import useTaskById from '@/features/tasks/hooks/useTaskById';
import { KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import ScreenLoader from '@/shared/components/loader/screenLoader';

const TaskDescription = () => {
    const { id } = useLocalSearchParams();
    const { task, isPending } = useTaskById(+id);

    return (
        <ScreenLayout safe>
            {isPending ? (
                <ScreenLoader loading={isPending} />
            ) : (
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                    <ScrollView
                        contentContainerStyle={{
                            flexGrow: 1,
                            justifyContent: 'center',
                        }}
                        keyboardShouldPersistTaps='handled'
                        showsVerticalScrollIndicator={false}>
                        {task?.status === 'IN_PROGRESS' ? (
                            <ReportSubmitForm task={task} id={id} />
                        ) : (
                            <TaskDetailsForm task={task} id={id} />
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>
            )}
        </ScreenLayout>
    );
};

export default TaskDescription;
