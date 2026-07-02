import { useLocalSearchParams, useRouter } from 'expo-router';
import ScreenLayout from '@/shared/components/screen/screenLayout';
import ReportSubmitForm from '@/features/reports/components/reportSubmitForm';
import useTaskById from '@/features/tasks/hooks/useTaskById';
import { ScrollView, StyleSheet, View } from 'react-native';
import ScreenLoader from '@/shared/components/loader/screenLoader';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { ShrinkedChat } from '@/features/comments/components/shrinkedChat';

const ReportSubmitScreen = () => {
    const { id } = useLocalSearchParams();
    const { task, isPending } = useTaskById(+id);
    const router = useRouter();

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
                        contentContainerStyle={{ flexGrow: 1 }}
                        keyboardShouldPersistTaps='handled'
                        showsVerticalScrollIndicator={false}>
                        <ReportSubmitForm task={task} id={id} />
                    </ScrollView>
                    <View style={styles.chatDivider} />
                    <ShrinkedChat
                        taskId={task.id}
                        onPress={() =>
                            router.push(
                                `/(authorized)/commentsScreen/${task.id}`
                            )
                        }
                    />
                </KeyboardAvoidingView>
            )}
        </ScreenLayout>
    );
};

const styles = StyleSheet.create({
    chatDivider: {
        marginBlock: 15,
        height: 1,
        backgroundColor: '#e0e0e0',
        marginHorizontal: 8,
    },
});

export default ReportSubmitScreen;
