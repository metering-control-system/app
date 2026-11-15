import { TASK_STATUS } from '@/features/tasks/constants/taskStatus';
import { StyleSheet } from 'react-native';
import { colors } from '@/shared/consts/baseColors';

export const taskPriorityColors = StyleSheet.create({
    NOT_SPECIFIED: colors.ordinary,
    LOW: colors.primary,
    MEDIUM: colors.attention,
    HIGH: colors.warning,
});

export const taskStatusColors = StyleSheet.create({
    [TASK_STATUS.NEW]: colors.ordinary,
    [TASK_STATUS.IN_PROGRESS]: colors.secondary,
    [TASK_STATUS.COMPLETED]: colors.primary,
    [TASK_STATUS.REJECTED]: colors.warning,
});
