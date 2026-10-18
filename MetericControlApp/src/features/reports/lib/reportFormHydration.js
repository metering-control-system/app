import { mapTaskToReportDefaults } from './mapTaskToReportDefaults.js';
import { reportSubmitFormDefaultValues } from '../constants/reportSubmitFormDefaults.js';
import { areObjectsEqual } from '../../../shared/lib/collections/areObjectsEqual.js';
import { REPORT_PHOTO_SLOT_BY_KIND } from '../constants/reportPhotoConfigs.js';
import { hydrateReportActFields } from './reportActFieldValues.js';

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
    const actFields = hydrateReportActFields(report);
    const images = mapReportImagesToForm(report.images);
    const actualNumber = metering['actual_old_meter_number'] ?? '';
    const actualType = metering['actual_old_meter_type'] ?? '';
    const isActualDifferent =
        (Object.hasOwn(metering, 'actual_old_meter_number') &&
            actualNumber !== taskDefaults.meterBefore.number) ||
        (Object.hasOwn(metering, 'actual_old_meter_type') &&
            actualType !== taskDefaults.meterBefore.type);

    return {
        ...taskDefaults,
        clientReportId:
            report['client_report_id'] ?? taskDefaults.clientReportId,
        actDetails: actFields.actDetails,
        meterBefore: {
            ...taskDefaults.meterBefore,
            ...actFields.meterBefore,
            actualNumber: isActualDifferent ? actualNumber : '',
            actualType: isActualDifferent ? actualType : '',
            isActualDifferent: Boolean(isActualDifferent),
        },
        metering: {
            ...taskDefaults.metering,
            ...actFields.metering,
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
            ...actFields.admission,
            status: admission.status ?? '',
            rejectionReason: admission['rejection_reason'] ?? '',
            rejectionComment: admission['rejection_comment'] ?? '',
        },
        consumerContact: {
            isRefusedContact: contact['is_refused_contact'] ?? false,
            fullName: ['last_name', 'first_name', 'middle_name'].some((key) =>
                Object.hasOwn(contact, key)
            )
                ? [
                      contact['last_name'],
                      contact['first_name'],
                      contact['middle_name'],
                  ]
                      .filter(Boolean)
                      .join(' ')
                : (contact['full_name'] ?? ''),
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

export const getReportFormInitialValues = ({
    draftValues,
    existingReport,
    task,
    savedAct,
}) => {
    const taskDefaults = mapReportToFormValues(
        task?.is_team_task ? null : existingReport,
        mapTaskToReportDefaults(task)
    );
    const draftFormValues = draftValues ? { ...draftValues } : null;
    if (draftFormValues) {
        delete draftFormValues.photoMetadata;
        delete draftFormValues.removedPhotoIds;
        delete draftFormValues.act;
        delete draftFormValues.address;
    }
    return {
        ...taskDefaults,
        ...draftFormValues,
        address: taskDefaults.address,
        actDetails: {
            ...taskDefaults.actDetails,
            ...draftFormValues?.actDetails,
        },
        meterBefore: {
            ...taskDefaults.meterBefore,
            ...draftFormValues?.meterBefore,
        },
        metering: { ...taskDefaults.metering, ...draftFormValues?.metering },
        photos: { ...taskDefaults.photos, ...draftFormValues?.photos },
        admission: { ...taskDefaults.admission, ...draftFormValues?.admission },
        consumerContact: {
            ...taskDefaults.consumerContact,
            ...draftFormValues?.consumerContact,
        },
        actPdf: {
            ...reportSubmitFormDefaultValues.actPdf,
            ...draftValues?.actPdf,
            signatures: savedAct?.signatures ?? {},
            checksum: savedAct?.checksum,
            templateId: savedAct?.templateId,
            uri:
                savedAct?.checksum &&
                savedAct.checksum === draftValues?.actPdf?.checksum &&
                areObjectsEqual(
                    savedAct.signatures,
                    draftValues?.actPdf?.signatures ?? {}
                )
                    ? (draftValues?.actPdf?.uri ?? '')
                    : '',
        },
    };
};
