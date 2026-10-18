import { useEffect } from 'react';
import { mergeReportPhotoMetadata } from '@/features/reports/lib/reportPhotoMetadata';

const useReportFormHydration = ({
    hydratedDraftIdRef,
    draftId,
    initialValues,
    isReadOnly,
    signatureResult,
    clearSignatureResult,
    hydratedPhotosIdRef,
    reportPhotos,
    setPhoto,
    id,
    setEntityPhotoMetadata,
    initialPhotoMetadata,
    reportPhotoMetadata,
    form,
}) => {
    const { reset, setValue } = form;
    useEffect(() => {
        if (hydratedDraftIdRef.current === draftId) {
            return;
        }
        reset(initialValues);
        hydratedDraftIdRef.current = draftId;
    }, [draftId, initialValues, reset, hydratedDraftIdRef]);
    useEffect(() => {
        if (isReadOnly || signatureResult?.taskId !== draftId) return;
        setValue('actPdf', signatureResult.actPdf, {
            shouldDirty: true,
            shouldValidate: true,
        });
        clearSignatureResult();
    }, [signatureResult, draftId, setValue, clearSignatureResult, isReadOnly]);
    useEffect(() => {
        if (hydratedPhotosIdRef.current === draftId) {
            return;
        }
        Object.entries(initialValues.photos).forEach(([slot, uris]) => {
            const localUris = Array.isArray(reportPhotos[slot])
                ? reportPhotos[slot]
                : reportPhotos[slot]
                  ? [reportPhotos[slot]]
                  : [];
            const mergedUris = [
                ...uris,
                ...localUris.filter((uri) => !uris.includes(uri)),
            ];
            if (
                mergedUris.length &&
                mergedUris.some((uri, index) => uri !== localUris[index])
            ) {
                setPhoto({
                    entity: 'report',
                    entityId: id,
                    slot,
                    uri: mergedUris,
                });
            }
        });
        setEntityPhotoMetadata({
            entity: 'report',
            entityId: id,
            photoMetadata: mergeReportPhotoMetadata({
                serverMetadata: initialPhotoMetadata,
                localMetadata: reportPhotoMetadata,
            }),
        });
        hydratedPhotosIdRef.current = draftId;
    }, [
        draftId,
        id,
        initialPhotoMetadata,
        initialValues.photos,
        reportPhotoMetadata,
        reportPhotos,
        setEntityPhotoMetadata,
        setPhoto,
        hydratedPhotosIdRef,
    ]);
};
export default useReportFormHydration;
