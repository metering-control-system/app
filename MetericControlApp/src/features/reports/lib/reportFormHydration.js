import { REPORT_PHOTO_SLOT_BY_KIND } from '../constants/reportPhotoConfigs.js';

export const mapReportImagesToForm = (images = []) => {
    const photos = {};
    const photoMetadata = {};

    images.forEach((image) => {
        const slot = REPORT_PHOTO_SLOT_BY_KIND[image.kind];
        if (!slot || !image.url) {
            return;
        }

        photos[slot] ??= [];
        photoMetadata[slot] ??= [];
        photos[slot].push(image.url);
        photoMetadata[slot].push({
            uri: image.url,
            clientImageId: image['client_image_id'] ?? '',
        });
    });

    return { photos, photoMetadata };
};

export const mapReportToFormValues = (report, taskDefaults) => {
    if (!report) {
        return taskDefaults;
    }

    const metering = report.metering ?? {};
    const admission = report.admission ?? {};
    const contact = report['consumer_contact'] ?? {};
    const images = mapReportImagesToForm(report.images);
    const actualNumber = metering['actual_old_meter_number'] ?? '';
    const actualType = metering['actual_old_meter_type'] ?? '';
    const isActualDifferent =
        (actualNumber && actualNumber !== taskDefaults.meterBefore.number) ||
        (actualType && actualType !== taskDefaults.meterBefore.type);

    return {
        ...taskDefaults,
        clientReportId:
            report['client_report_id'] ?? taskDefaults.clientReportId,
        meterBefore: {
            ...taskDefaults.meterBefore,
            actualNumber: isActualDifferent ? actualNumber : '',
            actualType: isActualDifferent ? actualType : '',
            isActualDifferent: Boolean(isActualDifferent),
        },
        metering: {
            ...taskDefaults.metering,
            dismantlingCompleted: metering['dismantling_completed'] ?? false,
            oldReading: metering['removal_reading'] ?? '',
            newMeterType: metering['new_meter_type'] ?? '',
            newMeterNumber: metering['new_meter_number'] ?? '',
            sealLocation: metering['seal_location'] ?? '',
            sealNumber: metering['seal_number'] ?? '',
            installationReading: metering['installation_reading'] ?? '',
        },
        photos: { ...taskDefaults.photos, ...images.photos },
        admission: {
            status: admission.status ?? '',
            rejectionReason: admission['rejection_reason'] ?? '',
            rejectionComment: admission['rejection_comment'] ?? '',
        },
        consumerContact: {
            isRefusedContact: contact['is_refused_contact'] ?? false,
            fullName: contact['full_name'] ?? '',
            phoneNumber: contact['phone_number_1'] ?? '',
            phoneNumber2: contact['phone_number_2'] ?? '',
            email: contact.email ?? '',
        },
    };
};

export const buildReportReplacement = (report, taskDefaults) => ({
    values: mapReportToFormValues(report, taskDefaults),
    photoMetadata: mapReportImagesToForm(report.images ?? []).photoMetadata,
});
