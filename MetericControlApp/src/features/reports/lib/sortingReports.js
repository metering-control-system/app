import { compareTimes } from '@/shared/lib/collections/compareTimes';

export const sortingByAdmissionStatus = (reports, status) => {
    if (Array.isArray(reports)) {
        return [...reports].sort((a, b) => {
            return a.admission?.status === b.admission?.status
                ? 0
                : a.admission?.status === status
                  ? -1
                  : 1;
        });
    }
};

export const sortingReports = (reports) => {
    if (Array.isArray(reports)) {
        return [...reports].sort((a, b) => {
            const bySubmitedTime = compareTimes(
                a?.submitted_at,
                b?.submitted_at
            );
            if (bySubmitedTime !== 0) {
                return bySubmitedTime;
            }

            const byReviewedTime = compareTimes(a?.reviewed_at, b?.reviewed_at);
            if (byReviewedTime !== 0) {
                return byReviewedTime;
            }
            return compareTimes(a?.approved_at, b?.approved_at);
        });
    }
    return reports;
};

export const sortingBy = (reports, status) => {
    if (Array.isArray(reports)) {
        const dateField = {
            APPROVED_AT: 'approved_at',
            REVIEWED_AT: 'reviewed_at',
            SUBMITTED_AT: 'submitted_at',
        }[status];
        if (dateField) {
            return [...reports].sort((a, b) =>
                compareTimes(a?.[dateField], b?.[dateField], -1)
            );
        }
        return sortingByAdmissionStatus(reports, status);
    }
    return reports;
};
