import { useLocalSearchParams } from 'expo-router';
import ScreenLayout from '@/shared/components/screen/screenLayout';
import TaskDetailsForm from '@/features/tasks/components/taskDetailsForm';
import ReportSubmitForm from '@/features/reports/components/reportSubmitForm';
import useTaskById from '@/features/tasks/hooks/useTaskById';
import { ScrollView } from 'react-native';
import ScreenLoader from '@/shared/components/loader/screenLoader';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

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
                    behavior={'translate-with-padding'}
                    keyboardVerticalOffset={100}>
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
