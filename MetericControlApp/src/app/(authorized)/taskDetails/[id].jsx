import { useLocalSearchParams } from 'expo-router';
import ScreenLayout from '@/shared/components/screen/screenLayout';
import TaskDetailsForm from '@/features/tasks/components/taskDetailsForm';
import useTaskById from '@/features/tasks/hooks/useTaskById';
import { KeyboardAvoidingView, ScrollView, Platform } from 'react-native';

const TaskDescription = () => {
    const { id } = useLocalSearchParams();
    const { task } = useTaskById(+id);

    return (
        <ScreenLayout safe>
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
                    <TaskDetailsForm task={task} id={id} />
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenLayout>
    );
};

export default TaskDescription;
