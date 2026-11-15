import assert from 'node:assert/strict';
import test from 'node:test';
import { MutationObserver, QueryClient } from '@tanstack/query-core';
import {
    getReportOperationFilters,
    REPORT_OPERATION_KEY,
    startReportOperation,
} from '@/features/reports/lib/reportOperation';
import { syncOfflineReportsRecords } from '@/features/reports/lib/syncOfflineReportsRecords';

const setup = (t) => {
    const client = new QueryClient({
        defaultOptions: {
            mutations: {
                retry: false,
                gcTime: Infinity,
                networkMode: 'always',
            },
        },
    });
    t.after(() => client.clear());
    const operation = (type, mutationFn, onSuccess) => {
        const observer = new MutationObserver(client, {
            mutationKey: [...REPORT_OPERATION_KEY, type],
            mutationFn,
            onSuccess,
        });
        return (taskId) =>
            startReportOperation(client, taskId, () =>
                observer.mutate({ taskId })
            );
    };
    return { client, operation };
};

for (const activeType of ['submit', 'load']) {
    test(`${activeType} immediately blocks repeated submission and loading for the same task`, async (t) => {
        const { client, operation } = setup(t);
        const gate = Promise.withResolvers();
        const active = operation(activeType, () => gate.promise)(42);
        let extraCalls = 0;
        const submit = operation('submit', () => ++extraCalls);
        const load = operation('load', () => ++extraCalls);

        assert.equal(client.isMutating(getReportOperationFilters('42')), 1);
        assert.deepEqual(await submit('42'), { skipped: true, reason: 'busy' });
        assert.deepEqual(await load(42), { skipped: true, reason: 'busy' });
        assert.equal(await submit(43), 1);
        gate.resolve();
        await active;
        assert.equal(extraCalls, 1);
        assert.equal(client.isMutating(getReportOperationFilters(42)), 0);
        assert.equal(await load(42), 2);
    });
}

test('the task stays busy until success processing finishes', async (t) => {
    const { client, operation } = setup(t);
    const processing = Promise.withResolvers();
    const started = Promise.withResolvers();
    const active = operation(
        'submit',
        async () => ({}),
        () => {
            started.resolve();
            return processing.promise;
        }
    )(42);
    await started.promise;
    assert.equal(client.isMutating(getReportOperationFilters(42)), 1);
    assert.deepEqual(await operation('load', () => assert.fail())(42), {
        skipped: true,
        reason: 'busy',
    });
    processing.resolve();
    await active;
    assert.equal(client.isMutating(getReportOperationFilters(42)), 0);
});

test('a failed operation releases the task for another attempt', async (t) => {
    const { operation } = setup(t);
    await assert.rejects(
        operation('load', async () => {
            throw new Error('Network unavailable');
        })(42),
        /Network unavailable/
    );
    assert.equal(await operation('submit', async () => 'sent')(42), 'sent');
});

test('an unrelated mutation does not block report operations', async (t) => {
    const { client, operation } = setup(t);
    const gate = Promise.withResolvers();
    const unrelated = new MutationObserver(client, {
        mutationKey: ['other-operation'],
        mutationFn: () => gate.promise,
    }).mutate({ taskId: 42 });
    assert.equal(await operation('submit', async () => 'sent')(42), 'sent');
    gate.resolve();
    await unrelated;
});

test('background sync retains a busy draft and can send it after loading finishes', async (t) => {
    const { operation } = setup(t);
    const gate = Promise.withResolvers();
    const active = operation('load', () => gate.promise)(42);
    const draft = { reportState: 'pending', comment: 'local report' };
    const records = { 42: draft };
    let sent = 0;
    const submit = operation('submit', async () => ++sent);
    const sendReport = ({ taskId, values, expectedDraft }) => {
        assert.equal(values, draft);
        assert.equal(expectedDraft, draft);
        return submit(taskId);
    };
    assert.equal(await syncOfflineReportsRecords(records, sendReport), 1);
    assert.equal(records[42], draft);
    assert.equal(sent, 0);
    gate.resolve();
    await active;
    assert.equal(await syncOfflineReportsRecords(records, sendReport), 0);
    assert.equal(sent, 1);
});

test('sync counts offline saves and errors but ignores replaced drafts', async () => {
    const records = {
        1: { reportState: 'pending' },
        2: { reportState: 'pending' },
        3: { reportState: 'pending' },
        4: { reportState: 'error' },
    };
    const count = await syncOfflineReportsRecords(
        records,
        async ({ taskId }) => {
            if (taskId === '1') return { offline: true };
            if (taskId === '2') throw new Error('Upload failed');
            if (taskId === '3') return { skipped: true };
            assert.fail('An error draft must not be retried automatically');
        }
    );
    assert.equal(count, 2);
});
