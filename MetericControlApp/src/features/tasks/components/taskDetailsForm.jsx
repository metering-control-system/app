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
import useChangeTaskStatus from '@/features/tasks/hooks/useChangeTaskStatus';
import { colors } from '@/shared/consts/baseColors';
import MediaBlock from '@/shared/components/media/mediaBlock';
import { useRouter } from 'expo-router';
import useStorePictures from '@/shared/store/useStorePictures';
import { taskStatus } from '@/features/tasks/constants/taskStatus';

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
                <View style={styles.control}>
                    <Text nativeID='consumerName' style={styles.label}>
                        ФИО
                    </Text>
                    <FormInput
                        name='consumer.full_name'
                        control={control}
                        placeholder='Введите имя клиента'
                        editable={changeable}
                    />
                </View>
                <View style={styles.control}>
                    <Text nativeID='consumerPhoneNumber' style={styles.label}>
                        Номер телефона
                    </Text>
                    <FormInput
                        name='consumer.phone_number'
                        control={control}
                        placeholder='Введите номер телефона клиента'
                        editable={changeable}
                    />
                </View>
                <View style={styles.control}>
                    <Text nativeID='personalAccount' style={styles.label}>
                        Лицевой счет
                    </Text>
                    <FormInput
                        name='address.account_number'
                        control={control}
                        placeholder='Введите номер лицевого счета'
                        editable={changeable}
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
                        editable={changeable}
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
                        editable={changeable}
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
                                editable={changeable}
                            />
                        </View>
                        <View style={styles.control}>
                            <Text
                                nativeID='realMeterImage'
                                style={styles.label}>
                                Фото текущего счетчика
                            </Text>
                            <MediaBlock
                                handleOpenCamera={handleOpenCamera}
                                handleDeletePhoto={handleDeletePhoto}
                                handleUploadPhoto={handleUploadPhoto}
                                handleUpdatePhoto={handleUploadPhoto}
                                disabled={!changeable}
                                uri={uri}
                            />
                        </View>
                    </>
                )}
            </View>
            <View style={styles.details}>
                <View style={styles.control}>
                    <Text nativeID='installationLocation' style={styles.label}>
                        Место установки ПУ
                    </Text>
                    <FormInput
                        name='meter.installation_location'
                        control={control}
                        placeholder='Введите место установки ПУ'
                        editable={changeable}
                    />
                </View>
                <View style={styles.control}>
                    <Text nativeID='reason' style={styles.label}>
                        Причина замены
                    </Text>
                    <FormInput
                        name='task_data.service_reason'
                        control={control}
                        placeholder='Введите причину замены'
                        editable={changeable}
                    />
                </View>
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
