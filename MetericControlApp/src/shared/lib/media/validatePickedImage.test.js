import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';
const loader = registerHooks({
    resolve(specifier, context, nextResolve) {
        if (specifier === 'expo-file-system')
            return {
                url: 'data:text/javascript,export class File {}',
                shortCircuit: true,
            };
        if (specifier === '@/shared/lib/media/imageCompressionSizes')
            return {
                url: new URL('./imageCompressionSizes.js', import.meta.url)
                    .href,
                shortCircuit: true,
            };
        return nextResolve(specifier, context);
    },
});
const { validatePickedImage } = await import('./validatePickedImage.js');
loader.deregister();

test('gallery preserves its default limit while allowing the report-specific 20 MB limit', async () => {
    const asset = { uri: 'file:///photo.jpg', fileSize: 15 * 1024 * 1024 };
    assert.match(await validatePickedImage(asset), /10 МБ/);
    assert.equal(await validatePickedImage(asset, 20 * 1024 * 1024), null);
    asset.fileSize = 20 * 1024 * 1024;
    assert.equal(await validatePickedImage(asset, 20 * 1024 * 1024), null);
    asset.fileSize++;
    assert.match(await validatePickedImage(asset, 20 * 1024 * 1024), /20 МБ/);
});
