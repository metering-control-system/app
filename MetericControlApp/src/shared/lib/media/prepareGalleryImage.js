import { Directory, File, Paths } from 'expo-file-system';
import { randomUUID } from 'expo-crypto';
import { compressCapturedImage } from '@/shared/lib/media/compressCapturedImage';

export const prepareGalleryImage = async (uri) => {
    const processedUri = await compressCapturedImage(uri);
    const directory = new Directory(Paths.document, 'gallery-photos');
    directory.create({ intermediates: true, idempotent: true });
    const file = new File(directory, `${randomUUID()}.jpg`);
    new File(processedUri).copy(file);
    return file;
};
