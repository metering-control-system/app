import { StyleSheet, Text, View } from 'react-native';
import { reportAdmission } from '@/features/reports/constants/reportAdmissionStatus';
import {
    REJECTION_REASON_OPTIONS,
    SEAL_LOCATION_OPTIONS,
} from '@/features/reports/constants/reportFieldOptions';
import { getAdditionalReportDetails } from '@/features/reports/lib/reportFieldDetails';
import {
    DetailRow,
    ReportFieldTarget,
    Section,
    AdditionalDetails,
} from '@/features/reports/components/reportDetailsForm/reportDetailsLayout';
import ReportDetailsSummary from '@/features/reports/components/reportDetailsForm/reportDetailsSummary';
import ReportDetailsPhotos from '@/features/reports/components/reportDetailsForm/reportDetailsPhotos';

const ReportDetailsForm = ({
    onError,
    report,
    task,
    highlightedField,
    fillPositions,
}) => {
    if (!report) {
        return <Text style={styles.emptyText}>Отчёт недоступен.</Text>;
    }

    const metering = report.metering ?? {};
    const admission = report.admission ?? {};
    const contact = report.consumer_contact ?? {};
    const additionalDetails = getAdditionalReportDetails(report);
    const renderTarget = (name, children) => (
        <ReportFieldTarget
            name={name}
            highlightedField={highlightedField}
            fillPositions={fillPositions}>
            {children}
        </ReportFieldTarget>
    );
    const renderDetail = (name, label, value) =>
        renderTarget(name, <DetailRow label={label} value={value} />);
    const oldMeterNumberField =
        highlightedField === 'meterBefore.number'
            ? 'meterBefore.number'
            : 'meterBefore.actualNumber';
    const oldMeterTypeField =
        highlightedField === 'meterBefore.type'
            ? 'meterBefore.type'
            : 'meterBefore.actualType';

    return (
        <View style={styles.container}>
            <ReportDetailsSummary
                report={report}
                task={task}
                renderDetail={renderDetail}
            />

            {additionalDetails.actDetails.length > 0 && (
                <Section title='Реквизиты отчёта' icon='document-text-outline'>
                    <AdditionalDetails
                        highlightedField={highlightedField}
                        fillPositions={fillPositions}
                        rows={additionalDetails.actDetails}
                        stacked
                    />
                </Section>
            )}

            <Section title='Итог работы' icon='clipboard-outline'>
                {renderDetail(
                    'admission.status',
                    'Допуск',
                    reportAdmission[admission.status]
                )}
                {renderDetail(
                    'admission.rejectionReason',
                    'Причина отказа',
                    REJECTION_REASON_OPTIONS.find(
                        ({ value }) => value === admission.rejection_reason
                    )?.label ?? admission.rejection_reason
                )}
                {renderDetail(
                    'admission.rejectionComment',
                    'Комментарий к отказу',
                    admission.rejection_comment
                )}
                <AdditionalDetails
                    highlightedField={highlightedField}
                    fillPositions={fillPositions}
                    rows={additionalDetails.admission}
                />
            </Section>

            <Section title='Старый счётчик' icon='speedometer-outline'>
                {renderDetail(
                    oldMeterNumberField,
                    'Номер',
                    highlightedField === 'meterBefore.number'
                        ? task?.meter?.number
                        : metering.actual_old_meter_number
                )}
                {renderDetail(
                    oldMeterTypeField,
                    'Тип',
                    highlightedField === 'meterBefore.type'
                        ? task?.meter?.type
                        : metering.actual_old_meter_type
                )}
                {renderDetail(
                    'meterBefore.isActualDifferent',
                    'Фактический ПУ отличается',
                    task?.meter
                        ? metering.actual_old_meter_number !==
                              task.meter.number ||
                          metering.actual_old_meter_type !== task.meter.type
                            ? 'Да'
                            : 'Нет'
                        : null
                )}
                {renderDetail(
                    'metering.oldReading',
                    'Показание при демонтаже',
                    metering.removal_reading
                )}
                {renderDetail(
                    'metering.dismantlingCompleted',
                    'Демонтаж выполнен',
                    typeof metering.dismantling_completed === 'boolean'
                        ? metering.dismantling_completed
                            ? 'Да'
                            : 'Нет'
                        : null
                )}
                <AdditionalDetails
                    highlightedField={highlightedField}
                    fillPositions={fillPositions}
                    rows={additionalDetails.oldMeter}
                />
            </Section>

            <Section title='Новый счётчик' icon='flash-outline'>
                {renderDetail(
                    'metering.newMeterNumber',
                    'Номер',
                    metering.new_meter_number
                )}
                {renderDetail(
                    'metering.newMeterType',
                    'Тип',
                    metering.new_meter_type
                )}
                {renderDetail(
                    'metering.installationReading',
                    'Показание при установке',
                    metering.installation_reading
                )}
                {renderDetail(
                    'metering.sealNumber',
                    'Номер пломбы',
                    metering.seal_number
                )}
                {renderDetail(
                    'metering.sealLocation',
                    'Место пломбирования',
                    SEAL_LOCATION_OPTIONS.find(
                        ({ value }) => value === metering.seal_location
                    )?.label ?? metering.seal_location
                )}
                <AdditionalDetails
                    highlightedField={highlightedField}
                    fillPositions={fillPositions}
                    rows={additionalDetails.newMeter}
                />
            </Section>

            {additionalDetails.replacement.length > 0 && (
                <Section title='Причина замены' icon='construct-outline'>
                    <AdditionalDetails
                        highlightedField={highlightedField}
                        fillPositions={fillPositions}
                        rows={additionalDetails.replacement}
                    />
                </Section>
            )}

            <Section title='Контактные данные' icon='person-outline'>
                {renderDetail(
                    'consumerContact.isRefusedContact',
                    'Отказ от контактов',
                    typeof contact.is_refused_contact === 'boolean'
                        ? contact.is_refused_contact
                            ? 'Да'
                            : 'Нет'
                        : null
                )}
                {renderDetail(
                    'consumerContact.fullName',
                    'ФИО',
                    contact.full_name
                )}
                {renderDetail(
                    'consumerContact.phoneNumber',
                    'Телефон',
                    contact.phone_number_1
                )}
                {renderDetail(
                    'consumerContact.phoneNumber2',
                    'Второй телефон',
                    contact.phone_number_2
                )}
                {renderDetail(
                    'consumerContact.email',
                    'Электронная почта',
                    contact.email
                )}
            </Section>

            {highlightedField === 'comment' &&
                renderTarget(
                    'comment',
                    <Section
                        title='Комментарий к отчёту'
                        icon='chatbubble-outline'>
                        <Text style={styles.emptyText}>
                            Комментарии доступны в чате отчёта.
                        </Text>
                    </Section>
                )}

            <ReportDetailsPhotos
                images={report.images}
                onError={onError}
                highlightedField={highlightedField}
                fillPositions={fillPositions}
            />
            {highlightedField === 'actPdf' &&
                renderTarget(
                    'actPdf',
                    <Section title='Акт' icon='document-text-outline'>
                        <Text style={styles.emptyText}>
                            {report.act?.url
                                ? 'Цифровой акт прикреплён к отчёту.'
                                : 'Цифровой акт не прикреплён.'}
                        </Text>
                    </Section>
                )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { gap: 16, width: '100%' },
    emptyText: {
        fontSize: 14,
        lineHeight: 21,
        color: '#64748b',
        paddingVertical: 8,
    },
});

export default ReportDetailsForm;
