import { REPORT_ACT_FIELDS } from './reportActFields';
import { REPORT_FORM_STEPS } from '../lib/reportFormValidation';

export const FORM_FIELDS_MAP = {
    '@METERIC_CUSTOMER_NAME': {
        step: 0,
        stepLabel: 'До работ',
        field: 'customerName',
        label: 'ФИО',
    },
    '@METERIC_PERSONAL_ACCOUNT': {
        step: 0,
        stepLabel: 'До работ',
        field: 'personalAccount',
        label: 'Лицевой счет',
    },
    '@METERIC_OLD_METER_TYPE': {
        step: 0,
        stepLabel: 'До работ',
        field: 'meterBefore.type',
        label: 'Тип старого ПУ',
    },
    '@METERIC_OLD_METER_NUMBER': {
        step: 0,
        stepLabel: 'До работ',
        field: 'meterBefore.number',
        label: 'Номер старого ПУ',
    },
    '@METERIC_ACTUAL_METER_DIFFERENT': {
        step: 0,
        stepLabel: 'До работ',
        field: 'meterBefore.isActualDifferent',
        label: 'Фактический ПУ отличается',
    },
    '@METERIC_ACTUAL_METER_TYPE': {
        step: 0,
        stepLabel: 'До работ',
        field: 'meterBefore.actualType',
        label: 'Фактический тип ПУ',
    },
    '@METERIC_ACTUAL_METER_NUMBER': {
        step: 0,
        stepLabel: 'До работ',
        field: 'meterBefore.actualNumber',
        label: 'Фактический номер ПУ',
    },
    '@METERIC_REPORT_COMMENT': {
        step: 0,
        stepLabel: 'До работ',
        field: 'comment',
        label: 'Комментарий к отчету',
    },

    '@METERIC_DISMANTLING_COMPLETED': {
        step: 1,
        stepLabel: 'Монтаж',
        field: 'metering.dismantlingCompleted',
        label: 'Демонтаж выполнен',
    },
    '@METERIC_OLD_READING': {
        step: 1,
        stepLabel: 'Монтаж',
        field: 'metering.oldReading',
        label: 'Последние показания старого ПУ',
    },
    '@METERIC_NEW_METER_TYPE': {
        step: 1,
        stepLabel: 'Монтаж',
        field: 'metering.newMeterType',
        label: 'Тип нового ПУ',
    },
    '@METERIC_NEW_METER_NUMBER': {
        step: 1,
        stepLabel: 'Монтаж',
        field: 'metering.newMeterNumber',
        label: 'Номер нового ПУ',
    },
    '@METERIC_SEAL_LOCATION': {
        step: 1,
        stepLabel: 'Монтаж',
        field: 'metering.sealLocation',
        label: 'Место установки пломбы',
    },
    '@METERIC_SEAL_NUMBER': {
        step: 1,
        stepLabel: 'Монтаж',
        field: 'metering.sealNumber',
        label: 'Номер пломбы',
    },
    '@METERIC_INSTALLATION_READING': {
        step: 1,
        stepLabel: 'Монтаж',
        field: 'metering.installationReading',
        label: 'Показания при установке',
    },

    '@METERIC_PHOTO_OLD_METER': {
        step: 2,
        stepLabel: 'Фото',
        field: 'photos.oldMeter',
        label: 'Фото старого счетчика',
    },
    '@METERIC_PHOTO_SEAL': {
        step: 2,
        stepLabel: 'Фото',
        field: 'photos.seal',
        label: 'Фото пломбы',
    },
    '@METERIC_PHOTO_FRONT_PANEL': {
        step: 2,
        stepLabel: 'Фото',
        field: 'photos.frontPanel',
        label: 'Фото лицевой панели',
    },
    '@METERIC_PHOTO_GENERAL_VIEW': {
        step: 2,
        stepLabel: 'Фото',
        field: 'photos.generalView',
        label: 'Общий вид',
    },
    '@METERIC_PHOTO_ACT_PAPER': {
        step: 2,
        stepLabel: 'Фото',
        field: 'photos.actPaper',
        label: 'Фото бумажного акта',
    },
    '@METERIC_PHOTO_REFUSAL_PROOF': {
        step: 2,
        stepLabel: 'Фото',
        field: 'photos.refusalProof',
        label: 'Фото подтверждения отказа',
    },

    '@METERIC_ADMISSION_STATUS': {
        step: 3,
        stepLabel: 'Допуск',
        field: 'admission.status',
        label: 'Статус допуска',
    },
    '@METERIC_ADMISSION_REJECTION_REASON': {
        step: 3,
        stepLabel: 'Допуск',
        field: 'admission.rejectionReason',
        label: 'Причина недопуска',
    },

    '@METERIC_REFUSED_CONTACT': {
        step: 4,
        stepLabel: 'Контакты',
        field: 'consumerContact.isRefusedContact',
        label: 'Отказ от контактов',
    },
    '@METERIC_PHONE_NUMBER': {
        step: 4,
        stepLabel: 'Контакты',
        field: 'consumerContact.phoneNumber',
        label: 'Телефон 1',
    },
    '@METERIC_PHONE_NUMBER_2': {
        step: 4,
        stepLabel: 'Контакты',
        field: 'consumerContact.phoneNumber2',
        label: 'Телефон 2',
    },
    '@METERIC_EMAIL': {
        step: 4,
        stepLabel: 'Контакты',
        field: 'consumerContact.email',
        label: 'Электронная почта',
    },
    '@METERIC_CONTACT_NAME': {
        step: 4,
        stepLabel: 'Контакты',
        field: 'consumerContact.fullName',
        label: 'ФИО контактного лица',
    },
};

