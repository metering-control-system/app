import { REPORT_STATUS } from '@/features/reports/constants/reportStatus';
import { REPORT_ADMISSION_STATUS } from '@/features/reports/constants/reportAdmissionStatus';
import { StyleSheet } from 'react-native';
import { colors } from '@/shared/consts/baseColors';

export const reportAdmissionColors = StyleSheet.create({
    [REPORT_ADMISSION_STATUS.ADMITTED]: colors.primary,
    [REPORT_ADMISSION_STATUS.NOT_ADMITTED]: colors.warning,
});

export const reportStatusColors = StyleSheet.create({
    [REPORT_STATUS.ON_REVIEW]: colors.secondary,
    [REPORT_STATUS.ON_ADMIN]: colors.attention,
    [REPORT_STATUS.ACCEPTED]: colors.primary,
    [REPORT_STATUS.REJECTED]: colors.warning,
});
