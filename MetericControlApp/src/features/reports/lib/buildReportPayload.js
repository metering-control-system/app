import { createClientReportId } from './createClientReportId.js';
import { REPORT_PHOTO_CONFIGS } from '../constants/reportPhotoConfigs.js';
import { buildReportActFieldsPayload } from './reportActFieldValues.js';
import { normalizeReportPhone } from './reportContactValidation.js';
import { splitReportContactName } from './reportContactValues.js';

const toNullableValue = (value) => {
    if (typeof value !== 'string') {
        return value ?? null;
    }

    const trimmedValue = value.trim();

    return trimmedValue ? trimmedValue : null;
};

const toReadingValue = (value) => {
    const normalizedValue = toNullableValue(value);

    if (normalizedValue === null) {
        return null;
    }

    return String(normalizedValue).replace(',', '.');
};

export const buildReportImageFile = (uri, kind) => {
    if (!uri) {
        return null;
    }

    const extension =
        uri
            .split(/[?#]/)[0]
            .match(/\.([a-z0-9]+)$/i)?.[1]
            ?.toLowerCase() ?? 'jpg';
    const normalizedExtension = extension === 'jpg' ? 'jpeg' : extension;

    return {
        uri,
        name: `${kind.toLowerCase()}.${extension}`,
        type: `image/${normalizedExtension}`,
    };
};

const normalizePhotoUris = (value) => {
    if (Array.isArray(value)) {
        return value.filter(Boolean);
    }

    if (!value) {
        return [];
    }

    return [value];
};

export const buildReportPayload = (
    formValues,
    { includeEmptyOptionalFields = false, signaturePayload = {} } = {}
) => {
    const contactNameParts = splitReportContactName(
        formValues.consumerContact.fullName
    );
    const rejectionReason = toNullableValue(
        formValues.admission.rejectionReason
    );
    const actFields = buildReportActFieldsPayload(formValues);
    const actualOldMeterNumber = formValues.meterBefore.isActualDifferent
        ? toNullableValue(formValues.meterBefore.actualNumber)
        : (toNullableValue(formValues.meterBefore.actualNumber) ??
          toNullableValue(formValues.meterBefore.number));
    const actualOldMeterType = formValues.meterBefore.isActualDifferent
        ? toNullableValue(formValues.meterBefore.actualType)
        : (toNullableValue(formValues.meterBefore.actualType) ??
          toNullableValue(formValues.meterBefore.type));

    const payload = {
        ...(formValues.clientReportId?.trim() && {
            ['client_report_id']: formValues.clientReportId.trim(),
        }),
        ['task_id']: Number(formValues.taskId),
        ['act_details']: { ...actFields['act_details'], ...signaturePayload },
        metering: {
            ...actFields.metering,
            ['dismantling_completed']: formValues.metering.dismantlingCompleted,
            ['actual_old_meter_number']: actualOldMeterNumber ?? '',
            ['actual_old_meter_type']: actualOldMeterType ?? '',
            ['new_meter_number']: toNullableValue(
                formValues.metering.newMeterNumber
            ),
            ['new_meter_type']: toNullableValue(
                formValues.metering.newMeterType
            ),
            ['removal_reading']: toReadingValue(formValues.metering.oldReading),
            ['installation_reading']: toReadingValue(
                formValues.metering.installationReading
            ),
            ['seal_location']:
                toNullableValue(formValues.metering.sealLocation) ?? '',
            ['seal_number']:
                toNullableValue(formValues.metering.sealNumber) ?? '',
        },
        admission: {
            ...actFields.admission,
            status: toNullableValue(formValues.admission.status),
            ['rejection_reason']: rejectionReason,
            ['rejection_comment']: toNullableValue(
                formValues.admission.rejectionComment
            ),
        },
        ['consumer_contact']: {
            ['is_refused_contact']: formValues.consumerContact.isRefusedContact,
            ['first_name']: contactNameParts.firstName,
            ['middle_name']: contactNameParts.middleName,
            ['last_name']: contactNameParts.lastName,
            ['phone_number_1']: toNullableValue(
                normalizeReportPhone(formValues.consumerContact.phoneNumber)
            ),
            ['phone_number_2']: toNullableValue(
                normalizeReportPhone(formValues.consumerContact.phoneNumber2)
            ),
            email: toNullableValue(formValues.consumerContact.email),
        },
    };

    if (
        !includeEmptyOptionalFields &&
        !payload.consumer_contact.phone_number_2
    ) {
        delete payload.consumer_contact.phone_number_2;
    }

    if (includeEmptyOptionalFields && !payload.admission['rejection_reason']) {
        payload.admission['rejection_reason'] = '';
    } else if (!payload.admission['rejection_reason']) {
        delete payload.admission.rejection_reason;
    }

    if (includeEmptyOptionalFields && !payload.admission['rejection_comment']) {
        payload.admission['rejection_comment'] = '';
    } else if (!payload.admission['rejection_comment']) {
        delete payload.admission.rejection_comment;
    }

    return payload;
};

export const buildReportCommentPayload = (formValues) => {
    const comment = toNullableValue(formValues.comment);

    if (!comment) {
        return null;
    }

    return { content: comment };
};

export const buildReportImagesPayload = (
    formValues,
    existingImages = [],
    photoMetadata = {}
) => {
    const existingImageIds = new Set(
        existingImages
            .map((image) => image?.['client_image_id'])
            .filter(Boolean)
    );
    const existingImageUrls = new Set(
        existingImages.map((image) => image?.url).filter(Boolean)
    );
    const files = REPORT_PHOTO_CONFIGS.flatMap(({ kind, name, fileName }) =>
        normalizePhotoUris(formValues.photos?.[name]).map((uri, index) => {
            if (existingImageUrls.has(uri)) return null;
            const file = buildReportImageFile(uri, fileName);
            const metadata = photoMetadata[name]?.[index];
            const clientImageId =
                metadata?.uri === uri ? metadata.clientImageId : null;

            if (
                !file ||
                !clientImageId ||
                existingImageIds.has(clientImageId)
            ) {
                return null;
            }

            if (/^https?:\/\//i.test(uri)) {
                throw Object.assign(
                    new Error(
                        'Фотография с сервера больше не найдена в отчёте. Загрузите актуальный отчёт или добавьте фотографию заново.'
                    ),
                    { code: 'REPORT_PHOTO_UNAVAILABLE' }
                );
            }

            const fileKey = `${fileName}_${index + 1}`;

            return {
                fileKey,
                file,
                image: {
                    ['file_key']: fileKey,
                    kind,
                    ['file_name']: file.name,
                    ['client_image_id']: clientImageId,
                },
            };
        })
    ).filter(Boolean);

    if (!files.length) {
        return null;
    }

    return {
        images: files.map(({ image }) => image),
        files: files.map(({ fileKey, file }) => ({ fileKey, file })),
    };
};

export const getRemovedReportImageIds = ({
    photos = {},
    photoMetadata = {},
    removedPhotoIds = [],
    existingImages = [],
}) => {
    const existingIds = new Set(
        existingImages
            .map((image) => image?.['client_image_id'])
            .filter(Boolean)
    );
    const retainedIds = new Set(
        Object.entries(photos).flatMap(([slot, uris]) =>
            normalizePhotoUris(uris)
                .map(
                    (uri) =>
                        photoMetadata[slot]?.find((entry) => entry.uri === uri)
                            ?.clientImageId
                )
                .filter(Boolean)
        )
    );

    return [...new Set(removedPhotoIds)].filter(
        (id) => existingIds.has(id) && !retainedIds.has(id)
    );
};

export const buildReportPdfActPayload = (formValues, serverClientActId) => {
    const uri = formValues.actPdf?.uri;
    const uniqueFileId = serverClientActId || createClientReportId();
    if (!uri) {
        return null;
    }

    return {
        uri: uri,
        name: 'act.pdf',
        type: 'application/pdf',
        ['client_act_id']: uniqueFileId,
    };
};
