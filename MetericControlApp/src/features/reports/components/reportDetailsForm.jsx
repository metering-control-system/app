import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import ImagePreview from '@/shared/components/media/imagePreview';
import { reportAdmission } from '@/features/reports/constants/reportAdmissionStatus';
import { reportStatus } from '@/features/reports/constants/reportStatus';
import { reportStatusColors } from '@/features/reports/constants/reportColors';
import { REPORT_PHOTO_CONFIGS } from '@/features/reports/constants/reportPhotoConfigs';
import {
    REJECTION_REASON_OPTIONS,
    SEAL_LOCATION_OPTIONS,
} from '@/features/reports/constants/reportFieldOptions';
import { colors } from '@/shared/consts/baseColors';

const DetailRow = ({ label, value }) => (
    <View style={styles.detailRow}>
        <Text style={styles.label}>{label}</Text>
        <Text selectable style={styles.value}>
            {value === null || value === undefined || value === ''
                ? 'Не указано'
                : value}
        </Text>
    </View>
);

const Section = ({ icon, title, children }) => (
    <View style={styles.section}>
        <View style={styles.sectionHeading}>
            <View style={styles.iconBox}>
                <Ionicons name={icon} size={19} color='#475569' />
            </View>
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {children}
    </View>
);

const ReportDetailsForm = ({ report, task }) => {
    const [previewUri, setPreviewUri] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    if (!report) {
        return <Text style={styles.emptyText}>Отчёт недоступен.</Text>;
    }

    const statusColor = reportStatusColors[report.status] ?? colors.ordinary;
    const metering = report.metering ?? {};
    const admission = report.admission ?? {};
    const contact = report.consumer_contact ?? {};
    const dates = [
        ['Отправлен', report.submitted_at],
        ['Проверен', report.reviewed_at],
        ['Принят', report.approved_at],
    ].filter(([, date]) => date);
    const photoGroups = (report.images ?? []).reduce((groups, photo) => {
        const existingGroup = groups.find(({ kind }) => kind === photo.kind);
        if (existingGroup) {
            existingGroup.photos.push(photo);
        } else {
            groups.push({
                kind: photo.kind,
                title:
                    REPORT_PHOTO_CONFIGS.find(({ kind }) => kind === photo.kind)
                        ?.title ?? 'Другие фотографии',
                photos: [photo],
            });
        }
        return groups;
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.summary}>
                <View style={styles.summaryHeading}>
                    <Text style={styles.eyebrow}>ОТЧЁТ №{report.id}</Text>
                    <View
                        style={[
                            styles.statusBadge,
                            { backgroundColor: statusColor.backgroundColor },
                        ]}>
                        <View
                            style={[
                                styles.statusDot,
                                { backgroundColor: statusColor.color },
                            ]}
                        />
                        <Text
                            style={[
                                styles.statusText,
                                { color: statusColor.color },
                            ]}>
                            {reportStatus[report.status] ?? 'Статус не указан'}
                        </Text>
                    </View>
                </View>
                <Text selectable style={styles.address}>
                    {task?.address?.display_address ||
                        'Отчёт о выполненной работе'}
                </Text>
                {task?.address?.account_number && (
                    <Text style={styles.subtitle}>
                        Лицевой счёт: {task.address.account_number}
                    </Text>
                )}
                {dates.length > 0 && (
                    <View style={styles.dates}>
                        {dates.map(([label, date]) => (
                            <View key={label} style={styles.dateRow}>
                                <Text style={styles.label}>{label}</Text>
                                <Text style={styles.dateValue}>
                                    {new Date(date).toLocaleString('ru-RU', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>

            <Section title='Итог работы' icon='clipboard-outline'>
                <DetailRow
                    label='Допуск'
                    value={reportAdmission[admission.status]}
                />
                {admission.rejection_reason && (
                    <DetailRow
                        label='Причина отказа'
                        value={
                            REJECTION_REASON_OPTIONS.find(
                                ({ value }) =>
                                    value === admission.rejection_reason
                            )?.label ?? admission.rejection_reason
                        }
                    />
                )}
                {admission.rejection_comment && (
                    <View style={styles.note}>
                        <Text style={styles.label}>Комментарий к отказу</Text>
                        <Text selectable style={styles.noteText}>
                            {admission.rejection_comment}
                        </Text>
                    </View>
                )}
            </Section>

            <Section title='Старый счётчик' icon='speedometer-outline'>
                <DetailRow
                    label='Номер'
                    value={metering.actual_old_meter_number}
                />
                <DetailRow label='Тип' value={metering.actual_old_meter_type} />
                <DetailRow
                    label='Показание при демонтаже'
                    value={metering.removal_reading}
                />
                <DetailRow
                    label='Демонтаж выполнен'
                    value={
                        typeof metering.dismantling_completed === 'boolean'
                            ? metering.dismantling_completed
                                ? 'Да'
                                : 'Нет'
                            : null
                    }
                />
            </Section>

            <Section title='Новый счётчик' icon='flash-outline'>
                <DetailRow label='Номер' value={metering.new_meter_number} />
                <DetailRow label='Тип' value={metering.new_meter_type} />
                <DetailRow
                    label='Показание при установке'
                    value={metering.installation_reading}
                />
                <DetailRow label='Номер пломбы' value={metering.seal_number} />
                <DetailRow
                    label='Место пломбирования'
                    value={
                        SEAL_LOCATION_OPTIONS.find(
                            ({ value }) => value === metering.seal_location
                        )?.label ?? metering.seal_location
                    }
                />
            </Section>

            <Section title='Контактные данные' icon='person-outline'>
                {contact.is_refused_contact ? (
                    <Text style={styles.emptyText}>
                        Клиент отказался предоставить контакты.
                    </Text>
                ) : (
                    <>
                        <DetailRow label='ФИО' value={contact.full_name} />
                        <DetailRow
                            label='Телефон'
                            value={contact.phone_number_1}
                        />
                        {contact.phone_number_2 && (
                            <DetailRow
                                label='Второй телефон'
                                value={contact.phone_number_2}
                            />
                        )}
                        {contact.email && (
                            <DetailRow
                                label='Электронная почта'
                                value={contact.email}
                            />
                        )}
                    </>
                )}
            </Section>

            <Section title='Фотографии' icon='images-outline'>
                {photoGroups.length === 0 ? (
                    <Text style={styles.emptyText}>
                        Фотографии не добавлены.
                    </Text>
                ) : (
                    photoGroups.map((group) => (
                        <View key={group.kind} style={styles.photoGroup}>
                            <View style={styles.photoHeading}>
                                <Text style={styles.photoTitle}>
                                    {group.title}
                                </Text>
                                <Text style={styles.photoCount}>
                                    {group.photos.length}
                                </Text>
                            </View>
                            <View style={styles.photoGrid}>
                                {group.photos.map((photo, index) => (
                                    <Pressable
                                        key={photo.client_image_id ?? index}
                                        accessibilityRole='button'
                                        accessibilityLabel={`${group.title}, фото ${index + 1}`}
                                        disabled={!photo.url}
                                        onPress={() => {
                                            setPreviewUri(photo.url);
                                            setModalVisible(true);
                                        }}
                                        style={({ pressed }) => [
                                            styles.photoTile,
                                            pressed && styles.pressed,
                                        ]}>
                                        <Image
                                            source={photo.url}
                                            style={styles.image}
                                            contentFit='cover'
                                        />
                                        <View style={styles.expandIcon}>
                                            <Ionicons
                                                name='expand-outline'
                                                size={16}
                                                color='#fff'
                                            />
                                        </View>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    ))
                )}
            </Section>
            <ImagePreview
                uri={previewUri}
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                editable={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { gap: 16, width: '100%' },
    summary: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        gap: 12,
        borderWidth: 1,
        borderColor: '#e8edf3',
    },
    summaryHeading: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10,
    },
    eyebrow: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        color: '#64748b',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontSize: 12, fontWeight: '600' },
    address: {
        fontSize: 22,
        lineHeight: 29,
        fontWeight: '700',
        color: '#1e293b',
    },
    subtitle: { fontSize: 13, color: '#64748b' },
    dates: {
        borderTopWidth: 1,
        borderTopColor: '#edf1f5',
        paddingTop: 12,
        gap: 8,
    },
    dateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 6,
    },
    dateValue: { color: '#475569', fontSize: 13 },
    section: {
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 18,
        borderWidth: 1,
        borderColor: '#e8edf3',
    },
    sectionHeading: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
    },
    iconBox: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#1e293b',
        flexShrink: 1,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 16,
        paddingVertical: 10,
    },
    label: { fontSize: 13, lineHeight: 19, color: '#64748b', flexShrink: 1 },
    value: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '500',
        color: '#1e293b',
        textAlign: 'right',
        flex: 1,
    },
    note: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 12,
        gap: 5,
        marginTop: 8,
    },
    noteText: { fontSize: 14, lineHeight: 21, color: '#334155' },
    emptyText: {
        fontSize: 14,
        lineHeight: 21,
        color: '#64748b',
        paddingVertical: 8,
    },
    photoGroup: { marginTop: 12 },
    photoHeading: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    photoTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#475569',
        flexShrink: 1,
    },
    photoCount: {
        fontSize: 12,
        color: '#64748b',
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: 8,
    },
    photoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: 10,
    },
    photoTile: {
        width: '48%',
        aspectRatio: 4 / 3,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#f1f5f9',
    },
    image: { width: '100%', height: '100%' },
    expandIcon: {
        position: 'absolute',
        right: 8,
        bottom: 8,
        padding: 5,
        borderRadius: 8,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
    },
    pressed: { opacity: 0.75 },
});

export default ReportDetailsForm;
