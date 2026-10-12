import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';
import { buildReportImageFile } from './buildReportPayload.js';

const files = new Map();
let closed = 0;
globalThis.__reportValidationFiles = files;
globalThis.__reportValidationFileClosed = () => closed++;
const stub = (code) => ({
    url: `data:text/javascript,${encodeURIComponent(code)}`,
    shortCircuit: true,
});
const loader = registerHooks({
    resolve(specifier, context, nextResolve) {
        if (specifier === 'expo-file-system')
            return stub(
                `export class File {constructor(uri){this.record=globalThis.__reportValidationFiles.get(uri)}get exists(){return !!this.record}get size(){return this.record?.size}open(){const record=this.record;return {readBytes:()=>record.header,close:()=>globalThis.__reportValidationFileClosed()}}}`
            );
        if (specifier === 'react-native')
            return stub(
                `export const Image={getSize:async uri=>{if(globalThis.__reportValidationFiles.get(uri)?.damaged)throw new Error('Decode failed');return {width:100,height:100}}};`
            );
        return nextResolve(specifier, context);
    },
});
const {
    validateReportUploadFiles,
    validateReportPhoto,
    REPORT_IMAGE_MAX_BYTES,
} = await import('./validateReportUploadFiles.js');
loader.deregister();
const id = '9d9e7f4a-0e8c-4f9c-b8ec-123456789abc';
const jpg = new Uint8Array([255, 216, 255, 224]);
const photo = (uri = 'file:///photo.jpg') =>
    buildReportImageFile(uri, 'old_meter');
const images = (uris) => ({
    images: uris.map((uri, index) => ({
        kind: 'OLD_METER',
        ['client_image_id']: id,
        ['file_key']: String(index),
    })),
    files: uris.map((uri, index) => ({
        fileKey: String(index),
        file: photo(uri),
    })),
});
const failsAt = (field) => (error) => {
    assert.equal(error.code, 'REPORT_VALIDATION_ERROR');
    assert.equal(error.issues[0].path.join('.'), field);
    return true;
};

test('photos enforce format, real decode, size and keep file handles closed', async () => {
    const path = ['photos', 'oldMeter'];
    for (const [uri, header] of [
        ['file:///photo.jpg', jpg],
        [
            'file:///photo.png',
            new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]),
        ],
        [
            'file:///photo.webp',
            new Uint8Array([82, 73, 70, 70, 0, 0, 0, 0, 87, 69, 66, 80]),
        ],
    ]) {
        files.set(uri, { size: REPORT_IMAGE_MAX_BYTES, header });
        const previous = closed;
        assert.equal(
            await validateReportPhoto(photo(uri), path),
            REPORT_IMAGE_MAX_BYTES
        );
        assert.equal(closed, previous + 1);
    }
    for (const [uri, record] of [
        ['file:///missing.jpg', null],
        ['file:///zero.jpg', { size: 0, header: jpg }],
        ['file:///big.jpg', { size: REPORT_IMAGE_MAX_BYTES + 1, header: jpg }],
        ['file:///fake.jpg', { size: 100, header: new Uint8Array([1, 2, 3]) }],
        ['file:///damaged.jpg', { size: 100, header: jpg, damaged: true }],
        ['file:///photo.heic', { size: 100, header: jpg }],
    ]) {
        if (record) files.set(uri, record);
        await assert.rejects(
            validateReportPhoto(photo(uri), path),
            failsAt('photos.oldMeter')
        );
    }
});

test('batch validation checks ids and total request size without requiring photos', async () => {
    await validateReportUploadFiles({});
    const uris = ['file:///one.jpg', 'file:///two.jpg', 'file:///three.jpg'];
    for (const uri of uris)
        files.set(uri, { size: REPORT_IMAGE_MAX_BYTES, header: jpg });
    await assert.rejects(
        validateReportUploadFiles({ imagesPayload: images(uris) }),
        failsAt('photos')
    );
    const payload = images([uris[0]]);
    payload.images[0]['client_image_id'] = 'broken';
    await assert.rejects(
        validateReportUploadFiles({ imagesPayload: payload }),
        failsAt('photos.oldMeter')
    );
    await validateReportUploadFiles({
        imagesPayload: images(['https://example.test/already-uploaded.jpg']),
        offline: true,
    });
});

test('PDF checks nonempty bytes and its header while keeping the original file', async () => {
    const uri = 'file:///act.pdf';
    const payload = { uri, name: 'act.pdf', ['client_act_id']: id };
    files.set(uri, { size: 100, header: new Uint8Array([37, 80, 68, 70, 45]) });
    await validateReportUploadFiles({ actPayload: payload });
    files.set(uri, { size: 100, header: jpg });
    await assert.rejects(
        validateReportUploadFiles({ actPayload: payload }),
        failsAt('actPdf.uri')
    );
    assert.ok(files.has(uri));
    files.set(uri, { size: 0, header: new Uint8Array() });
    await assert.rejects(
        validateReportUploadFiles({ actPayload: payload }),
        failsAt('actPdf.uri')
    );
    await assert.rejects(
        validateReportUploadFiles({
            actPayload: { ...payload, ['client_act_id']: 'broken' },
        }),
        failsAt('actPdf.uri')
    );
});

test('native multipart filenames have a valid extension even with URI queries or content URIs', () => {
    assert.deepEqual(photo('file:///Photo.JPG?token=abc'), {
        uri: 'file:///Photo.JPG?token=abc',
        name: 'old_meter.jpg',
        type: 'image/jpeg',
    });
    assert.equal(
        photo('content://media/external/images/124').name,
        'old_meter.jpg'
    );
    assert.equal(photo('file:///photo.webp#fragment').type, 'image/webp');
});
