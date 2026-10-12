import { REPORT_ACT_FIELDS } from '../constants/reportActFields.js';

const pad = (value) => String(value).padStart(2, '0');

export const parseReportDate = (value) => {
    const match = value?.trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (!match) return null;
    const [, day, month, year] = match.map(Number);
    if (year < 1) return null;
    const date = new Date(0);
    date.setUTCFullYear(year, month - 1, day);
    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
    )
        return null;
    return `${String(year).padStart(4, '0')}-${pad(month)}-${pad(day)}`;
};

export const formatReportDate = (value) => {
    if (!value) return '';
    const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return match ? `${match[3]}.${match[2]}.${match[1]}` : String(value);
};

export const formatReportDateTime = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return String(value);
    return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${String(date.getFullYear()).padStart(4, '0')} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const parseReportDateTime = (value) => {
    const match = value
        ?.trim()
        .match(/^(\d{2}\.\d{2}\.\d{4}) (\d{2}):(\d{2})$/);
    if (!match || !parseReportDate(match[1])) return null;
    const [day, month, year] = match[1].split('.').map(Number);
    const hour = Number(match[2]);
    const minute = Number(match[3]);
    if (hour > 23 || minute > 59) return null;
    const date = new Date(0);
    date.setFullYear(year, month - 1, day);
    date.setHours(hour, minute, 0, 0);
    if (date.getHours() !== hour || date.getMinutes() !== minute) return null;
    return date.toISOString();
};

export const buildReportActFieldsPayload = (values) => {
    const payload = { metering: {}, admission: {}, ['act_details']: {} };
    for (const field of REPORT_ACT_FIELDS) {
        const value = values[field.group]?.[field.name];
        const trimmed = typeof value === 'string' ? value.trim() : value;
        let normalized;
        switch (field.kind) {
            case 'boolean':
                normalized = typeof value === 'boolean' ? value : null;
                break;
            case 'date':
                normalized = trimmed ? parseReportDate(trimmed) : null;
                break;
            case 'datetime':
                normalized = trimmed ? parseReportDateTime(trimmed) : null;
                break;
            case 'integer':
                normalized =
                    trimmed === '' || trimmed == null ? null : Number(trimmed);
                break;
            case 'reading':
                normalized =
                    trimmed === '' || trimmed == null
                        ? null
                        : String(trimmed).replace(',', '.');
                break;
            default:
                normalized = trimmed ?? '';
        }
        const block =
            field.group === 'actDetails'
                ? 'act_details'
                : field.group === 'meterBefore'
                  ? 'metering'
                  : field.group;
        payload[block][field.api] = normalized;
    }
    return payload;
};

export const hydrateReportActFields = (report) => {
    const values = {
        meterBefore: {},
        metering: {},
        admission: {},
        actDetails: {},
    };
    for (const field of REPORT_ACT_FIELDS) {
        const block =
            field.group === 'actDetails'
                ? 'act_details'
                : field.group === 'meterBefore'
                  ? 'metering'
                  : field.group;
        const value = report[block]?.[field.api];
        values[field.group][field.name] =
            field.kind === 'boolean'
                ? (value ?? null)
                : field.kind === 'date'
                  ? formatReportDate(value)
                  : field.kind === 'datetime'
                    ? formatReportDateTime(value)
                    : value == null
                      ? ''
                      : String(value);
    }
    return values;
};
