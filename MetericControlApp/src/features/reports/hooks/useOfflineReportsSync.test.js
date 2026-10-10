import assert from 'node:assert/strict';
import { areReportDraftsEqual } from '../lib/areReportDraftsEqual.js';
import { registerHooks } from 'node:module';
import { setTimeout as delay } from 'node:timers/promises';
import test from 'node:test';
import { createElement } from 'react';
import { act, create } from 'react-test-renderer';
import {
    MutationObserver,
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query';
import {
    cleanup,
    submission,
    useNetwork,
    useReportDraftStore,
} from './fixtures/offlineReportsSync.js';
import {
    REPORT_OPERATION_KEY,
    startReportOperation,
} from '../lib/reportOperation.js';

const fixturesUrl = new URL('./fixtures/offlineReportsSync.js', import.meta.url)
    .href;
const replacements = new Map(
    [
        ['@/features/reports/hooks/useSubmitReport', 'useSubmitReport'],
        ['@/shared/hooks/offline/useNetwork', 'useNetwork'],
        ['@/features/reports/store/useReportDraftStore', 'useReportDraftStore'],
        ['@/shared/store/useStorePictures', 'useStorePictures'],
    ].map(([specifier, name]) => [
        specifier,
        `data:text/javascript,${encodeURIComponent(`export { ${name} as default } from '${fixturesUrl}';`)}`,
    ])
);
replacements.set(
    '@/features/reports/lib/savePdfToDocuments',
    `data:text/javascript,${encodeURIComponent(`export { deleteAct } from '${fixturesUrl}';`)}`
);
const loader = registerHooks({
    resolve(specifier, context, nextResolve) {
        if (replacements.has(specifier)) {
            return { url: replacements.get(specifier), shortCircuit: true };
        }
        if (specifier.startsWith('@/features/reports/lib/')) {
            return {
                url: new URL(
                    `../lib/${specifier.split('/').at(-1)}.js`,
                    import.meta.url
                ).href,
                shortCircuit: true,
            };
        }
        return nextResolve(specifier, context);
    },
});
const { useOfflineReportsSync } = await import('./useOfflineReportsSync.js');
loader.deregister();

const setup = (t, drafts, beforeFinish = async () => {}) => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    cleanup.photos.length = 0;
    cleanup.pdfs.length = 0;
    useNetwork.setState({ isChecked: true, isOnline: true });
    useReportDraftStore.setState({ drafts });
    const client = new QueryClient({
        defaultOptions: { mutations: { retry: false, gcTime: Infinity } },
    });
    const sent = [];
    const observer = new MutationObserver(client, {
        mutationKey: [...REPORT_OPERATION_KEY, 'submit'],
        mutationFn: async ({ taskId, expectedDraft }) => {
            if (
                !areReportDraftsEqual(
                    expectedDraft,
                    useReportDraftStore.getState().getDraft(taskId)
                )
            ) {
                return { skipped: true };
            }
            sent.push(taskId);
            return (await beforeFinish(taskId)) ?? {};
        },
    });
    submission.current = (variables) =>
        startReportOperation(client, variables.taskId, () =>
            observer.mutate(variables)
        );
    let root;
    const Harness = () => {
        useOfflineReportsSync();
        return null;
    };
    const mount = () =>
        act(async () => {
            root = create(
                createElement(
                    QueryClientProvider,
                    { client },
                    createElement(Harness)
                )
            );
        });
    t.after(async () => {
        await act(async () => root?.unmount());
        client.clear();
        delete globalThis.IS_REACT_ACT_ENVIRONMENT;
    });
    const loading = (taskId) => {
        const gate = Promise.withResolvers();
        const result = new MutationObserver(client, {
            mutationKey: [...REPORT_OPERATION_KEY, 'load'],
            mutationFn: () => gate.promise,
        }).mutate({ taskId });
        return { gate, result };
    };
    return { mount, sent, loading };
};

const flush = () =>
    act(async () => {
        await delay(10);
    });

test('automatically sends free tasks and resumes a busy task while another stays busy', async (t) => {
    const { mount, sent, loading } = setup(t, {
        1: { reportState: 'pending' },
        2: { reportState: 'pending' },
    });
    const first = loading(1);
    const unrelated = loading(3);
    await mount();
    await flush();
    assert.deepEqual(sent, ['2']);
    await act(async () => {
        first.gate.resolve();
        await first.result;
    });
    await flush();
    assert.deepEqual(sent, ['2', '1']);
    await act(async () => {
        unrelated.gate.resolve();
        await unrelated.result;
    });
    await flush();
    assert.deepEqual(sent, ['2', '1']);
});

