import { REPORT_PHOTO_SLOTS } from '@/features/reports/constants/reportPhotoConfigs';

export { REPORT_PHOTO_SLOTS };

const normalizeUris = (value) => {
    if (Array.isArray(value)) {
        return value.filter(Boolean);
    }

    return value ? [value] : [];
};

const normalizeMetadataEntries = (value) =>
    Array.isArray(value) ? value.filter((entry) => entry?.uri) : [];

export const mergeReportPhotoMetadata = ({ serverMetadata, localMetadata }) =>
    REPORT_PHOTO_SLOTS.reduce((result, slot) => {
        const serverEntries = normalizeMetadataEntries(serverMetadata?.[slot]);
        const localEntries = normalizeMetadataEntries(localMetadata?.[slot]);
        const entriesByUri = new Map(
            localEntries.map((entry) => [entry.uri, entry])
        );

        serverEntries.forEach((entry) => entriesByUri.set(entry.uri, entry));

        const orderedUris = [
            ...serverEntries.map((entry) => entry.uri),
            ...localEntries.map((entry) => entry.uri),
        ];

        result[slot] = [...new Set(orderedUris)].map((uri) =>
            entriesByUri.get(uri)
        );

        return result;
    }, {});

export const prepareReportPhotoMetadata = ({
    photos,
    photoMetadata,
    createId,
}) =>
    REPORT_PHOTO_SLOTS.reduce((result, slot) => {
        const previousEntries = Array.isArray(photoMetadata?.[slot])
            ? photoMetadata[slot]
            : [];
        const usedEntryIndexes = new Set();

        result[slot] = normalizeUris(photos?.[slot]).map((uri) => {
            const previousIndex = previousEntries.findIndex(
                (entry, index) =>
                    !usedEntryIndexes.has(index) &&
                    entry?.uri === uri &&
                    entry?.clientImageId
            );

            if (previousIndex >= 0) {
                usedEntryIndexes.add(previousIndex);
                return previousEntries[previousIndex];
            }

            return { uri, clientImageId: createId() };
        });

        return result;
    }, {});
