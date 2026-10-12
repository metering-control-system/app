import useErrors from '@/shared/hooks/useErrors';
import Notification from '@/shared/components/notification/Notification';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import ScreenLayout from '@/shared/components/screen/screenLayout';
import ReportSubmitForm from '@/features/reports/components/reportSubmitForm';
import useTaskById from '@/features/tasks/hooks/useTaskById';
import { ScrollView, StyleSheet, View } from 'react-native';
import ScreenLoader from '@/shared/components/loader/screenLoader';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { ShrinkedChat } from '@/features/comments/components/shrinkedChat';
import { useNavigateToElement } from '@/shared/hooks/useNavigateToElement';
import { useEffect, useRef, useState } from 'react';
import { FORM_FIELDS_MAP } from '@/features/comments/constants/formFieldsMap';
import useSettingsStore from '@/features/settings/store/useSettingsStore';
import useTaskReport from '@/features/reports/hooks/useTaskReport';
import TaskReportLookupError from '@/features/reports/components/taskReportLookupError';

const ReportSubmitScreen = () => {
    const { error: errorMessage, handleError, dismissError } = useErrors();

    const { id, reference } = useLocalSearchParams();
    const { task, isPending } = useTaskById(+id);
    const reportQuery = useTaskReport(task);
    const [highlightedField, setHighlightedField] = useState(null);
    const defaultActTemplate = useSettingsStore(
        (state) => state.defaultActTemplate
    );
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
    }, [reference, navigateToElement]);

    useEffect(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [step]);

    if (reportQuery.isReadOnly && !reportQuery.isPending) {
        return (
            <Redirect
                href={`/(authorized)/reportDetails/${reportQuery.report.id}`}
            />
        );
    }

    return (
        <ScreenLayout safe style={styles.screen}>
            {isPending || reportQuery.isPending ? (
                <ScreenLoader loading />
            ) : reportQuery.isError ? (
                <TaskReportLookupError
                    onRetry={reportQuery.refetch}
                    onClose={() => router.replace('/(authorized)/(tabs)/tasks')}
                />
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
                            onError={handleError}
                            onActionStart={dismissError}
                            key={id}
                            task={task}
                            existingReport={reportQuery.data}
                            id={id}
                            fillPositions={fillPositions}
                            stepIndex={step}
                            setStepIndex={setStep}
                            highlightedField={highlightedField}
                            defaultActTemplate={defaultActTemplate}
                            onValidationError={(field) => {
                                setHighlightedField(field);
                                scrollRef.current?.scrollTo({
                                    y: 0,
                                    animated: true,
                                });
                            }}
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
            <Notification
                variant='warning'
                message={errorMessage}
                handleClose={dismissError}
            />
        </ScreenLayout>
    );
};

const styles = StyleSheet.create({
    screen: { backgroundColor: '#f3f6fa' },
    chatDivider: {
        marginBlock: 15,
        height: 1,
        backgroundColor: '#e0e0e0',
        marginHorizontal: 8,
    },
});

export default ReportSubmitScreen;
