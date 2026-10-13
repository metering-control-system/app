import {
    INSTALLATION_LOCATION_OPTIONS,
    REPLACEMENT_REASON_OPTIONS,
} from '../constants/reportActFields.js';
import { REJECTION_REASON_OPTIONS } from '../constants/reportFieldOptions.js';

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

const dateParts = (value = '') => {
    const [date = '', time = ''] = (value ?? '').split(' ');
    const [day = '', month = '', year = ''] = date.split('.');
    const [hour = '', minute = ''] = time.split(':');
    return { day, month, year, hour, minute };
};

export const getActReportFields = (values) => {
    values = normalizeValue(values);
    const old = values.meterBefore ?? {};
    const metering = values.metering ?? {};
    const details = values.actDetails ?? {};
    const admission = values.admission ?? {};
    const compiled = dateParts(details.compiledAt);
    const attorney = dateParts(details.powerOfAttorneyDate);
    const rejectionReason =
        admission.rejectionComment ||
        REJECTION_REASON_OPTIONS.find(
            ({ value }) => value === admission.rejectionReason
        )?.label ||
        '';
    const customerName =
        values.consumerContact?.fullName || values.customerName || '';
    const act = {
        ...compiled,
        powerOfAttorneyNumber: details.powerOfAttorneyNumber ?? '',
        powerOfAttorneyDay: attorney.day,
        powerOfAttorneyMonth: attorney.month,
        powerOfAttorneyYear: attorney.year,
        representativePositionAndName: [
            details.representativePosition,
            details.representativeName,
        ]
            .filter(Boolean)
            .join(', '),
        supplierSignerName: details.representativeName ?? '',
        utilitySignerName: details.utilityRepresentativeName ?? '',
        consumerSignerName: customerName,
        notificationEmail: values.consumerContact?.email ?? '',
        nonAdmissionReason: rejectionReason,
        signatureRefusalReason: admission.refusalReason ?? '',
        conformityDecision:
            typeof admission.isCompliant === 'boolean'
                ? admission.isCompliant
                    ? 'Соответствует'
                    : 'Не соответствует'
                : '',
        smartMeteringStatus:
            typeof admission.isSmartSystemConnected === 'boolean'
                ? admission.isSmartSystemConnected
                    ? 'Подключён'
                    : 'Не подключён'
                : '',
        oldInstallationLocation:
            INSTALLATION_LOCATION_OPTIONS.find(
                ({ value }) => value === old.installationLocation
            )?.label ?? '',
        newInstallationLocation:
            INSTALLATION_LOCATION_OPTIONS.find(
                ({ value }) => value === metering.newInstallationLocation
            )?.label ?? '',
        oldMeterOwnership: old.balanceOwnership ?? '',
        oldReadingT1: metering.oldT1 ?? '',
        oldReadingT2: metering.oldT2 ?? '',
        newReadingT1: metering.newT1 ?? '',
        newReadingT2: metering.newT2 ?? '',
        oldCurrentAndVoltage: [
            old.ratedCurrent && `${old.ratedCurrent} А`,
            old.ratedVoltage && `${old.ratedVoltage} В`,
        ]
            .filter(Boolean)
            .join(', '),
        newCurrentAndVoltage: [
            metering.newRatedCurrent && `${metering.newRatedCurrent} А`,
            metering.newRatedVoltage && `${metering.newRatedVoltage} В`,
        ]
            .filter(Boolean)
            .join(', '),
        oldSealNumber: old.sealNumber ?? '',
        oldSealOrganization: old.sealOrganization ?? '',
        newSealOrganization: metering.newSealOrganization ?? '',
        oldSimPhone: old.simNumber ?? '',
        newSimPhone: metering.newSimNumber ?? '',
        replacementReason: [
            REPLACEMENT_REASON_OPTIONS.find(
                ({ value }) => value === metering.replacementReason
            )?.label,
            metering.replacementReasonComment,
        ]
            .filter(Boolean)
            .join(': '),
    };
    for (const field of [
        'accuracyClass',
        'digitsBefore',
        'digitsAfter',
        'manufactureYear',
        'verificationDate',
        'nextVerificationDate',
    ]) {
        const suffix = field[0].toUpperCase() + field.slice(1);
        act[`old${suffix}`] = old[field] ?? '';
        act[`new${suffix}`] = metering[`new${suffix}`] ?? '';
    }
    return normalizeValue({
        clientReportId: values.clientReportId ?? '',
        address: values.address ?? {},
        actDetails: details,
        act,
        actDay: compiled.day,
        actMonth: compiled.month,
        actYear: compiled.year,
        actHour: compiled.hour,
        actMinute: compiled.minute,
        powerOfAttorneyNumber: details.powerOfAttorneyNumber ?? '',
        powerOfAttorneyDay: attorney.day,
        powerOfAttorneyMonth: attorney.month,
        powerOfAttorneyYear: attorney.year,
        representativePosition: details.representativePosition ?? '',
        representativeName: details.representativeName ?? '',
        utilityRepresentativeName: details.utilityRepresentativeName ?? '',
        customerName,
        personalAccount: values.personalAccount ?? '',
        meterBefore: {
            ...old,
            locationapartment: old.installationLocation === 'APARTMENT',
            locationstaircase: old.installationLocation === 'STAIRCASE',
            ...(old.isActualDifferent && {
                number: old.actualNumber,
                type: old.actualType,
            }),
        },
        metering: {
            ...metering,
            locationapartment: metering.newInstallationLocation === 'APARTMENT',
            locationstaircase: metering.newInstallationLocation === 'STAIRCASE',
            reasonfailure: metering.replacementReason === 'FAILURE',
            reasonverificationexpired:
                metering.replacementReason === 'VERIFICATION_EXPIRED',
            reasonmetermissing: metering.replacementReason === 'METER_MISSING',
            reasonother: metering.replacementReason === 'OTHER',
            replacementReason: metering.replacementReasonComment ?? '',
            sealOrganization: metering.newSealOrganization ?? '',
        },
        admission: {
            ...admission,
            accepted: admission.status === 'ADMITTED',
            rejected: admission.status === 'NOT_ADMITTED',
            compliant: admission.isCompliant === true,
            notcompliant: admission.isCompliant === false,
            smartsystemconnected: admission.isSmartSystemConnected === true,
            smartsystemnotconnected: admission.isSmartSystemConnected === false,
            rejectionReason,
        },
        consumerContact: values.consumerContact ?? {},
    });
};
