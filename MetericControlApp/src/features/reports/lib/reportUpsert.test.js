import assert from 'node:assert/strict';
import test from 'node:test';

import {
    buildReportUpsertRequest,
    resolveReportForSubmission,
    selectReportForTask,
} from './reportUpsert.js';

test('uses a cached report for the same task without another lookup', async () => {
    const cachedReport = { id: 7, ['task_id']: 12 };
    let lookupCount = 0;
    const result = await resolveReportForSubmission({
        taskId: 12,
        cachedReport,
        lookupReport: async () => {
            lookupCount++;
            return null;
        },
    });

    assert.equal(result, cachedReport);
    assert.equal(lookupCount, 0);
});

test('checks the server before creating when the cache is empty', async () => {
    const serverReport = { id: 8, ['task_id']: 12 };
    const result = await resolveReportForSubmission({
        taskId: 12,
        cachedReport: null,
        lookupReport: async () => serverReport,
    });

    assert.equal(result, serverReport);
});

test('does not use a cached report belonging to another task', async () => {
    const serverReport = { id: 8, ['task_id']: 12 };
    const result = await resolveReportForSubmission({
        taskId: 12,
        cachedReport: { id: 7, ['task_id']: 13 },
        lookupReport: async () => serverReport,
    });

    assert.equal(result, serverReport);
});

test('creates a report when the task has no report', () => {
    const payload = {
        ['client_report_id']: 'client-report-id',
        ['task_id']: 12,
    };

    assert.deepEqual(
        buildReportUpsertRequest({
            reportPayload: payload,
            existingReport: null,
        }),
        { operation: 'create', reportId: null, payload }
    );
});

test('updates an existing report and preserves its client id', () => {
    const request = buildReportUpsertRequest({
        reportPayload: {
            ['client_report_id']: 'new-client-report-id',
            ['task_id']: 12,
        },
        existingReport: {
            id: 7,
            ['client_report_id']: 'existing-client-report-id',
            ['task_id']: 12,
        },
    });

    assert.equal(request.operation, 'update');
    assert.equal(request.reportId, 7);
    assert.equal(
        request.payload['client_report_id'],
        'existing-client-report-id'
    );
});

test('selects the newest matching report without mixing tasks', () => {
    const reports = [
        { id: 3, ['task_id']: 12 },
        { id: 9, ['task_id']: 20 },
        { id: 8, ['task_id']: 12 },
    ];

    assert.equal(selectReportForTask(reports, 12)?.id, 8);
    assert.equal(selectReportForTask(reports, 20)?.id, 9);
    assert.equal(selectReportForTask(reports, 30), null);
});

test('resubmits a rejected report for review using the same report id', () => {
    const request = buildReportUpsertRequest({
        reportPayload: { ['task_id']: 12 },
        existingReport: { id: 7, status: 'REJECTED' },
        resubmitRejectedReport: true,
    });

    assert.equal(request.operation, 'update');
    assert.equal(request.reportId, 7);
    assert.equal(request.payload.status, 'ON_REVIEW');
});

test('does not reset review or acceptance when retrying an existing report', () => {
    for (const status of ['ON_REVIEW', 'ON_ADMIN', 'ACCEPTED']) {
        const request = buildReportUpsertRequest({
            reportPayload: { ['task_id']: 12 },
            existingReport: { id: 7, status },
            resubmitRejectedReport: true,
        });

        assert.equal(Object.hasOwn(request.payload, 'status'), false);
    }
});

test('leaves rejected brigade reports unchanged', () => {
    const request = buildReportUpsertRequest({
        reportPayload: { ['task_id']: 12 },
        existingReport: { id: 7, status: 'REJECTED' },
        resubmitRejectedReport: false,
    });

    assert.equal(Object.hasOwn(request.payload, 'status'), false);
});
