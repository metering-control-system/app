import { createReportPhotoSlotRecord } from './reportPhotoConfigs';

export const reportSubmitFormDefaultValues = {
    clientReportId: '',
    customerName: '',
    personalAccount: '',
    comment: '',
    meterBefore: {
        type: '',
        number: '',
        actualType: '',
        actualNumber: '',
        isActualDifferent: false,
    },
    metering: {
        dismantlingCompleted: false,
        oldReading: '',
        newMeterType: '',
        newMeterNumber: '',
        sealLocation: '',
        sealNumber: '',
        installationReading: '',
    },
    photos: createReportPhotoSlotRecord(() => []),
    admission: { status: '', rejectionReason: '', rejectionComment: '' },
    consumerContact: {
        isRefusedContact: false,
        phoneNumber: '',
        phoneNumber2: '',
        email: '',
        fullName: '',
    },
    actPdf: { uri: '', id: '', isRefused: false },
};
