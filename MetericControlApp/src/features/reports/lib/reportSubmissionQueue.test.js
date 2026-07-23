import assert from 'node:assert/strict';
import test from 'node:test';

import { enqueueReportSubmission } from './reportSubmissionQueue.js';

test('serializes concurrent submissions for the same task', async () => {
    const callOrder = [];
    let releaseFirstSubmission;
    let markFirstSubmissionStarted;
    const firstSubmissionGate = new Promise((resolve) => {
        releaseFirstSubmission = resolve;
    });
    const firstSubmissionStarted = new Promise((resolve) => {
        markFirstSubmissionStarted = resolve;
    });

    const firstSubmission = enqueueReportSubmission(12, async () => {
        callOrder.push('first-start');
        markFirstSubmissionStarted();
        await firstSubmissionGate;
        callOrder.push('first-end');
    });
    const secondSubmission = enqueueReportSubmission(12, async () => {
        callOrder.push('second');
    });

    await firstSubmissionStarted;
    assert.deepEqual(callOrder, ['first-start']);

    releaseFirstSubmission();
    await Promise.all([firstSubmission, secondSubmission]);

    assert.deepEqual(callOrder, ['first-start', 'first-end', 'second']);
});

test('does not block submissions for different tasks', async () => {
    const completedTasks = [];

    await Promise.all([
        enqueueReportSubmission(12, async () => completedTasks.push(12)),
        enqueueReportSubmission(20, async () => completedTasks.push(20)),
    ]);

    assert.deepEqual(new Set(completedTasks), new Set([12, 20]));
});
