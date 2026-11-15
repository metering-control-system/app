import { REPORT_ACT_FIELDS } from '@/features/reports/constants/reportActFields';
import { hydrateReportActFields } from '@/features/reports/lib/reportActFieldValues';

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
            field: `${field.group}.${field.name}`,
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
