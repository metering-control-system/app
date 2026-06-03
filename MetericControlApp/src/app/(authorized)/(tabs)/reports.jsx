import ScreenLayout from '@/shared/components/screen/screenLayout';
import { useState } from 'react';
import Notification from '@/shared/components/notification/Notification';
import ReportsList from '@/features/reports/components/reportsList';

const ReportScreen = () => {
    const [error, setError] = useState(null);

    return (
        <ScreenLayout safe>
            {error && (
                <Notification
                    variant='warning'
                    message={error}
                    handleClose={() => setError(null)}
                />
            )}
            <ReportsList setError={setError} />
        </ScreenLayout>
    );
};

export default ReportScreen;
