import {
    MAX_PICKED_IMAGE_SIZE_BYTES,
    MAX_PICKED_IMAGE_SIZE_MB,
} from '@/shared/lib/media/imageCompressionSizes';

export const validatePickedImage = (asset) => {
    if (!asset?.uri) {
        return 'Не удалось получить изображение из галереи.';
    }

    if (asset.fileSize && asset.fileSize > MAX_PICKED_IMAGE_SIZE_BYTES) {
        return `Размер файла не должен превышать ${MAX_PICKED_IMAGE_SIZE_MB} МБ.`;
    }

    return null;
};