test('a successful replacement is not sent automatically', async (t) => {
    const { mount, sent, loading } = setup(t, {
        1: { reportState: 'pending' },
    });
    const first = loading(1);
    await mount();
    await act(async () => {
        useReportDraftStore.setState({
            drafts: { 1: { comment: 'server report' } },
        });
        first.gate.resolve();
        await first.result;
    });
    await flush();
    assert.deepEqual(sent, []);
    assert.equal(
        useReportDraftStore.getState().getDraft('1').comment,
        'server report'
    );
});

test('a failed load automatically releases its pending draft for sending', async (t) => {
    const { mount, sent, loading } = setup(t, {
        1: { reportState: 'pending' },
    });
    const first = loading(1);
    await mount();
    await act(async () => {
        const rejection = assert.rejects(first.result, /network/);
        first.gate.reject(new Error('network'));
        await rejection;
    });
    await flush();
    assert.deepEqual(sent, ['1']);
});

test('a released task stays pending offline and sends after reconnection', async (t) => {
    const { mount, sent, loading } = setup(t, {
        1: { reportState: 'pending' },
    });
    const first = loading(1);
    await mount();
    await act(async () => {
        useNetwork.setState({ isOnline: false });
        first.gate.resolve();
        await first.result;
    });
    await flush();
    assert.deepEqual(sent, []);
    await act(async () => {
        useNetwork.setState({ isOnline: true });
    });
    await flush();
    assert.deepEqual(sent, ['1']);
});

test('rechecks a released task after the current synchronization pass finishes', async (t) => {
    const sendGate = Promise.withResolvers();
    const { mount, sent, loading } = setup(
        t,
        { 1: { reportState: 'pending' }, 2: { reportState: 'pending' } },
        (taskId) => (taskId === '2' ? sendGate.promise : undefined)
    );
    const first = loading(1);
    await mount();
    await flush();
    assert.deepEqual(sent, ['2']);
    await act(async () => {
        first.gate.resolve();
        await first.result;
    });
    await flush();
    assert.deepEqual(sent, ['2']);
    await act(async () => {
        sendGate.resolve();
    });
    await flush();
    assert.deepEqual(sent, ['2', '1']);
});

test('cleans the successfully sent draft, photos and PDF in the synchronization callback', async (t) => {
    const { mount, sent } = setup(t, {
        1: { reportState: 'pending', actPdf: { uri: 'file://sent.pdf' } },
    });
    await mount();
    await flush();
    assert.deepEqual(sent, ['1']);
    assert.equal(useReportDraftStore.getState().getDraft('1'), undefined);
    assert.deepEqual(cleanup.photos, [{ entity: 'report', entityId: '1' }]);
    assert.deepEqual(cleanup.pdfs, ['file://sent.pdf']);
});

test('preserves a changed draft, photos and PDF when an earlier submission finishes', async (t) => {
    const gate = Promise.withResolvers();
    const { mount, sent } = setup(
        t,
        {
            1: {
                reportState: 'pending',
                comment: 'old',
                actPdf: { uri: 'file://act.pdf' },
            },
        },
        () => gate.promise
    );
    await mount();
    await flush();
    assert.deepEqual(sent, ['1']);
    const edited = { comment: 'edited', actPdf: { uri: 'file://act.pdf' } };
    await act(async () => {
        useReportDraftStore.setState({ drafts: { 1: edited } });
        gate.resolve();
    });
    await flush();
    assert.equal(useReportDraftStore.getState().getDraft('1'), edited);
    assert.deepEqual(cleanup.photos, []);
    assert.deepEqual(cleanup.pdfs, []);
});

test('cleans the updated brigade draft after its server revision is recorded during synchronization', async (t) => {
    const sent = {
        reportState: 'pending',
        actPdf: { uri: 'file://brigade.pdf' },
        submissionReport: { id: 10, updatedAt: '2026-10-06T12:00:00Z' },
    };
    const { mount } = setup(
        t,
        { 1: { reportState: 'pending', actPdf: sent.actPdf } },
        () => {
            useReportDraftStore.setState({ drafts: { 1: sent } });
            return { submittedDraft: sent };
        }
    );
    await mount();
    await flush();
    assert.equal(useReportDraftStore.getState().getDraft('1'), undefined);
    assert.deepEqual(cleanup.photos, [{ entity: 'report', entityId: '1' }]);
    assert.deepEqual(cleanup.pdfs, ['file://brigade.pdf']);
});
