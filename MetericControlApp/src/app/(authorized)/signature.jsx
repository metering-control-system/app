import useErrors from '@/shared/hooks/useErrors';
import { View } from 'react-native';
import Notification from '@/shared/components/notification/Notification';
import ReportSignatureCapture from '@/features/reports/components/reportSignatureCapture';

const SignatureScreen = () => {
    const { error: errorMessage, handleError, dismissError } = useErrors();

    return (
        <View style={{ flex: 1 }}>
            <ReportSignatureCapture onError={handleError} />
            <Notification
                variant='warning'
                message={errorMessage}
                handleClose={dismissError}
            />
        </View>
    );
};

export default SignatureScreen;
