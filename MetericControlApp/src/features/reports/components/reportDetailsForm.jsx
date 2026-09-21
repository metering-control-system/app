import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Card from '@/shared/components/wrapper/card';
import { defaultValues } from '@/features/reports/constants/reportDefaultValues';
import { Image } from 'expo-image';
import { useState } from 'react';
import ImagePreview from '@/shared/components/media/imagePreview';
import { dtLocale } from '@/shared/consts/datetimeOptions';
import { FieldRow } from '@/shared/components/field/fieldRow';
import { reportAdmission } from '@/features/reports/constants/reportAdmissionStatus';

const ReportDetailsForm = ({ report }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [currentPressedImageUrl, setCurrentPressedImageUrl] = useState('');

    const submittedAt = report.submitted_at
        ? new Date(report.submitted_at).toLocaleString(
              dtLocale.locales,
              dtLocale.options
          )
        : null;
    const reviewedAt = report.reviewed_at
        ? new Date(report.reviewed_at).toLocaleString(
              dtLocale.locales,
              dtLocale.options
          )
        : null;
    const approvedAt = report.approved_at
        ? new Date(report.approved_at).toLocaleString(
              dtLocale.locales,
              dtLocale.options
          )
        : null;

    return (
        <Card
            title='Отчет о проделанной работе'
            style={styles.form}
            titleAlign='center'>
            <Card
                style={{
                    borderColor: '#ddd',
                    elevation: 1,
                    borderWidth: 1,
                    borderStyle: 'solid',
                    padding: 5,
                    marginVertical: 10,
                }}>
                {submittedAt && (
                    <View style={styles.control}>
                        <Text style={styles.label}>
                            Отправлен: {submittedAt}
                        </Text>
                    </View>
                )}
                {reviewedAt && (
                    <View style={styles.control}>
                        <Text style={styles.label}>Проверен: {reviewedAt}</Text>
                    </View>
                )}
                {approvedAt && (
                    <View style={styles.control}>
                        <Text style={styles.label}>Принят: {approvedAt}</Text>
                    </View>
                )}
            </Card>
            <View style={styles.details}>
                <Text style={styles.title}>Данные клиента</Text>
                <FieldRow
                    value={report?.consumer_contact?.full_name}
                    defaultValue={defaultValues.consumer.fullName}
                    label='ФИО'
                />
                <FieldRow
                    value={report?.consumer_contact?.phone_number_1}
                    defaultValue={defaultValues.consumer.phoneNumber}
                    label='Номер телефона'
                />
            </View>
            <View style={styles.details}>
                <Text style={styles.title}>Допуск</Text>
                <FieldRow
                    value={reportAdmission[report?.admission?.status]}
                    defaultValue={defaultValues.admission.status}
                    label='Статус'
                />
                {report?.admission?.rejection_reason && (
                    <>
                        <FieldRow
                            value={report?.admission?.rejection_reason}
                            defaultValue={
                                defaultValues.admission.rejection_reason
                            }
                            label='Причина отказа'
                        />
                        <FieldRow
                            value={report?.admission?.rejection_comment}
                            defaultValue={
                                defaultValues.admission.rejection_comment
                            }
                            label='Комментарий'
                        />
                    </>
                )}
            </View>
            <View style={styles.details}>
                <Text style={styles.title}>Данные ПУ</Text>
                <FieldRow
                    value={report?.metering?.actual_old_meter_number}
                    defaultValue={defaultValues.meter.oldMeterNumber}
                    label='Номер демонтируемого ПУ'
                />
                <FieldRow
                    value={report?.metering?.actual_old_meter_type}
                    defaultValue={defaultValues.meter.oldMeterType}
                    label='Тип демонтируемого ПУ'
                />
                <FieldRow
                    value={report?.metering?.installation_reading}
                    defaultValue={defaultValues.meter.oldMeterReading}
                    label='Показание демонтируемого ПУ'
                />
                <FieldRow
                    value={report?.metering?.new_meter_number}
                    defaultValue={defaultValues.meter.newMeterNumber}
                    label='Номер устанавливаемого ПУ'
                />
                <FieldRow
                    value={report?.metering?.new_meter_type}
                    defaultValue={defaultValues.meter.newMeterType}
                    label='Тип устанавливаемого ПУ'
                />
                <FieldRow
                    value={report?.metering?.installation_reading}
                    defaultValue={defaultValues.meter.newMeterReading}
                    label='Показание устанавливаемого ПУ'
                />
                <FieldRow
                    value={report?.metering?.seal_location}
                    defaultValue={defaultValues.meter.sealLocation}
                    label='Местоположение пломбы'
                />
                <FieldRow
                    value={report?.metering?.seal_number}
                    defaultValue={defaultValues.meter.sealNumber}
                    label='Номер пломбы'
                />
            </View>
            <View style={styles.control}>
                <Text style={styles.title}>Изображения</Text>

                {report?.images?.map((item, index) => (
                    <View
                        style={styles.control}
                        key={item.client_image_id ?? index}>
                        <Text style={styles.label}>{item.kind}</Text>
                        <TouchableOpacity
                            style={styles.imageTouchable}
                            onPress={() => {
                                if (!item.url) {
                                    return;
                                }
                                setModalVisible(true);
                                setCurrentPressedImageUrl(item.url);
                            }}>
                            <Image
                                source={item.url}
                                style={styles.image}
                                contentFit='cover'
                            />
                        </TouchableOpacity>
                    </View>
                ))}
                <ImagePreview
                    uri={currentPressedImageUrl}
                    modalVisible={modalVisible}
                    setModalVisible={setModalVisible}
                    editable={false}
                />
            </View>
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
    title: {
        fontSize: 16,
        fontWeight: '500',
        marginTop: 15,
        marginBottom: 10,
        color: '#7a7a7a',
    },
    panel: { width: '100%', borderTopColor: '#ddd', borderTopWidth: 1 },
    imageTouchable: {
        aspectRatio: 16 / 9,
        borderRadius: 8,
        borderColor: '#ddd',
        borderWidth: 1,
        width: '100%',
    },
    image: { width: '100%', height: '100%' },
});

export default ReportDetailsForm;
