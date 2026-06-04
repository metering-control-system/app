import { compareTimes } from '@/shared/lib/sorting/compareTimes';

export const sortingBySubmitTime = (reports) => {
    if (Array.isArray(reports)) {
        return reports.sort((a, b) => {
            return compareTimes(a?.submitted_at, b?.submitted_at);
        });
    }
};

export const sortingByReviewTime = (reports) => {
    if (Array.isArray(reports)) {
        return reports.sort((a, b) => {
            return compareTimes(a?.reviewed_at, b?.reviewed_at);
        });
    }
};

export const sortingByApprovedTime = (reports) => {
    if (Array.isArray(reports)) {
        return reports.sort((a, b) => {
            return compareTimes(a?.approved_at, b?.approved_at);
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
            if (bySubmitedTime > 0) {
                return -1;
            } else if (bySubmitedTime < 0) {
                return 1;
            }

            const byReviewedTime = compareTimes(a?.reviewed_at, b?.reviewed_at);
            if (byReviewedTime > 0) {
                return -1;
            } else if (byReviewedTime < 0) {
                return 1;
            }
            return compareTimes(a?.approved_at, b?.approved_at);
        });
    }
    return reports;
};
