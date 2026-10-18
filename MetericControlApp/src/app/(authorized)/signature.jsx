import useReportDraftStore from '@/features/reports/store/useReportDraftStore';
import useErrors from '@/shared/hooks/useErrors';
import { View } from 'react-native';
import Notification from '@/shared/components/notification/Notification';
import ActSignatureCapture from '@/features/acts/components/actSignatureCapture';

const SignatureScreen = () => {
    const { error: errorMessage, handleError, dismissError } = useErrors();

    const handleActSaved = ({ taskId, values, actPdf }) => {
        const draftId = String(taskId);
        const draftStore = useReportDraftStore.getState();
        draftStore.setDraft({
            draftId,
            values: { ...(draftStore.getDraft(draftId) ?? values), actPdf },
        });
    };

    return (
        <View style={{ flex: 1 }}>
            <ActSignatureCapture
                onError={handleError}
                onSaved={handleActSaved}
            />
            <Notification
                variant='warning'
                message={errorMessage}
                handleClose={dismissError}
            />
        </View>
    );
};

export default SignatureScreen;
