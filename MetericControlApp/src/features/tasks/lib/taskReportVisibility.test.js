import assert from 'node:assert/strict';
import test from 'node:test';
import {
    filterSubmittedTasks,
    isTaskReportReadOnly,
} from './taskReportVisibility.js';
import { buildReportUpsertRequest } from '../../reports/lib/reportUpsert.js';

const task = { id: 1, status: 'IN_PROGRESS', ['is_team_task']: false };
const report = { id: 10, ['task_id']: 1, status: 'ON_REVIEW' };

test('hides submitted single tasks through review and acceptance', () => {
    for (const status of ['ON_REVIEW', 'ON_ADMIN', 'ACCEPTED']) {
        assert.deepEqual(
            filterSubmittedTasks([task], [{ ...report, status }]),
            []
        );
        assert.equal(isTaskReportReadOnly(task, { ...report, status }), true);
    }
});

test('returns a rejected task for editing and hides it after resubmission', () => {
    const rejected = { ...report, status: 'REJECTED' };
    assert.deepEqual(filterSubmittedTasks([task], [rejected]), [task]);
    assert.equal(isTaskReportReadOnly(task, rejected), false);
    const request = buildReportUpsertRequest({
        existingReport: rejected,
        reportPayload: { ['task_id']: task.id },
        resubmitRejectedReport: true,
    });
    assert.equal(request.reportId, report.id);
    assert.deepEqual(
        filterSubmittedTasks([task], [{ ...rejected, ...request.payload }]),
        []
    );
});

test('keeps new tasks and ignores reports for other tasks', () => {
    assert.deepEqual(filterSubmittedTasks([task], []), [task]);
    assert.deepEqual(
        filterSubmittedTasks([task], [{ ...report, ['task_id']: 2 }]),
        [task]
    );
    assert.deepEqual(filterSubmittedTasks(null, null), []);
});

test('never hides or locks brigade tasks', () => {
    const brigade = { ...task, ['is_team_task']: true };
    for (const status of ['ON_REVIEW', 'ON_ADMIN', 'ACCEPTED', 'REJECTED']) {
        assert.deepEqual(
            filterSubmittedTasks([brigade], [{ ...report, status }]),
            [brigade]
        );
        assert.equal(
            isTaskReportReadOnly(brigade, { ...report, status }),
            false
        );
    }
});

test('keeps pending offline submissions and failed uploads available until success', () => {
    for (const reportState of ['pending', 'error']) {
        const drafts = { 1: { reportState } };
        assert.deepEqual(filterSubmittedTasks([task], [], drafts), [task]);
        assert.deepEqual(filterSubmittedTasks([task], [report], drafts), [
            task,
        ]);
    }
    assert.deepEqual(filterSubmittedTasks([task], [report], {}), []);
});

test('does not unlock an accepted report with an old pending draft', () => {
    assert.equal(
        isTaskReportReadOnly(
            task,
            { ...report, status: 'ACCEPTED' },
            { reportState: 'pending' }
        ),
        true
    );
});

test('uses the latest report when a task has legacy duplicate reports', () => {
    assert.deepEqual(
        filterSubmittedTasks(
            [task],
            [report, { ...report, id: 11, status: 'REJECTED' }]
        ),
        [task]
    );
});

test('keeps a completed single task hidden when its report is archived', () => {
    const completed = { ...task, status: 'COMPLETED' };
    assert.deepEqual(filterSubmittedTasks([completed], []), []);
    assert.deepEqual(
        filterSubmittedTasks([completed], [{ ...report, status: 'REJECTED' }]),
        [completed]
    );
    const brigade = { ...completed, ['is_team_task']: true };
    assert.deepEqual(filterSubmittedTasks([brigade], []), [brigade]);
});
