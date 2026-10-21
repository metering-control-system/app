import { reportSubmitFormDefaultValues } from '@/features/reports/constants/reportSubmitFormDefaults';
import { INSTALLATION_LOCATION_OPTIONS } from '@/features/reports/constants/reportActFields';

export const mapTaskToReportDefaults = (
    task,
    { clientReportId = '', compiledAt = '' } = {}
) => ({
    ...reportSubmitFormDefaultValues,
    clientReportId,
    customerName: task?.consumer?.full_name || '',
    personalAccount: String(task?.address?.account_number ?? ''),
    address: Object.fromEntries(
        Object.keys(reportSubmitFormDefaultValues.address).map((key) => [
            key,
            String(task?.address?.[key] ?? ''),
        ])
    ),
    actDetails: { ...reportSubmitFormDefaultValues.actDetails, compiledAt },
    meterBefore: {
        ...reportSubmitFormDefaultValues.meterBefore,
        type: task?.meter?.type || '',
        number: task?.meter?.number || '',
        actualNumber: task?.realMeter?.number || '',
        isActualDifferent: Boolean(task?.realMeter?.number),
        installationLocation: INSTALLATION_LOCATION_OPTIONS.some(
            (option) => option.value === task?.meter?.installation_location
        )
            ? task.meter.installation_location
            : '',
    },
});
