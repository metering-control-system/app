const fillEmpty = (local, server, path = '') => {
    if (local == null || (typeof local === 'string' && !local.trim())) {
        return server ?? local;
    }
    if (typeof local === 'boolean')
        return [
            'admission.isCompliant',
            'admission.isSmartSystemConnected',
        ].includes(path)
            ? local
            : local || server === true;
    if (Array.isArray(local)) return local.length ? local : (server ?? local);
    if (typeof local !== 'object') return local;
    return Object.fromEntries(
        [...new Set([...Object.keys(local), ...Object.keys(server ?? {})])].map(
            (key) => [
                key,
                fillEmpty(
                    local[key],
                    server?.[key],
                    path ? `${path}.${key}` : key
                ),
            ]
        )
    );
};

export const fillEmptyReportFields = ({
    currentValues,
    replacement,
    localPhotoMetadata,
    removedPhotoIds = [],
}) => {
    const values = fillEmpty(currentValues, replacement.values);
    delete values.reportState;
    delete values.submissionReport;
    delete values.photoMetadata;
    delete values.removedPhotoIds;
    const photoMetadata = Object.fromEntries(
        Object.keys(values.photos).map((slot) => [
            slot,
            currentValues.photos?.[slot]?.length
                ? (localPhotoMetadata?.[slot] ?? [])
                : (replacement.photoMetadata[slot] ?? []),
        ])
    );
    const restoredIds = new Set(
        Object.values(photoMetadata)
            .flat()
            .map((entry) => entry.clientImageId)
    );
    return {
        values,
        photoMetadata,
        removedPhotoIds: removedPhotoIds.filter((id) => !restoredIds.has(id)),
    };
};
