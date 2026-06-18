import { compareTimes } from '@/shared/lib/collections/compareTimes';

export const sortingBySubmitTime = (reports) => {
    if (Array.isArray(reports)) {
        return reports.sort((a, b) => {
            return compareTimes(a?.submitted_at, b?.submitted_at, -1);
        });
    }
};

export const sortingByReviewTime = (reports) => {
    if (Array.isArray(reports)) {
        return reports.sort((a, b) => {
            return compareTimes(a?.reviewed_at, b?.reviewed_at, -1);
        });
    }
};

export const sortingByApprovedTime = (reports) => {
    if (Array.isArray(reports)) {
        return reports.sort((a, b) => {
            return compareTimes(a?.approved_at, b?.approved_at, -1);
        });
    }
};

export const sortingByAdmissionStatus = (reports, status) => {
    if (Array.isArray(reports)) {
        return reports.sort((a, b) => {
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
        return reports.sort((a, b) => {
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
        if (status === 'APPROVED_AT') {
            return sortingByApprovedTime(reports);
        } else if (status === 'REVIEWED_AT') {
            return sortingByReviewTime(reports);
        } else if (status === 'SUBMITTED_AT') {
            return sortingBySubmitTime(reports);
        } else {
            return sortingByAdmissionStatus(reports, status);
        }
    }
    return reports;
};
