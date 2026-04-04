// eslint-disable-next-line import/no-unresolved
import ScreenLayout from '@/shared/components/screen/screenLayout';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useEffect, useRef, useState } from 'react';
// eslint-disable-next-line import/no-unresolved
import { tasks } from '@/shared/consts/tasks';

const TaskDescription = () => {
    const { id } = useLocalSearchParams();
    const idRef = useRef();
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (!id || idRef.current) return;
        idRef.current = id;
        setFormData(tasks.find((task) => task.id === idRef.current));
    }, [id]);

    return (
        <ScreenLayout safe style={{ justifyContent: 'center' }}>
            <ScreenLayout style={styles.card}>
                <Text style={styles.cardTitle}>Информация до начала работ</Text>
                <View style={styles.form}>
                    <View style={styles.control}>
                        <Text nativeID='name' style={styles.label}>
                            ФИО
                        </Text>
                        <TextInput
                            defaultValue={formData?.customerName}
                            placeholder='Введите имя'
                            value={formData?.customerName}
                            style={styles.input}
                            accessibilityLabelledBy='name'
                            onChangeText={(value) =>
                                setFormData((fd) => ({
                                    ...fd,
                                    consumerName: value,
                                }))
                            }
                        />
                    </View>
                    <View style={styles.control}>
                        <Text nativeID='personalAccount' style={styles.label}>
                            Лицевой счет
                        </Text>
                        <TextInput
                            defaultValue={formData?.personalAccount}
                            placeholder='Введите номер ЛС'
                            value={formData?.personalAccount}
                            style={styles.input}
                            accessibilityLabelledBy='personalAccount'
                            onChangeText={(value) =>
                                setFormData((fd) => ({
                                    ...fd,
                                    personalAccount: value,
                                }))
                            }
                        />
                    </View>
                    <View style={styles.control}>
                        <Text nativeID='meterType' style={styles.label}>
                            Тип старого ПУ
                        </Text>
                        <TextInput
                            defaultValue={formData?.meter?.type}
                            placeholder='Введите тип старого ПУ'
                            value={formData?.meter?.type}
                            style={styles.input}
                            accessibilityLabelledBy='meterType'
                            onChangeText={(value) =>
                                setFormData((fd) => ({
                                    ...fd,
                                    meter: { ...fd.meter, type: value },
                                }))
                            }
                        />
                    </View>
                    <View style={styles.control}>
                        <Text nativeID='meterNumber' style={styles.label}>
                            Номер старого ПУ
                        </Text>
                        <TextInput
                            defaultValue={formData?.meter?.number}
                            placeholder='Введите номер старого ПУ'
                            value={formData?.meter?.number}
                            style={styles.input}
                            accessibilityLabelledBy='meterNumber'
                            onChangeText={(value) =>
                                setFormData((fd) => ({
                                    ...fd,
                                    meter: { ...fd.meter, number: value },
                                }))
                            }
                        />
                    </View>
                </View>
            </ScreenLayout>
        </ScreenLayout>
    );
};

const styles = StyleSheet.create({
    card: {
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        borderRadius: 12,
        rowGap: 5,
        minHeight: 100,
        boxSizing: 'border-box',
        shadowColor: '#000',
        shadowOffset: { width: 10, height: 50 },
        shadowOpacity: 1,
        shadowRadius: 10,
        paddingHorizontal: 5,
        paddingVertical: 5,
        backgroundColor: 'white',
        marginBottom: 15,
    },
    cardTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 15 },
    cardText: { fontSize: 14, fontWeight: 'normal' },
    form: {
        paddingHorizontal: 15,
        width: '100%',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    control: { paddingHorizontal: 5, marginVertical: 10 },
    label: { fontSize: 12, color: '#ddd', marginBottom: 10 },
    input: {
        backgroundColor: '#e1ebfd',
        color: '#000',
        width: '100%',
        borderRadius: 12,
    },
});

export default TaskDescription;
