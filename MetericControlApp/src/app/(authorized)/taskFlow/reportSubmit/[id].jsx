import useReportSubmitNavigation from '@/features/reports/hooks/useReportSubmitNavigation';
import useErrors from '@/shared/hooks/useErrors';
import Notification from '@/shared/components/notification/Notification';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import ScreenLayout from '@/shared/components/screen/screenLayout';
import ReportSubmitForm from '@/features/reports/components/reportSubmitForm';
import useTaskById from '@/features/tasks/hooks/useTaskById';
import { ScrollView, StyleSheet } from 'react-native';
import ScreenLoader from '@/shared/components/loader/screenLoader';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import useSettingsStore from '@/features/settings/store/useSettingsStore';
import useTaskReport from '@/features/reports/hooks/useTaskReport';
import TaskReportLookupError from '@/features/reports/components/taskReportLookupError';

const ReportSubmitScreen = () => {
    const { error: errorMessage, handleError, dismissError } = useErrors();

    const { id, reference, sourceReportId } = useLocalSearchParams();
    const { task, isPending } = useTaskById(+id);
    const reportQuery = useTaskReport(task);
    const {
        scrollRef,
        fillPositions,
        step,
        setStep,
        highlightedField,
        onValidationError,
        isResolvingSource,
        redirect,
    } = useReportSubmitNavigation({
        id,
        task,
        reportQuery,
        isPending,
        reference,
        sourceReportId,
    });
    const defaultActTemplate = useSettingsStore(
        (state) => state.defaultActTemplate
    );
    const router = useRouter();

    if (redirect) return <Redirect href={redirect} />;

    return (
        <ScreenLayout safe style={styles.screen}>
            {isPending || reportQuery.isPending || isResolvingSource ? (
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
                            onValidationError={onValidationError}
                        />
                    </ScrollView>
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

const styles = StyleSheet.create({ screen: { backgroundColor: '#f3f6fa' } });

export default ReportSubmitScreen;
