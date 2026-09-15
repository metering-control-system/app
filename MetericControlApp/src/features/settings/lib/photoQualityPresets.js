export const PHOTO_QUALITY = { LOW: 'LOW', MEDIUM: 'MEDIUM', HIGH: 'HIGH' };

export const PHOTO_QUALITY_PRESETS = {
    [PHOTO_QUALITY.LOW]: {
        label: 'Низкое (быстрая загрузка)',
        compress: 0.4,
        maxWidth: 1080,
    },
    [PHOTO_QUALITY.MEDIUM]: {
        label: 'Среднее',
        compress: 0.72,
        maxWidth: 1440,
    },
    [PHOTO_QUALITY.HIGH]: {
        label: 'Высокое (большой размер файла)',
        compress: 0.9,
        maxWidth: 2560,
    },
};

export const DEFAULT_PHOTO_QUALITY = PHOTO_QUALITY.MEDIUM;
