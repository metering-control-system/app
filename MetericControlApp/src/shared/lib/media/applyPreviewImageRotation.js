import { transformImage } from '@/shared/lib/media/transformImage';
import { CAMERA_IMAGE_COMPRESSION } from '@/shared/lib/media/imageCompressionSizes';

export const applyPreviewImageRotation = async ({ uri, rotation }) => {
    const normalizedRotation = Number(rotation) % 360;

    if (!normalizedRotation) {
        return uri;
    }

    const result = await transformImage({
        uri,
        rotate: normalizedRotation,
        compress: CAMERA_IMAGE_COMPRESSION,
    });

    return result.uri;
};
