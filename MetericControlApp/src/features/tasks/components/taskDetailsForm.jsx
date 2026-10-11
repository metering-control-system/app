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
import { taskStatus } from '@/features/tasks/constants/taskStatus';
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

    const disabled = task?.status in taskStatus && task?.status !== 'NEW';
    const changeable = !(
        task?.status === 'REJECTED' || task?.status === 'COMPLETED'
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
                await changeStatus({ id: task?.id, status: 'IN_PROGRESS' });
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
                        'Заполните выделенные поля: ФИО, телефон, лицевой счёт и сведения о счётчике.'
                    )
                )}
                disabled={isPending || disabled}
                message={
                    isPending
                        ? '...Загрузка'
                        : task?.status === 'IN_PROGRESS'
                          ? 'Выполняется'
                          : task?.status === 'REJECTED'
                            ? 'Отклонена'
                            : task?.status === 'COMPLETED'
                              ? 'Завершена'
                              : 'Приступить'
                }
                style={
                    task?.status === 'IN_PROGRESS' && !isPending
                        ? colors.secondary
                        : task?.status === 'REJECTED'
                          ? {
                                ...colors.warning,
                                backgroundColor: colors.warning.borderColor,
                            }
                          : task?.status === 'COMPLETED'
                            ? colors.primary
                            : colors.ordinary
                }
            />
        </Card>
    );
};

export default TaskDetailsForm;
