export const reportSubmitFormDefaultValues = {
    clientReportId: '',
    customerName: '',
    personalAccount: '',
    comment: '',
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
    admission: {
        status: '',
        rejectionReason: '',
        rejectionReasons: [],
        rejectionComment: '',
    },
    consumerContact: {
        isRefusedContact: false,
        phoneNumber: '',
        phoneNumber2: '',
        email: '',
        fullName: '',
    },
};
