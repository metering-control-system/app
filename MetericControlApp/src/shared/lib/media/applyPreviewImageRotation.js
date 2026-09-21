import { transformImage } from '@/shared/lib/media/transformImage';
import { getPhotoQualityPreset } from '@/features/settings/store/useSettingsStore';

export const applyPreviewImageRotation = async ({ uri, rotation }) => {
    const normalizedRotation = Number(rotation) % 360;

    if (!normalizedRotation) {
        return uri;
    }

    const { compress } = getPhotoQualityPreset();

    const result = await transformImage({
        uri,
        rotate: normalizedRotation,
        compress,
    });

    return result.uri;
};
