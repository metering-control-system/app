export const REPORT_STATUS = {
    ON_REVIEW: 'ON_REVIEW',
    ON_ADMIN: 'ON_ADMIN',
    ACCEPTED: 'ACCEPTED',
    REJECTED: 'REJECTED',
};

export const reportStatus = {
    [REPORT_STATUS.ON_REVIEW]: 'На проверке',
    [REPORT_STATUS.ON_ADMIN]: 'На утверждении',
    [REPORT_STATUS.ACCEPTED]: 'Завершена',
    [REPORT_STATUS.REJECTED]: 'Отклонена',
};
