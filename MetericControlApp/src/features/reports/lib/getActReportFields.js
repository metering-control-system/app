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
        act: {
            consumerSignerName:
                values.consumerContact?.fullName || values.customerName || '',
            notificationEmail: values.consumerContact?.email ?? '',
            nonAdmissionReason:
                values.admission?.rejectionComment ||
                values.admission?.rejectionReason ||
                '',
        },
        customerName: values.customerName ?? '',
        personalAccount: values.personalAccount ?? '',
        meterBefore: {
            ...values.meterBefore,
            ...(values.meterBefore?.isActualDifferent && {
                number: values.meterBefore.actualNumber,
                type: values.meterBefore.actualType,
            }),
        },
        metering: values.metering ?? {},
        admission: values.admission ?? {},
        consumerContact: values.consumerContact ?? {},
    });
