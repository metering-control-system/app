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

    const comment = toNullableValue(formValues.comment);

    if (comment) {
        payload.comment = comment;
    }

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
