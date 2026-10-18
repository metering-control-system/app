import { StyleSheet } from 'react-native';
import { colors } from '@/shared/consts/baseColors';

export const taskPriorityColors = StyleSheet.create({
    NOT_SPECIFIED: colors.ordinary,
    LOW: colors.primary,
    MEDIUM: colors.attention,
    HIGH: colors.warning,
});

export const taskStatusColors = StyleSheet.create({
    NEW: colors.ordinary,
    IN_PROGRESS: colors.secondary,
    COMPLETED: colors.primary,
    REJECTED: colors.warning,
    NEEDS_REVISION: colors.warning,
});
