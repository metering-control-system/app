import { REPORT_ACT_FIELDS } from '../constants/reportActFields.js';
import { hydrateReportActFields } from './reportActFieldValues.js';

export const getAdditionalReportDetails = (report) => {
    const values = hydrateReportActFields(report);
    const sections = {
        oldMeter: [],
        newMeter: [],
        replacement: [],
        admission: [],
        actDetails: [],
    };

    for (const field of REPORT_ACT_FIELDS) {
        const value = values[field.group][field.name];
        if (value === '' || value == null) continue;
        const section =
            field.group === 'meterBefore' || field.api.startsWith('old_')
                ? 'oldMeter'
                : field.api.startsWith('new_')
                  ? 'newMeter'
                  : field.group === 'metering'
                    ? 'replacement'
                    : field.group;

        sections[section].push({
            key: field.api,
            label: field.label,
            value:
                field.kind === 'boolean'
                    ? value
                        ? 'Да'
                        : 'Нет'
                    : (field.options?.find((option) => option.value === value)
                          ?.label ?? value),
        });
    }

    return sections;
};
