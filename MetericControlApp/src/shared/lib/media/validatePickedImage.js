import { File } from 'expo-file-system';
import {
    MAX_PICKED_IMAGE_SIZE_BYTES,
    MAX_PICKED_IMAGE_SIZE_MB,
} from '@/shared/lib/media/imageCompressionSizes';

const getAssetFileSize = async (asset) => {
    if (asset?.fileSize) {
        return asset.fileSize;
    }

    const file = new File(asset.uri);
    const fileInfo = file.info({ size: true });

    if (!fileInfo.exists) {
        return null;
    }

    return fileInfo.size ?? null;
};

export const validatePickedImage = async (asset) => {
    if (!asset?.uri) {
        return 'Не удалось получить изображение из галереи.';
    }

    const fileSize = await getAssetFileSize(asset);

    if (fileSize === null) {
        return 'Не удалось определить размер изображения.';
    }

    if (fileSize > MAX_PICKED_IMAGE_SIZE_BYTES) {
        return `Размер файла не должен превышать ${MAX_PICKED_IMAGE_SIZE_MB} МБ.`;
    }

    return null;
};
