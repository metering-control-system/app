export const reportSubmitFormDefaultValues = {
    customerName: '',
    personalAccount: '',
    meterBefore: { type: '', number: '', actualType: '', actualNumber: '' },
    metering: {
        dismantlingCompleted: false,
        oldReading: '',
        newMeterType: '',
        newMeterNumber: '',
        sealLocation: '',
        sealNumber: '',
        installationReading: '',
    },
    photos: {
        oldMeter: null,
        seal: null,
        frontPanel: null,
        generalView: null,
        actPaper: null,
        refusalProof: null,
    },
    admission: { status: '', rejectionReasons: [], rejectionComment: '' },
    consumerContact: {
        isRefusedContact: false,
        phoneNumber: '',
        email: '',
        fullName: '',
    },
};
