import { useLocalSearchParams, useRouter } from 'expo-router';
import ScreenLayout from '@/shared/components/screen/screenLayout';
import ReportSubmitForm from '@/features/reports/components/reportSubmitForm';
import { getReportByTaskId } from '@/features/reports/api/submitReportApi';
import useTaskById from '@/features/tasks/hooks/useTaskById';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import ScreenLoader from '@/shared/components/loader/screenLoader';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { ShrinkedChat } from '@/features/comments/components/shrinkedChat';
import { useNavigateToElement } from '@/shared/hooks/useNavigateToElement';
import { useEffect, useRef, useState } from 'react';
import { FORM_FIELDS_MAP } from '@/features/comments/constants/formFieldsMap';
import { useQuery } from '@tanstack/react-query';
import useNetwork from '@/shared/hooks/offline/useNetwork';

const ReportSubmitScreen = () => {
    const { id, reference } = useLocalSearchParams();
    const { task, isPending } = useTaskById(+id);
    const { isOnline } = useNetwork();
    const reportQuery = useQuery({
        queryKey: ['report', 'task', Number(id)],
        queryFn: () => getReportByTaskId(id),
        enabled: Boolean(task?.id) && !task?.is_team_task && isOnline,
        retry: false,
    });
    const [highlightedField, setHighlightedField] = useState(null);
    const router = useRouter();

    const scrollRef = useRef();
    const [step, setStep] = useState(0);

    const [navigateToElement, fillPositions] = useNavigateToElement(
        scrollRef,
        setStep
    );

    useEffect(() => {
        if (reference) {
            navigateToElement({
                elements: FORM_FIELDS_MAP,
                scrollableEl: reference,
            });
            setHighlightedField(FORM_FIELDS_MAP[reference]?.field ?? null);
        }
    }, [reference]);

    return (
        <ScreenLayout safe>
            {isPending ||
            (!task?.is_team_task && isOnline && reportQuery.isPending) ? (
                <ScreenLoader loading />
            ) : !task?.is_team_task && isOnline && reportQuery.isError ? (
                <View style={styles.lookupError}>
                    <Text>Не удалось проверить, есть ли отчёт по задаче.</Text>
                    <Pressable onPress={() => reportQuery.refetch()}>
                        <Text>Повторить</Text>
                    </Pressable>
                </View>
            ) : (
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={'translate-with-padding'}
                    keyboardVerticalOffset={100}>
                    <ScrollView
                        ref={scrollRef}
                        contentContainerStyle={{ flexGrow: 1 }}
                        keyboardShouldPersistTaps='handled'
                        showsVerticalScrollIndicator={false}>
                        <ReportSubmitForm
                            key={id}
                            task={task}
                            existingReport={reportQuery.data}
                            id={id}
                            fillPositions={fillPositions}
                            stepIndex={step}
                            setStepIndex={setStep}
                            highlightedField={highlightedField}
                        />
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
    lookupError: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    chatDivider: {
        marginBlock: 15,
        height: 1,
        backgroundColor: '#e0e0e0',
        marginHorizontal: 8,
    },
});

export default ReportSubmitScreen;
