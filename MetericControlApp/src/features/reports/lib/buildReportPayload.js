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

const createClientImageId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
        const random = Math.floor(Math.random() * 16);
        const value = char === 'x' ? random : (random & 0x3) | 0x8;

        return value.toString(16);
    });
};

export const buildReportPayload = (formValues) => {
    const contactNameParts = splitFullName(formValues.consumerContact.fullName);
    const rejectionReason = toNullableValue(
        formValues.admission.rejectionReason
    );

    const payload = {
        ['client_report_id']: formValues.clientReportId,
        ['task_id']: Number(formValues.taskId),
        metering: {
            ['dismantling_completed']: formValues.metering.dismantlingCompleted,
            ['actual_old_meter_number']: toNullableValue(
                formValues.meterBefore.actualNumber
            ),
            ['actual_old_meter_type']: toNullableValue(
                formValues.meterBefore.actualType
            ),
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

    if (!payload.consumer_contact.phone_number_2) {
        delete payload.consumer_contact.phone_number_2;
    }

    if (!payload.admission.rejection_reason) {
        delete payload.admission.rejection_reason;
    }

    if (!payload.admission.rejection_comment) {
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

export const buildReportImagesPayload = (formValues) => {
    const photoConfigs = [
        { kind: 'OLD_METER', slot: 'oldMeter', fileName: 'old_meter' },
        { kind: 'SEAL', slot: 'seal', fileName: 'seal' },
        { kind: 'FRONT_PANEL', slot: 'frontPanel', fileName: 'front_panel' },
        { kind: 'GENERAL_VIEW', slot: 'generalView', fileName: 'general_view' },
        { kind: 'ACT_PAPER', slot: 'actPaper', fileName: 'act_paper' },
        {
            kind: 'REFUSAL_PROOF',
            slot: 'refusalProof',
            fileName: 'refusal_proof',
        },
    ];

    const files = photoConfigs
        .flatMap(({ kind, slot, fileName }) =>
            normalizePhotoUris(formValues.photos?.[slot]).map((uri, index) => {
                const file = buildReactNativeFile(uri, fileName);

                if (!file) {
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
                        ['client_image_id']: createClientImageId(),
                    },
                };
            })
        )
        .filter(Boolean);

    if (!files.length) {
        return null;
    }

    return {
        images: files.map(({ image }) => image),
        files: files.map(({ fileKey, file }) => ({ fileKey, file })),
    };
};
