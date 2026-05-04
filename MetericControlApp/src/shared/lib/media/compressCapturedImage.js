import { CAMERA_IMAGE_COMPRESSION } from '@/shared/lib/media/imageCompressionSizes';
import { transformImage } from '@/shared/lib/media/transformImage';

export const compressCapturedImage = async (uri) => {
    const result = await transformImage({
        uri,
        compress: CAMERA_IMAGE_COMPRESSION,
    });

    return result.uri;
};
