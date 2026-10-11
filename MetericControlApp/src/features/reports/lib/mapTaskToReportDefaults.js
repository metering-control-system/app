import { reportSubmitFormDefaultValues } from '../constants/reportSubmitFormDefaults.js';
import { createClientReportId } from './createClientReportId.js';
import { formatReportDateTime } from './reportActFieldValues.js';
import { INSTALLATION_LOCATION_OPTIONS } from '../constants/reportActFields.js';

export const mapTaskToReportDefaults = (task) => ({
    ...reportSubmitFormDefaultValues,
    clientReportId: createClientReportId(),
    customerName: task?.consumer?.full_name || '',
    personalAccount: String(task?.address?.account_number ?? ''),
    address: Object.fromEntries(
        Object.keys(reportSubmitFormDefaultValues.address).map((key) => [
            key,
            String(task?.address?.[key] ?? ''),
        ])
    ),
    actDetails: {
        ...reportSubmitFormDefaultValues.actDetails,
        compiledAt: formatReportDateTime(new Date()),
    },
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
