import { transformImage } from '@/shared/lib/media/transformImage';

export const applyPreviewImageRotation = async ({ uri, rotation }) => {
    const normalizedRotation = Number(rotation) % 360;

    if (!normalizedRotation) {
        return uri;
    }

    const result = await transformImage({ uri, rotate: normalizedRotation });

    return result.uri;
};
