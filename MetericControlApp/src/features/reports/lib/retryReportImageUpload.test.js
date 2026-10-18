import assert from 'node:assert/strict';
import test from 'node:test';

import {
    isRetryableImageUploadError,
    retryReportImageUpload,
} from '@/features/reports/lib/retryReportImageUpload';

test('retries a temporary image upload failure up to five times', async () => {
    let requestCount = 0;
    const delays = [];

    const result = await retryReportImageUpload(
        async () => {
            requestCount += 1;

            if (requestCount < 6) {
                throw new Error('Network Error');
            }

            return 'uploaded';
        },
        { waitForRetry: async (delayMs) => delays.push(delayMs) }
    );

    assert.equal(result, 'uploaded');
    assert.equal(requestCount, 6);
    assert.deepEqual(delays, [300, 600, 1200, 2400, 4800]);
});

test('does not retry validation errors', async () => {
    let requestCount = 0;
    const validationError = Object.assign(new Error('Invalid image'), {
        response: { status: 400 },
    });

    await assert.rejects(
        retryReportImageUpload(
            async () => {
                requestCount += 1;
                throw validationError;
            },
            { waitForRetry: async () => {} }
        ),
        validationError
    );

    assert.equal(requestCount, 1);
    assert.equal(isRetryableImageUploadError(validationError), false);
});
