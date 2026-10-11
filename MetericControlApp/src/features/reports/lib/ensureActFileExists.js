import { File } from 'expo-file-system';

export const ensureActFileExists = (uri) => {
    let exists = false;
    try {
        exists = Boolean(uri && new File(uri).exists);
    } catch {
        exists = false;
    }
    if (!exists)
        throw new Error('Файл акта не найден. Сгенерируйте акт заново.');
};
