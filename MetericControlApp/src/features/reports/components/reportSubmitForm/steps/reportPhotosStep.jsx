import { buildReportImageFile } from '@/features/reports/lib/buildReportPayload';
import {
    REPORT_IMAGE_MAX_BYTES,
    validateReportPhoto,
} from '@/features/reports/lib/validateReportUploadFiles';
import { Text, View, StyleSheet } from 'react-native';
import { HighlightWrap } from '@/shared/components/wrapper/highlightWrapper';
import MediaBlock from '@/shared/components/media/mediaBlock';
import { REPORT_PHOTO_CONFIGS } from '@/features/reports/constants/reportPhotoConfigs';
import {
    ReportFormSection,
    ReportFieldLayout,
} from '@/features/reports/components/reportFormLayout';

export const ReportPhotoField = ({
    photoField,
    reportPhotos,
    isActualMeterDifferent,
    reportPhotoMetadata,
    existingReport,
    onError,
    addRemovedPhotoId,
    id,
    fillPositions,
    highlightedField,
    router,
    appendPhoto,
    setValue,
    updatePhoto,
    removePhotoAt,
    isEditingDisabled,
    errors,
    renderRemark,
}) => {
    const uris = Array.isArray(reportPhotos?.[photoField.name])
        ? reportPhotos[photoField.name]
        : reportPhotos?.[photoField.name]
          ? [reportPhotos[photoField.name]]
          : [];
    const title =
        photoField.name === 'oldMeter' && isActualMeterDifferent
            ? 'Фото текущего счетчика'
            : photoField.title;
    const photoFieldName = `photos.${photoField.name}`;
    const markExistingPhotoRemoved = (uri) => {
        const metadata = reportPhotoMetadata[photoField.name];
        const clientImageId = metadata?.find(
            (entry) => entry.uri === uri
        )?.clientImageId;
        if (!clientImageId) {
            if (existingReport?.images?.some((image) => image.url === uri)) {
                onError(
                    'Не удалось удалить фото',
                    'Не удалось обновить это фото. Загрузите отчёт бригады заново и повторите попытку.'
                );
                return false;
            }
            return true;
        }
        addRemovedPhotoId({ entity: 'report', entityId: id, clientImageId });
        return true;
    };
    return (
        <ReportFieldLayout
            key={photoField.name}
            name={photoFieldName}
            fillPositions={fillPositions}>
            <HighlightWrap isActive={highlightedField === photoFieldName}>
                <ReportFormSection
                    title={title}
                    icon='camera-outline'
                    description={
                        uris.length
                            ? `Добавлено фото: ${uris.length}`
                            : 'Сделайте снимок или выберите фото из галереи.'
                    }>
                    <MediaBlock
                        onError={onError}
                        uris={uris}
                        maxSizeBytes={REPORT_IMAGE_MAX_BYTES}
                        handleOpenCamera={() => {
                            router.push({
                                pathname: '/(authorized)/camera',
                                params: {
                                    action: 'reports',
                                    id,
                                    slot: photoField.name,
                                },
                            });
                        }}
                        handleUploadPhoto={async (uriValue) => {
                            try {
                                await validateReportPhoto(
                                    buildReportImageFile(
                                        uriValue,
                                        photoField.fileName
                                    ),
                                    ['photos', photoField.name]
                                );
                            } catch (error) {
                                onError(
                                    'Некорректная фотография',
                                    error.message
                                );
                                return;
                            }
                            appendPhoto({
                                entity: 'report',
                                entityId: id,
                                slot: photoField.name,
                                uri: uriValue,
                            });
                            setValue(
                                `photos.${photoField.name}`,
                                [...uris, uriValue],
                                { shouldDirty: true, shouldValidate: true }
                            );
                        }}
                        handleUpdatePhoto={(uriValue, index) => {
                            if (!markExistingPhotoRemoved(uris[index])) {
                                return;
                            }
                            updatePhoto({
                                entity: 'report',
                                entityId: id,
                                slot: photoField.name,
                                index,
                                uri: uriValue,
                            });
                            const nextUris = [...uris];
                            nextUris[index] = uriValue;
                            setValue(`photos.${photoField.name}`, nextUris, {
                                shouldDirty: true,
                                shouldValidate: true,
                            });
                        }}
                        handleDeletePhoto={(index) => {
                            if (!markExistingPhotoRemoved(uris[index])) {
                                return;
                            }
                            removePhotoAt({
                                entity: 'report',
                                entityId: id,
                                slot: photoField.name,
                                index,
                            });
                            setValue(
                                `photos.${photoField.name}`,
                                uris.filter(
                                    (_, uriIndex) => uriIndex !== index
                                ),
                                { shouldDirty: true, shouldValidate: true }
                            );
                        }}
                        disabled={isEditingDisabled}
                    />
                    {errors.photos?.[photoField.name]?.message && (
                        <Text style={styles.errorText}>
                            {errors.photos[photoField.name].message}
                        </Text>
                    )}
                    {renderRemark(photoFieldName)}
                </ReportFormSection>
            </HighlightWrap>
        </ReportFieldLayout>
    );
};

export const ReportPhotosStep = ({
    reportPhotos,
    isActualMeterDifferent,
    reportPhotoMetadata,
    existingReport,
    onError,
    addRemovedPhotoId,
    id,
    fillPositions,
    highlightedField,
    router,
    appendPhoto,
    setValue,
    updatePhoto,
    removePhotoAt,
    isEditingDisabled,
    errors,
    renderRemark,
}) => {
    const fieldProps = {
        fillPositions,
        highlightedField,
        isEditingDisabled,
        renderRemark,
    };
    return (
        <View style={styles.sectionList}>
            {REPORT_PHOTO_CONFIGS.map((photoField) => (
                <ReportPhotoField
                    {...fieldProps}
                    key={photoField.name}
                    photoField={photoField}
                    reportPhotos={reportPhotos}
                    isActualMeterDifferent={isActualMeterDifferent}
                    reportPhotoMetadata={reportPhotoMetadata}
                    existingReport={existingReport}
                    onError={onError}
                    addRemovedPhotoId={addRemovedPhotoId}
                    id={id}
                    router={router}
                    appendPhoto={appendPhoto}
                    setValue={setValue}
                    updatePhoto={updatePhoto}
                    removePhotoAt={removePhotoAt}
                    errors={errors}
                />
            ))}
            {errors.photos?.message && (
                <Text style={styles.errorText}>{errors.photos.message}</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    sectionList: { gap: 16 },
    errorText: {
        marginTop: 6,
        marginBottom: 8,
        fontSize: 13,
        lineHeight: 18,
        color: '#c84343',
    },
});
