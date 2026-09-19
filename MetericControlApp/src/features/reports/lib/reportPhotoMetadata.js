import { REPORT_PHOTO_SLOTS } from '../constants/reportPhotoConfigs.js';

export { REPORT_PHOTO_SLOTS };

const normalizeUris = (value) => {
    if (Array.isArray(value)) {
        return value.filter(Boolean);
    }

    return value ? [value] : [];
};

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
