export const FORM_FIELDS_MAP = {
    '@METERIC_CUSTOMER_NAME': { step: 0, field: 'customerName', label: 'ФИО' },
    '@METERIC_PERSONAL_ACCOUNT': {
        step: 0,
        field: 'personalAccount',
        label: 'Лицевой счет',
    },
    '@METERIC_OLD_METER_TYPE': {
        step: 0,
        field: 'meterBefore.type',
        label: 'Тип старого ПУ',
    },
    '@METERIC_OLD_METER_NUMBER': {
        step: 0,
        field: 'meterBefore.number',
        label: 'Номер старого ПУ',
    },
    '@METERIC_ACTUAL_METER_DIFFERENT': {
        step: 0,
        field: 'meterBefore.isActualDifferent',
        label: 'Фактический ПУ отличается',
    },
    '@METERIC_ACTUAL_METER_TYPE': {
        step: 0,
        field: 'meterBefore.actualType',
        label: 'Фактический тип ПУ',
    },
    '@METERIC_ACTUAL_METER_NUMBER': {
        step: 0,
        field: 'meterBefore.actualNumber',
        label: 'Фактический номер ПУ',
    },
    '@METERIC_REPORT_COMMENT': {
        step: 0,
        field: 'comment',
        label: 'Комментарий к отчету',
    },

    '@METERIC_DISMANTLING_COMPLETED': {
        step: 1,
        field: 'metering.dismantlingCompleted',
        label: 'Демонтаж выполнен',
    },
    '@METERIC_OLD_READING': {
        step: 1,
        field: 'metering.oldReading',
        label: 'Последние показания старого ПУ',
    },
    '@METERIC_NEW_METER_TYPE': {
        step: 1,
        field: 'metering.newMeterType',
        label: 'Тип нового ПУ',
    },
    '@METERIC_NEW_METER_NUMBER': {
        step: 1,
        field: 'metering.newMeterNumber',
        label: 'Номер нового ПУ',
    },
    '@METERIC_SEAL_LOCATION': {
        step: 1,
        field: 'metering.sealLocation',
        label: 'Место установки пломбы',
    },
    '@METERIC_SEAL_NUMBER': {
        step: 1,
        field: 'metering.sealNumber',
        label: 'Номер пломбы',
    },
    '@METERIC_INSTALLATION_READING': {
        step: 1,
        field: 'metering.installationReading',
        label: 'Показания при установке',
    },

    '@METERIC_PHOTO_OLD_METER': {
        step: 2,
        field: 'photos.oldMeter',
        label: 'Фото старого счетчика',
    },
    '@METERIC_PHOTO_SEAL': {
        step: 2,
        field: 'photos.seal',
        label: 'Фото пломбы',
    },
    '@METERIC_PHOTO_FRONT_PANEL': {
        step: 2,
        field: 'photos.frontPanel',
        label: 'Фото лицевой панели',
    },
    '@METERIC_PHOTO_GENERAL_VIEW': {
        step: 2,
        field: 'photos.generalView',
        label: 'Общий вид',
    },
    '@METERIC_PHOTO_ACT_PAPER': {
        step: 2,
        field: 'photos.actPaper',
        label: 'Фото бумажного акта',
    },
    '@METERIC_PHOTO_REFUSAL_PROOF': {
        step: 2,
        field: 'photos.refusalProof',
        label: 'Фото подтверждения отказа',
    },

    '@METERIC_ADMISSION_STATUS': {
        step: 3,
        field: 'admission.status',
        label: 'Статус допуска',
    },
    '@METERIC_ADMISSION_REJECTION_REASON': {
        step: 3,
        field: 'admission.rejectionReason',
        label: 'Причина недопуска',
    },
    '@METERIC_ADMISSION_REJECTION_COMMENT': {
        step: 3,
        field: 'admission.rejectionComment',
        label: 'Комментарий к отказу',
    },

    '@METERIC_REFUSED_CONTACT': {
        step: 4,
        field: 'consumerContact.isRefusedContact',
        label: 'Отказ от контактов',
    },
    '@METERIC_PHONE_NUMBER': {
        step: 4,
        field: 'consumerContact.phoneNumber',
        label: 'Телефон 1',
    },
    '@METERIC_PHONE_NUMBER_2': {
        step: 4,
        field: 'consumerContact.phoneNumber2',
        label: 'Телефон 2',
    },
    '@METERIC_EMAIL': {
        step: 4,
        field: 'consumerContact.email',
        label: 'Email',
    },
    '@METERIC_CONTACT_NAME': {
        step: 4,
        field: 'consumerContact.fullName',
        label: 'ФИО контактного лица',
    },
};
