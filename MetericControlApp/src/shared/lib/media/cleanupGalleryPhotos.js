import { Directory, File, Paths } from 'expo-file-system';
import { normalizePhotos } from '@/shared/lib/media/normalizePhotos';

const collectPhotoUris = (photos) =>
    new Set(
        Object.values(photos ?? {}).flatMap((entities) =>
            Object.values(entities ?? {}).flatMap((slots) =>
                Object.values(slots ?? {}).flatMap(normalizePhotos)
            )
        )
    );

export const cleanupGalleryPhotos = (previousPhotos, currentPhotos) => {
    const currentUris = collectPhotoUris(currentPhotos);
    let directoryUri;
    try {
        directoryUri = new Directory(Paths.document, 'gallery-photos').uri;
    } catch {
        return;
    }
    const prefix = `${directoryUri.replace(/\/$/, '')}/`;
    for (const uri of collectPhotoUris(previousPhotos)) {
        if (
            currentUris.has(uri) ||
            typeof uri !== 'string' ||
            !uri.startsWith(prefix)
        )
            continue;
        const name = uri.slice(prefix.length);
        if (!/^[\w-]+\.jpg$/i.test(name)) continue;
        try {
            const file = new File(uri);
            if (file.exists) file.delete();
        } catch {
            continue;
        }
    }
};
