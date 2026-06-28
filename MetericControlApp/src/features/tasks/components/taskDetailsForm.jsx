import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { taskFormSchema } from '@/features/tasks/model/taskFormSchema';
import { taskFormDefaultValues } from '@/features/tasks/constants/taskFormDefaults';
import Card from '@/shared/components/wrapper/card';
import FormButton from '@/shared/components/button/formButton';
import useChangeTaskStatus from '@/features/tasks/hooks/useChangeTaskStatus';
import { colors } from '@/shared/consts/baseColors';
import { useRouter } from 'expo-router';
import useStorePictures from '@/shared/store/useStorePictures';
import { taskStatus } from '@/features/tasks/constants/taskStatus';
import TaskDetailsTextField from '@/features/tasks/components/taskDetailsForm/taskDetailsTextField';
import TaskRealMeterSection from '@/features/tasks/components/taskDetailsForm/taskRealMeterSection';
import {
    additionalTaskDetailsFields,
    primaryTaskDetailsFields,
} from '@/features/tasks/components/taskDetailsForm/taskDetailsFormFields';
import { taskDetailsFormStyles as styles } from '@/features/tasks/components/taskDetailsForm/taskDetailsFormStyles';

const TaskDetailsForm = ({ task, id }) => {
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

    const [active, setActive] = useState(false);
    const disabled = task?.status in taskStatus && task?.status !== 'NEW';
    const changeable = !(
        task?.status === 'REJECTED' || task?.status === 'COMPLETED'
    );
    const router = useRouter();
    const uri = useStorePictures(
        (state) => state.photos.task?.[id]?.['new_meteric_control'] ?? null
    );
    const clearPhoto = useStorePictures((state) => state.clearPhoto);
    const { changeStatus, isPending } = useChangeTaskStatus();
    const setPhoto = useStorePictures((state) => state.setPhoto);

    useEffect(() => {
        if (task) {
            reset(task);
        }
    }, [reset, task]);

    const handleOpenCamera = () => {
        router?.push({
            pathname: '/(authorized)/camera',
            params: { action: 'tasks', id },
        });
    };

    const handleDeletePhoto = () => {
        clearPhoto({
            entity: 'task',
            entityId: id,
            slot: 'new_meteric_control',
        });
    };

    const handleUploadPhoto = (uri) =>
        setPhoto({
            entity: 'task',
            entityId: id,
            slot: 'new_meteric_control',
            uri,
        });

    const onSubmit = async () => {
        if (isValid && !isSubmitting) {
            try {
                await changeStatus({ id: task?.id, status: 'IN_PROGRESS' });
            } catch {
                console.error('Ошибка изменения статуса');
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
            <TaskRealMeterSection
                active={active}
                editable={changeable}
                control={control}
                uri={uri}
                onToggle={() => setActive((prev) => !prev)}
                onOpenCamera={handleOpenCamera}
                onDeletePhoto={handleDeletePhoto}
                onUploadPhoto={handleUploadPhoto}
            />
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
                onPress={handleSubmit(onSubmit)}
                disabled={isPending || disabled}
                message={
                    isPending
                        ? '...Загрузка'
                        : task?.status === 'IN_PROGRESS'
                          ? 'Выполняется'
                          : 'Приступить'
                }
                style={
                    task?.status === 'IN_PROGRESS' && !isPending
                        ? colors.primary
                        : colors.secondary
                }
            />
        </Card>
    );
};

export default TaskDetailsForm;
