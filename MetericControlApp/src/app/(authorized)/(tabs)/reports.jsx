import ScreenLayout from '@/shared/components/screen/screenLayout';
import { useState } from 'react';
import Notification from '@/shared/components/notification/Notification';
import ReportsList from '@/features/reports/components/reportsList';
import { sortingVariants } from '@/features/reports/constants/reportSortingVariants';
import { reportStatus } from '@/features/reports/constants/reportStatus';
import { reportAdmission } from '@/features/reports/constants/reportAdmissionStatus';
import { ControlPanel } from '@/shared/components/control/controlPanel';

const ReportScreen = () => {
    const [error, setError] = useState(null);

    const [filtering, setFiltering] = useState(new Set());
    const [sorting, setSorting] = useState(null);
    const [search, setSearch] = useState('');

    const reportSortingVariants = Object.entries(sortingVariants);
    const reportFilteringVariants = Object.entries(reportStatus).concat(
        Object.entries(reportAdmission)
    );

    return (
        <ScreenLayout safe>
            {error && (
                <Notification
                    variant='warning'
                    message={error}
                    handleClose={() => setError(null)}
                />
            )}
            <ControlPanel
                filteringVariants={reportFilteringVariants}
                sortingVariants={reportSortingVariants}
                filtering={filtering}
                setFiltering={setFiltering}
                sorting={sorting}
                setSorting={setSorting}
                setSearch={setSearch}
                search={search}
            />
            <ReportsList
                sorting={sorting}
                filtering={filtering}
                setError={setError}
                search={search}
            />
        </ScreenLayout>
    );
};

export default ReportScreen;
