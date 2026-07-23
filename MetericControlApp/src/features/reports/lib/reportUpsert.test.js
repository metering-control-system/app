import assert from 'node:assert/strict';
import test from 'node:test';

import {
    buildReportUpsertRequest,
    selectReportForTask,
} from './reportUpsert.js';

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
