import { createReportPhotoSlotRecord } from './reportPhotoConfigs.js';
import { getReportActFieldDefaults } from './reportActFields.js';

export const reportSubmitFormDefaultValues = {
    clientReportId: '',
    customerName: '',
    personalAccount: '',
    comment: '',
    address: {
        locality: '',
        street: '',
        house: '',
        building: '',
        apartment: '',
        room: '',
    },
    actDetails: getReportActFieldDefaults('actDetails'),
    meterBefore: {
        ...getReportActFieldDefaults('meterBefore'),
        type: '',
        number: '',
        actualType: '',
        actualNumber: '',
        isActualDifferent: false,
    },
    metering: {
        ...getReportActFieldDefaults('metering'),
        dismantlingCompleted: false,
        oldReading: '',
        newMeterType: '',
        newMeterNumber: '',
        sealLocation: '',
        sealNumber: '',
        installationReading: '',
    },
    photos: createReportPhotoSlotRecord(() => []),
    admission: {
        ...getReportActFieldDefaults('admission'),
        status: '',
        rejectionReason: '',
        rejectionComment: '',
    },
    consumerContact: {
        isRefusedContact: false,
        phoneNumber: '',
        phoneNumber2: '',
        email: '',
        fullName: '',
    },
    actPdf: { uri: '', id: '', isRefused: false },
};
