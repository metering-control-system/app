import { getPhotoQualityPreset } from '@/features/settings/store/useSettingsStore';
import { transformImage } from '@/shared/lib/media/transformImage';

export const compressCapturedImage = async (uri) => {
    const { compress, maxWidth } = getPhotoQualityPreset();

    const result = await transformImage({ uri, compress, maxWidth });

    return result.uri;
};
