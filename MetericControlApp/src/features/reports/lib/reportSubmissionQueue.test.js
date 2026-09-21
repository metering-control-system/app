import assert from 'node:assert/strict';
import test from 'node:test';

import {
    enqueueReportSubmission,
    isCurrentReportDraft,
} from './reportSubmissionQueue.js';

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

test('a replacement invalidates an offline snapshot waiting in the same queue', async () => {
    const oldDraft = { reportState: 'pending', comment: 'old' };
    let currentDraft = oldDraft;
    let sends = 0;
    const replacement = enqueueReportSubmission(50, async () => {
        currentDraft = { comment: '' };
    });
    const offlineSend = enqueueReportSubmission(50, async () => {
        if (isCurrentReportDraft(oldDraft, currentDraft)) sends++;
    });
    await Promise.all([replacement, offlineSend]);
    assert.equal(sends, 0);
});

test('failed replacement keeps the pending draft eligible for offline sending', async () => {
    const draft = { reportState: 'pending' };
    const replacement = enqueueReportSubmission(51, async () => {
        throw new Error('network');
    });
    const send = enqueueReportSubmission(51, async () =>
        isCurrentReportDraft(draft, draft)
    );
    await assert.rejects(replacement, /network/);
    assert.equal(await send, true);
    assert.equal(isCurrentReportDraft(draft, null), false);
    assert.equal(isCurrentReportDraft(undefined, null), true);
});
