import { REPORT_PHOTO_CONFIGS } from '@/features/reports/constants/reportPhotoConfigs';

export const groupReportPhotos = (images = []) =>
    (images ?? []).reduce((groups, photo) => {
        const existingGroup = groups.find(({ kind }) => kind === photo.kind);
        if (existingGroup) {
            existingGroup.photos.push(photo);
        } else {
            const config = REPORT_PHOTO_CONFIGS.find(
                ({ kind }) => kind === photo.kind
            );
            groups.push({
                kind: photo.kind,
                title: config?.title ?? 'Другие фотографии',
                field: `photos.${config?.name}`,
                photos: [photo],
            });
        }
        return groups;
    }, []);
