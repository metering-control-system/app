import { StyleSheet, Text, View } from 'react-native';
import { reportStatus } from '@/features/reports/constants/reportStatus';
import { reportStatusColors } from '@/features/reports/constants/reportColors';
import { colors } from '@/shared/consts/baseColors';

const ReportDetailsSummary = ({ report, task, renderDetail }) => {
    const statusColor = reportStatusColors[report.status] ?? colors.ordinary;
    const dates = [
        ['Отправлен', report.submitted_at],
        ['Проверен', report.reviewed_at],
        ['Принят', report.approved_at],
    ].filter(([, date]) => date);
    return (
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
                {task?.address?.display_address || 'Отчёт о выполненной работе'}
            </Text>
            {renderDetail(
                'customerName',
                'ФИО потребителя',
                task?.consumer?.full_name
            )}
            {renderDetail(
                'personalAccount',
                'Лицевой счёт',
                task?.address?.account_number
            )}
            {task?.address?.room && (
                <Text style={styles.subtitle}>
                    Комната: {task.address.room}
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
    );
};

export default ReportDetailsSummary;

const styles = StyleSheet.create({
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
    label: {
        fontSize: 13,
        lineHeight: 19,
        color: '#64748b',
        flex: 1,
        minWidth: 0,
    },
});
