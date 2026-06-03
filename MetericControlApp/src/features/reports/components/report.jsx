import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Card from '@/shared/components/wrapper/card';
import { reportStatus } from '@/features/reports/constants/reportStatus';
import {
    reportAdmissionColors,
    reportStatusColors,
} from '@/features/reports/constants/reportColors';
import { colors } from '@/shared/consts/baseColors';
import { reportAdmission } from '@/features/reports/constants/reportAdmission';

const Report = ({ report }) => {
    const router = useRouter();
    return (
        <Card
            clickable
            onPress={() => {
                router.push(`/(authorized)/reportDetails/${report.id}`);
            }}
            title={report.consumer_contact?.full_name}
            titleAlign={'flex-start'}>
            <View style={styles.cardPeriod}>
                <View style={styles.badges}>
                    <Text
                        style={[
                            styles.badge,
                            reportAdmissionColors[report.admission?.status] ??
                                colors.ordinary,
                        ]}>
                        {reportAdmission[report.admission?.status] ??
                            'не назначен'}
                    </Text>
                    <Text
                        style={[
                            styles.badge,
                            reportStatusColors[report?.status] ??
                                colors.ordinary,
                        ]}>
                        {reportStatus[report?.status] ?? 'не назначен'}
                    </Text>
                </View>
            </View>
            <View
                style={{
                    paddingVertical: 15,
                    borderTopWidth: 1,
                    borderColor: '#ddd',
                    columnGap: 15,
                }}>
                <Text
                    style={
                        styles.cardText
                    }>{`Номер старого ПУ: ${report.metering?.actual_old_meter_number}`}</Text>
                <Text
                    style={
                        styles.cardText
                    }>{`Номер нового ПУ: ${report.metering?.new_meter_number}`}</Text>
                <Text
                    style={
                        styles.cardText
                    }>{`Причина замены: ${report.admission?.rejection_reason ?? 'не указана'}`}</Text>
                <Text
                    style={
                        styles.cardText
                    }>{`Место установки: ${report.metering?.seal_location ?? 'не указано'}`}</Text>
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    cardText: { fontSize: 14, fontWeight: 'normal', color: '#9a9a9a' },
    cardPeriod: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    badge: {
        borderRadius: 5,
        paddingVertical: 2,
        paddingHorizontal: 5,
        borderWidth: 1,
        maxWidth: '50%',
    },
    badges: { flexDirection: 'row', gap: 10, alignItems: 'center', flex: 1 },
    btnPressed: { opacity: 0.75 },
});

export default Report;
