import { File } from 'expo-file-system';
import { Image } from 'react-native';
import { z } from 'zod';
import { REPORT_PHOTO_SLOT_BY_KIND } from '@/features/reports/constants/reportPhotoConfigs';
import { createReportValidationError } from '@/features/reports/lib/reportValidationError';

export const REPORT_IMAGE_MAX_BYTES = 20 * 1024 * 1024;
const REQUEST_MAX_BYTES = 50 * 1024 * 1024;
const fail = (path, message) => {
    throw createReportValidationError([{ path, message }]);
};
const startsWith = (bytes, prefix) =>
    prefix.every((value, index) => bytes[index] === value);
const isImageHeader = (bytes) =>
    startsWith(bytes, [255, 216, 255]) ||
    startsWith(bytes, [137, 80, 78, 71, 13, 10, 26, 10]) ||
    (startsWith(bytes, [82, 73, 70, 70]) &&
        startsWith(bytes.slice(8), [87, 69, 66, 80]));

const readFile = (uri, path, maxBytes, sizeMessage) => {
    let handle;
    try {
        const file = new File(uri);
        if (!file.exists) fail(path, 'Файл не найден на устройстве');
        const size = file.size;
        if (!Number.isFinite(size) || size <= 0)
            fail(path, 'Файл пустой или недоступен');
        if (size > maxBytes) fail(path, sizeMessage);
        handle = file.open();
        return { size, header: handle.readBytes(Math.min(size, 16)) };
    } catch (error) {
        if (error.code === 'REPORT_VALIDATION_ERROR') throw error;
        fail(path, 'Не удалось прочитать файл на устройстве');
    } finally {
        handle?.close();
    }
};

export const validateReportPhoto = async (file, path) => {
    if (file.name.length > 100 || !/\.(jpe?g|png|webp)$/i.test(file.name))
        fail(path, 'Фотография должна быть в формате JPEG, PNG или WebP');
    const { size, header } = readFile(
        file.uri,
        path,
        REPORT_IMAGE_MAX_BYTES,
        'Размер фотографии не должен превышать 20 МБ'
    );
    if (!isImageHeader(header))
        fail(path, 'Фотография должна быть в формате JPEG, PNG или WebP');
    try {
        const { width, height } = await Image.getSize(file.uri);
        if (!(width > 0 && height > 0)) throw new Error('Invalid image');
    } catch {
        fail(path, 'Не удалось открыть фотографию: файл повреждён');
    }
    return size;
};

export const validateReportUploadFiles = async ({
    imagesPayload,
    actPayload,
    isExistingAct = false,
    offline = false,
}) => {
    let totalImageBytes = 0;
    for (const { fileKey, file } of imagesPayload?.files ?? []) {
        const image = imagesPayload.images.find(
            (image) => image.file_key === fileKey
        );
        const path = [
            'photos',
            REPORT_PHOTO_SLOT_BY_KIND[image?.kind] ?? 'root',
        ];
        if (!image || !z.guid().safeParse(image.client_image_id).success)
            fail(path, 'Некорректный идентификатор фотографии');
        if (offline && /^https?:\/\//i.test(file.uri)) continue;
        const size = await validateReportPhoto(file, path);
        totalImageBytes += size;
    }
    if (totalImageBytes > REQUEST_MAX_BYTES)
        fail(['photos'], 'Общий размер фотографий превышает 50 МБ');
    if (!actPayload) return;
    const path = ['actPdf', 'uri'];
    if (!isExistingAct && !z.guid().safeParse(actPayload.client_act_id).success)
        fail(path, 'Некорректный идентификатор акта');
    if (!/\.pdf$/i.test(actPayload.name))
        fail(path, 'Акт должен быть в формате PDF');
    const { header } = readFile(
        actPayload.uri,
        path,
        REQUEST_MAX_BYTES,
        'Размер запроса с актом превышает 50 МБ'
    );
    if (!startsWith(header, [37, 80, 68, 70, 45]))
        fail(path, 'Акт должен быть в формате PDF');
};
