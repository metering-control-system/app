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

test('hides and locks submitted brigade tasks and returns rejected tasks', () => {
    const brigade = { ...task, ['is_team_task']: true };
    for (const status of ['ON_REVIEW', 'ON_ADMIN', 'ACCEPTED', 'REJECTED']) {
        assert.deepEqual(
            filterSubmittedTasks([brigade], [{ ...report, status }]),
            status === 'REJECTED' ? [brigade] : []
        );
        assert.equal(
            isTaskReportReadOnly(brigade, { ...report, status }),
            status !== 'REJECTED'
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
    assert.deepEqual(filterSubmittedTasks([brigade], []), []);
});

test('a brigade draft cannot unlock the report submitted by another participant', () => {
    const brigade = { ...task, ['is_team_task']: true };
    const sent = { ...report, ['updated_at']: '2026-10-06T12:00:00Z' };
    for (const reportState of [undefined, 'pending', 'error']) {
        const draft = {
            reportState,
            submissionReport: {
                id: sent.id,
                updatedAt: '2026-10-06T11:00:00Z',
            },
        };
        assert.deepEqual(
            filterSubmittedTasks([brigade], [sent], { 1: draft }),
            []
        );
        assert.deepEqual(
            filterSubmittedTasks([brigade], [{ ...sent, status: 'REJECTED' }], {
                1: draft,
            }),
            [brigade]
        );
    }
});

test('keeps an unfinished brigade upload editable only for its recorded server revision', () => {
    const brigade = { ...task, ['is_team_task']: true };
    const partial = { ...report, ['updated_at']: '2026-10-06T12:00:00Z' };
    for (const reportState of ['pending', 'error']) {
        const draft = {
            reportState,
            submissionReport: { id: partial.id, updatedAt: partial.updated_at },
        };
        assert.equal(isTaskReportReadOnly(brigade, partial, draft), false);
        assert.equal(
            isTaskReportReadOnly(brigade, { ...partial, id: 11 }, draft),
            true
        );
        assert.equal(
            isTaskReportReadOnly(
                brigade,
                { ...partial, status: 'ACCEPTED' },
                draft
            ),
            true
        );
    }
});