const serverFieldTags = {
    '@ДЕМОНТАЖ ВЫПОЛНЕН': 'metering.dismantlingCompleted',
    '@НОМЕР СТАРОГО ПУ': 'meterBefore.actualNumber',
    '@ТИП СТАРОГО ПУ': 'meterBefore.actualType',
    '@НОМЕР НОВОГО ПУ': 'metering.newMeterNumber',
    '@ТИП НОВОГО ПУ': 'metering.newMeterType',
    '@ПОКАЗАНИЯ СНЯТИЯ': 'metering.oldReading',
    '@ПОКАЗАНИЯ УСТАНОВКИ': 'metering.installationReading',
    '@МЕСТО ПЛОМБЫ': 'metering.sealLocation',
    '@НОМЕР ПЛОМБЫ': 'metering.sealNumber',
    '@РЕШЕНИЕ ПО ДОПУСКУ': 'admission.status',
    '@ПРИЧИНА НЕДОПУСКА': 'admission.rejectionReason',
    '@КОММЕНТАРИЙ К НЕДОПУСКУ': 'admission.rejectionComment',
    '@ОТКАЗ ОТ СВЯЗИ': 'consumerContact.isRefusedContact',
    '@ФАМИЛИЯ': 'consumerContact.fullName',
    '@ИМЯ': 'consumerContact.fullName',
    '@ОТЧЕСТВО': 'consumerContact.fullName',
    '@ТЕЛЕФОН': 'consumerContact.phoneNumber',
    '@ДОПОЛНИТЕЛЬНЫЙ ТЕЛЕФОН': 'consumerContact.phoneNumber2',
    '@EMAIL': 'consumerContact.email',
    '@ФОТО ПЛОМБЫ': 'photos.seal',
    '@ФОТО ЛИЦЕВОЙ ПАНЕЛИ': 'photos.frontPanel',
    '@ФОТО ОБЩЕГО ВИДА': 'photos.generalView',
    '@ФОТО СТАРОГО СЧЁТЧИКА': 'photos.oldMeter',
    '@ФОТО БУМАЖНОГО АКТА': 'photos.actPaper',
    '@ПОДТВЕРЖДЕНИЕ ОТКАЗА': 'photos.refusalProof',
    '@PDF АКТА': 'actPdf',
};

export const REPORT_FIELD_REFERENCES = { ...FORM_FIELDS_MAP };
for (const [tag, field] of Object.entries(serverFieldTags)) {
    const reference = Object.values(FORM_FIELDS_MAP).find(
        (item) => item.field === field
    ) ?? { field, step: field === 'actPdf' ? 5 : 3, label: tag.slice(1) };
    REPORT_FIELD_REFERENCES[tag] = reference;
    REPORT_FIELD_REFERENCES[tag.replaceAll(' ', '_')] = reference;
}

export const REPORT_API_FIELDS = {
    'metering.dismantling_completed': 'metering.dismantlingCompleted',
    'metering.actual_old_meter_number': 'meterBefore.actualNumber',
    'metering.actual_old_meter_type': 'meterBefore.actualType',
    'metering.new_meter_number': 'metering.newMeterNumber',
    'metering.new_meter_type': 'metering.newMeterType',
    'metering.removal_reading': 'metering.oldReading',
    'metering.installation_reading': 'metering.installationReading',
    'metering.seal_location': 'metering.sealLocation',
    'metering.seal_number': 'metering.sealNumber',
    'admission.status': 'admission.status',
    'admission.rejection_reason': 'admission.rejectionReason',
    'admission.rejection_comment': 'admission.rejectionComment',
    'consumer_contact.is_refused_contact': 'consumerContact.isRefusedContact',
    'consumer_contact.first_name': 'consumerContact.fullName',
    'consumer_contact.last_name': 'consumerContact.fullName',
    'consumer_contact.middle_name': 'consumerContact.fullName',
    'consumer_contact.phone_number_1': 'consumerContact.phoneNumber',
    'consumer_contact.phone_number_2': 'consumerContact.phoneNumber2',
    'consumer_contact.email': 'consumerContact.email',
    'images.SEAL': 'photos.seal',
    'images.FRONT_PANEL': 'photos.frontPanel',
    'images.GENERAL_VIEW': 'photos.generalView',
    'images.OLD_METER': 'photos.oldMeter',
    'images.ACT_PAPER': 'photos.actPaper',
    'images.REFUSAL_PROOF': 'photos.refusalProof',
    act: 'actPdf',
};

for (const field of REPORT_ACT_FIELDS) {
    const block =
        field.group === 'actDetails'
            ? 'act_details'
            : field.group === 'meterBefore'
              ? 'metering'
              : field.group;
    const name = `${field.group}.${field.name}`;
    REPORT_API_FIELDS[`${block}.${field.api}`] = name;
    const step = REPORT_FORM_STEPS.findIndex((item) =>
        item.fields.includes(field.group)
    );
    REPORT_FIELD_REFERENCES[
        `@${block.toUpperCase()}.${field.api.toUpperCase()}`
    ] = {
        field: name,
        label: field.label,
        step: Math.max(0, step),
        stepLabel: REPORT_FORM_STEPS[step]?.title ?? '',
    };
}

for (const [path, field] of Object.entries(REPORT_API_FIELDS)) {
    const reference = Object.values(REPORT_FIELD_REFERENCES).find(
        (item) => item.field === field
    );
    if (reference)
        REPORT_FIELD_REFERENCES[`@${path.toUpperCase()}`] = reference;
}
