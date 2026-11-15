import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReportFieldLayout } from '@/features/reports/components/reportFormLayout';

export const DetailRow = ({ label, value, stacked = false }) => (
    <View style={[styles.detailRow, stacked && styles.stackedDetailRow]}>
        <Text style={[styles.label, stacked && styles.stackedLabel]}>
            {label}
        </Text>
        <Text selectable style={[styles.value, stacked && styles.stackedValue]}>
            {value === null || value === undefined || value === ''
                ? 'Не указано'
                : value}
        </Text>
    </View>
);

export const Section = ({ icon, title, children }) => (
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
export const AdditionalDetails = ({
    rows,
    stacked = false,
    highlightedField,
    fillPositions,
}) =>
    rows.map(({ key, field, label, value }) => (
        <ReportFieldLayout
            key={key}
            name={field}
            highlightedField={highlightedField}
            fillPositions={fillPositions}>
            <DetailRow label={label} value={value} stacked={stacked} />
        </ReportFieldLayout>
    ));

const styles = StyleSheet.create({
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
    label: {
        fontSize: 13,
        lineHeight: 19,
        color: '#64748b',
        flex: 1,
        minWidth: 0,
    },
    stackedDetailRow: {
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 4,
    },
    stackedLabel: { flex: 0 },
    stackedValue: { flex: 0, textAlign: 'left' },
    value: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '500',
        color: '#1e293b',
        textAlign: 'right',
        flex: 1,
        minWidth: 0,
    },
});
