import { reportAdmission } from '@/features/reports/constants/reportAdmissionStatus';
export const sortingVariants = {
    ...reportAdmission,
    SUBMITTED_AT: 'По времени отправления',
    REVIEWED_AT: 'По времени проверки',
    APPROVED_AT: 'По времени принятия',
};
