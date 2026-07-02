import { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ScreenLayout from '@/shared/components/screen/screenLayout';
import TaskDetailsForm from '@/features/tasks/components/taskDetailsForm';
import useTaskById from '@/features/tasks/hooks/useTaskById';
import { ScrollView, StyleSheet } from 'react-native';
import ScreenLoader from '@/shared/components/loader/screenLoader';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';

const TaskDetailsScreen = () => {
    const { id } = useLocalSearchParams();
    const { task, isPending } = useTaskById(+id);
    const router = useRouter();

    useEffect(() => {
        if (task?.status === 'IN_PROGRESS') {
            router.replace(`/(authorized)/taskFlow/reportSubmit/${id}`);
        }
    }, [task?.status]);

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
