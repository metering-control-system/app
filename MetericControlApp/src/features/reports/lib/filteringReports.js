import { reportStatus } from '@/features/reports/constants/reportStatus';
import { reportAdmission } from '@/features/reports/constants/reportAdmission';

export const filteringByStatus = ({ statuses, reports }) => {
    if (!Array.isArray(reports)) {
        return;
    }

    for (const status of statuses) {
        if (!reportStatus[status]) {
            return;
        }
    }

    return reports.reduce((prev = [], curr) => {
        for (const status of statuses) {
            if (curr.status !== status) {
                return prev;
            }
        }
        return [...prev, curr];
    });
};

export const filteringByAdmissionStatus = (status, reports) => {
    if (!(status in reportAdmission)) {
        return;
    }

    return reports.filter((report) => report.admission.status === status);
};
