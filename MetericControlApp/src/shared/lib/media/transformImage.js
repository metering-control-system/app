import { ImageManipulator } from 'expo-image-manipulator';

export const transformImage = async ({ uri, rotate = 0, compress = 1 }) => {
    if (!uri) {
        throw new Error('Не удалось обработать изображение: отсутствует uri.');
    }

    const context = ImageManipulator.manipulate(uri);

    if (rotate) {
        context.rotate(rotate);
    }

    const renderedImage = await context.renderAsync();

    return renderedImage.saveAsync({
        compress,
        format: ImageManipulator.SaveFormat.JPEG,
    });
};
