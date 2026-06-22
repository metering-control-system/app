import { StyleSheet } from 'react-native';
import { colors } from '@/shared/consts/baseColors';

export const reportAdmissionColors = StyleSheet.create({
    ADMITTED: colors.primary,
    NOT_ADMITTED: colors.warning,
});

export const reportStatusColors = StyleSheet.create({
    ON_REVIEW: colors.secondary,
    ON_ADMIN: colors.attention,
    ACCEPTED: colors.primary,
    REJECTED: colors.warning,
});
