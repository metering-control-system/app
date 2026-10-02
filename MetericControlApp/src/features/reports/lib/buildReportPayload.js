import { createClientReportId } from '@/features/reports/lib/createClientReportId';
import { REPORT_PHOTO_CONFIGS } from '@/features/reports/constants/reportPhotoConfigs';

const toNullableValue = (value) => {
    if (typeof value !== 'string') {
        return value ?? null;
    }

    const trimmedValue = value.trim();

    return trimmedValue ? trimmedValue : null;
};

const toReadingValue = (value) => {
    const normalizedValue = toNullableValue(value);

    if (!normalizedValue) {
        return null;
    }

    return normalizedValue.replace(',', '.');
};

const splitFullName = (fullName) => {
    const normalizedFullName = toNullableValue(fullName);

    if (!normalizedFullName) {
        return { firstName: null, middleName: null, lastName: null };
    }

    const [lastName = null, firstName = null, middleName = null] =
        normalizedFullName.split(/\s+/);

    return { firstName, middleName, lastName };
};

const buildReactNativeFile = (uri, kind) => {
    if (!uri) {
        return null;
    }

    const uriParts = uri.split('.');
    const extension = uriParts.at(-1)?.toLowerCase() || 'jpg';
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
    { includeEmptyOptionalFields = false } = {}
) => {
    const contactNameParts = splitFullName(formValues.consumerContact.fullName);
    const rejectionReason = toNullableValue(
        formValues.admission.rejectionReason
    );
    const actualOldMeterNumber =
        toNullableValue(formValues.meterBefore.actualNumber) ??
        toNullableValue(formValues.meterBefore.number);
    const actualOldMeterType =
        toNullableValue(formValues.meterBefore.actualType) ??
        toNullableValue(formValues.meterBefore.type);

    const payload = {
        ['client_report_id']: formValues.clientReportId,
        ['task_id']: Number(formValues.taskId),
        metering: {
            ['dismantling_completed']: formValues.metering.dismantlingCompleted,
            ['actual_old_meter_number']: actualOldMeterNumber,
            ['actual_old_meter_type']: actualOldMeterType,
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
            ['seal_location']: toNullableValue(
                formValues.metering.sealLocation
            ),
            ['seal_number']: toNullableValue(formValues.metering.sealNumber),
        },
        admission: {
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
                formValues.consumerContact.phoneNumber
            ),
            ['phone_number_2']: toNullableValue(
                formValues.consumerContact.phoneNumber2
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
    const files = REPORT_PHOTO_CONFIGS.flatMap(({ kind, name, fileName }) =>
        normalizePhotoUris(formValues.photos?.[name]).map((uri, index) => {
            const file = buildReactNativeFile(uri, fileName);
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
