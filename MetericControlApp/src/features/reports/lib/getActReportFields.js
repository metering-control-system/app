const normalizeValue = (value) => {
    if (typeof value === 'string') return value.trim();
    if (Array.isArray(value)) return value.map(normalizeValue);
    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.keys(value)
                .sort()
                .filter((key) => value[key] !== undefined)
                .map((key) => [key, normalizeValue(value[key])])
        );
    }
    return value;
};

export const getActReportFields = (values) =>
    normalizeValue({
        clientReportId: values.clientReportId ?? '',
        customerName: values.customerName ?? '',
        personalAccount: values.personalAccount ?? '',
        actDetails: values.actDetails ?? {},
        meterBefore: values.meterBefore ?? {},
        metering: values.metering ?? {},
        admission: values.admission ?? {},
        consumerContact: values.consumerContact ?? {},
    });
