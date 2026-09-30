import assert from 'node:assert/strict';
import test from 'node:test';
import { loadReportReplacement } from './loadReportReplacement.js';

const report = { id: 8, ['task_id']: 17, images: [] };

test('fetches fresh data on every explicit load and applies only that response', async () => {
    let requests = 0;
    const applied = [];
    const fetchReport = async (taskId) => {
        assert.equal(taskId, 17);
        return { ...report, comment: String(++requests) };
    };
    for (let i = 0; i < 2; i++) {
        await loadReportReplacement({
            taskId: 17,
            fetchReport,
            applyReport: (value) => applied.push(value),
        });
    }
    assert.deepEqual(
        applied.map((value) => value.comment),
        ['1', '2']
    );
});

test('missing report and network failure leave local data untouched', async () => {
    let writes = 0;
    const applyReport = () => writes++;
    const result = await loadReportReplacement({
        taskId: 17,
        fetchReport: async () => null,
        applyReport,
    });
    assert.equal(result, null);
    await assert.rejects(
        loadReportReplacement({
            taskId: 17,
            fetchReport: async () => {
                throw new Error('offline');
            },
            applyReport,
        }),
        /offline/
    );
    assert.equal(writes, 0);
});

test('does not apply a response to a closed form or a different task', async () => {
    let writes = 0;
    const applyReport = () => writes++;
    await loadReportReplacement({
        taskId: 17,
        fetchReport: async () => report,
        applyReport,
        shouldApply: () => false,
    });
    await assert.rejects(
        loadReportReplacement({
            taskId: 18,
            fetchReport: async () => report,
            applyReport,
        }),
        /другой задачи/
    );
    assert.equal(writes, 0);
});
