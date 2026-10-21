import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { View } from 'react-native';
import { taskFormSchema } from '@/features/tasks/model/taskFormSchema';
import { taskFormDefaultValues } from '@/features/tasks/constants/taskFormDefaults';
import Card from '@/shared/components/wrapper/card';
import FormButton from '@/shared/components/button/formButton';
import useChangeTaskStatus from '@/features/tasks/hooks/useChangeTaskStatus';
import { colors } from '@/shared/consts/baseColors';
import { TASK_STATUS, taskStatus } from '@/features/tasks/constants/taskStatus';
import TaskDetailsTextField from '@/features/tasks/components/taskDetailsForm/taskDetailsTextField';
import {
    additionalTaskDetailsFields,
    primaryTaskDetailsFields,
} from '@/features/tasks/components/taskDetailsForm/taskDetailsFormFields';
import { taskDetailsFormStyles as styles } from '@/features/tasks/components/taskDetailsForm/taskDetailsFormStyles';

const TaskDetailsForm = ({ onError, task }) => {
    const {
        control,
        handleSubmit,
        formState: { isSubmitting, isValid },
        reset,
    } = useForm({
        resolver: zodResolver(taskFormSchema),
        mode: 'onChange',
        defaultValues: taskFormDefaultValues,
    });

    const disabled =
        task?.status in taskStatus && task?.status !== TASK_STATUS.NEW;
    const changeable = !(
        task?.status === TASK_STATUS.REJECTED ||
        task?.status === TASK_STATUS.COMPLETED
    );
    const { changeStatus, isPending } = useChangeTaskStatus();

    useEffect(() => {
        if (task) {
            reset(task);
        }
    }, [reset, task]);

    const onSubmit = async () => {
        if (isValid && !isSubmitting) {
            try {
                await changeStatus({
                    id: task?.id,
                    status: TASK_STATUS.IN_PROGRESS,
                });
            } catch {
                onError(
                    'Не удалось начать работу',
                    'Проверьте подключение и нажмите «Приступить» ещё раз.'
                );
            }
        }
    };

    return (
        <Card title='Информация до начала работ' style={styles.form}>
            <View style={styles.details}>
                {primaryTaskDetailsFields.map((field) => (
                    <TaskDetailsTextField
                        key={field.name}
                        control={control}
                        editable={changeable}
                        {...field}
                    />
                ))}
            </View>
            <View style={styles.details}>
                {additionalTaskDetailsFields.map((field) => (
                    <TaskDetailsTextField
                        key={field.name}
                        control={control}
                        editable={changeable}
                        {...field}
                    />
                ))}
            </View>
            <FormButton
                isPending={isPending}
                onPress={handleSubmit(onSubmit, () =>
                    onError(
                        'Проверьте данные задачи',
                        'Заполните выделенные поля: ФИО, телефон и сведения о счётчике.'
                    )
                )}
                disabled={isPending || disabled}
                message={
                    isPending
                        ? '...Загрузка'
                        : task?.status === TASK_STATUS.IN_PROGRESS
                          ? 'Выполняется'
                          : task?.status === TASK_STATUS.REJECTED
                            ? 'Отклонена'
                            : task?.status === TASK_STATUS.COMPLETED
                              ? 'Завершена'
                              : 'Приступить'
                }
                style={
                    task?.status === TASK_STATUS.IN_PROGRESS && !isPending
                        ? colors.secondary
                        : task?.status === TASK_STATUS.REJECTED
                          ? {
                                ...colors.warning,
                                backgroundColor: colors.warning.borderColor,
                            }
                          : task?.status === TASK_STATUS.COMPLETED
                            ? colors.primary
                            : colors.ordinary
                }
            />
        </Card>
    );
};

export default TaskDetailsForm;
