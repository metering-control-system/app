import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';
import { taskFormSchema } from '@/features/tasks/model/taskFormSchema';
import { taskFormDefaultValues } from '@/features/tasks/constants/taskFormDefaults';
import Card from '@/shared/components/wrapper/card';
import { FormInput } from '@/shared/components/input/input';
import FormButton from '@/shared/components/button/formButton';
import Checkbox from '@/shared/components/button/checkbox';
import { useEffect, useState } from 'react';
import { taskStatus } from '@/features/tasks/constants/taskStatus';
import useChangeTaskStatus from '@/features/tasks/hooks/useChangeTaskStatus';
import { colors } from '@/shared/consts/baseColors';
import CameraBlock from '@/shared/components/camera/cameraBlock';
import { useRouter } from 'expo-router';
import useStorePictures from '@/shared/store/useStorePictures';

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
    const router = useRouter();
    const uri = useStorePictures(
        (state) => state.photos.task?.[id]?.['new_meteric_control'] ?? null
    );
    const clearPhoto = useStorePictures((state) => state.clearPhoto);
    const { changeStatus } = useChangeTaskStatus();

    useEffect(() => {
        if (task) {
            reset(task);
        }
    }, [task]);

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

    const onSubmit = async () => {
        if (isValid && !isSubmitting) {
            void changeStatus({ id: task?.id, status: taskStatus.in_progress });
        }
    };

    return (
        <Card title='Информация до начала работ' style={styles.form}>
            <View style={styles.details}>
                <View style={styles.control}>
                    <Text nativeID='customerName' style={styles.label}>
                        ФИО
                    </Text>
                    <FormInput
                        name='customer.customerName'
                        control={control}
                        placeholder='Введите имя'
                    />
                </View>
                <View style={styles.control}>
                    <Text nativeID='personalAccount' style={styles.label}>
                        Лицевой счет
                    </Text>
                    <FormInput
                        name='customer.personalAccount'
                        control={control}
                        placeholder='Введите номер лицевого счета'
                    />
                </View>
                <View style={styles.control}>
                    <Text nativeID='meterType' style={styles.label}>
                        Тип старого ПУ
                    </Text>
                    <FormInput
                        name='meter.type'
                        control={control}
                        placeholder='Введите тип ПУ'
                    />
                </View>
                <View style={styles.control}>
                    <Text nativeID='meterNumber' style={styles.label}>
                        Номер старого ПУ
                    </Text>
                    <FormInput
                        name='meter.number'
                        control={control}
                        placeholder='Введите номер ПУ'
                    />
                </View>
            </View>
            <View style={styles.panel}>
                <View
                    style={[
                        styles.control,
                        { flexDirection: 'row', alignItems: 'center', gap: 10 },
                    ]}>
                    <Text>Фактический ПУ отличается</Text>
                    <Checkbox
                        size={30}
                        active={active}
                        setActive={() => setActive((prev) => !prev)}
                    />
                </View>
                {active && (
                    <>
                        <View style={styles.control}>
                            <Text
                                nativeID='realMeterNumber'
                                style={styles.label}>
                                Номер фактического ПУ
                            </Text>
                            <FormInput
                                name='realMeter.number'
                                control={control}
                                placeholder='Введите номер фактического ПУ'
                            />
                        </View>
                        <View style={styles.control}>
                            <Text
                                nativeID='realMeterImage'
                                style={styles.label}>
                                Фото текущего счетчика
                            </Text>
                            <CameraBlock
                                handleOpenCamera={handleOpenCamera}
                                handleDeletePhoto={handleDeletePhoto}
                                uri={uri}
                            />
                        </View>
                    </>
                )}
            </View>
            <FormButton
                isPending={isSubmitting}
                onPress={handleSubmit(onSubmit)}
                disabled={!isValid || isSubmitting}
                message={
                    task?.status === taskStatus.in_progress
                        ? 'Выполняется'
                        : 'Приступить'
                }
                style={
                    task?.status === taskStatus.in_progress
                        ? colors.primary
                        : colors.secondary
                }
            />
        </Card>
    );
};

const styles = StyleSheet.create({
    form: {
        paddingHorizontal: 15,
        width: '100%',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    control: { paddingHorizontal: 5, marginVertical: 10 },
    label: { fontSize: 12, color: '#7a7a7a', marginBottom: 10 },
    details: {
        width: '100%',
        borderTopColor: '#ddd',
        borderTopWidth: 1,
        marginVertical: 10,
    },
    panel: { width: '100%', borderTopColor: '#ddd', borderTopWidth: 1 },
});

export default TaskDetailsForm;
