import { File } from 'expo-file-system';

export const ensureUploadFileExists = (uri, message) => {
    if (!uri?.startsWith('file://')) return;
    let exists = false;
    try {
        exists = new File(uri).exists;
    } catch {
        exists = false;
    }
    if (!exists) {
        throw Object.assign(new Error(message), {
            code: 'UPLOAD_FILE_UNAVAILABLE',
        });
    }
};
