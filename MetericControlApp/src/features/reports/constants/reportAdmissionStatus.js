export const REPORT_ADMISSION_STATUS = {
    ADMITTED: 'ADMITTED',
    NOT_ADMITTED: 'NOT_ADMITTED',
};

export const reportAdmission = {
    [REPORT_ADMISSION_STATUS.ADMITTED]: 'Допущен',
    [REPORT_ADMISSION_STATUS.NOT_ADMITTED]: 'Не допущен',
};

export const ADMISSION_STATUS_OPTIONS = Object.entries(reportAdmission).map(
    ([value, label]) => ({ value, label })
);
