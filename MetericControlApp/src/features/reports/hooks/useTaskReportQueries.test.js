import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import test from 'node:test';
import { createElement } from 'react';
import { act, create } from 'react-test-renderer';
import {
    MutationObserver,
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query';
import { requests } from './fixtures/taskReportQueries.js';
import {
    useNetwork,
    useReportsStore,
    useReportDraftStore,
} from './fixtures/taskReportSubmission.js';

const storesUrl = new URL('./fixtures/taskReportSubmission.js', import.meta.url)
    .href;
const queriesUrl = new URL('./fixtures/taskReportQueries.js', import.meta.url)
    .href;
const replacements = new Map(
    [
        ['@/shared/hooks/offline/useNetwork', 'useNetwork'],
        ['@/features/reports/store/useReportsStore', 'useReportsStore'],
        ['@/features/reports/store/useReportDraftStore', 'useReportDraftStore'],
    ].map(([specifier, name]) => [
        specifier,
        `data:text/javascript,${encodeURIComponent(`export { ${name} as default } from '${storesUrl}';`)}`,
    ])
);
const loader = registerHooks({
    resolve(specifier, context, nextResolve) {
        if (replacements.has(specifier)) {
            return { url: replacements.get(specifier), shortCircuit: true };
        }
        if (
            specifier === '@/shared/api/baseApi' ||
            specifier === 'expo-router'
        ) {
            return { url: queriesUrl, shortCircuit: true };
        }
        if (specifier.startsWith('@/')) {
            return {
                url: new URL(
                    `../../../${specifier.slice(2)}.js`,
                    import.meta.url
                ).href,
                shortCircuit: true,
            };
        }
        return nextResolve(specifier, context);
    },
});
const { default: useTaskReports } = await import('./useTaskReports.js');
const { default: useTaskReport } = await import('./useTaskReport.js');
const { default: useUpdateReports } = await import('./useUpdateReports.js');
loader.deregister();

const task = { id: 1, ['is_team_task']: false };
const report = { id: 10, ['task_id']: task.id, status: 'REJECTED' };
const responseFor = (kind, report) =>
    kind === 'single'
        ? report
        : { reports: [report], ['snapshot_at']: '2026-10-06T12:00:00Z' };

const setup = async (
    t,
    kind,
    brigade = false,
    initialReport = null,
    online = true
) => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    requests.length = 0;
    useNetwork.setState({ isChecked: true, isOnline: online });
    useReportsStore.setState({ reports: [], snapshotAt: null });
    useReportDraftStore.setState({ drafts: {} });
    const client = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    if (initialReport) cacheReport(client, initialReport);
    const roots = [];
    let current;
    const useSelectedTaskReport = () =>
        useTaskReport({ ...task, ['is_team_task']: brigade });
    const useReportQuery =
        kind === 'single'
            ? useSelectedTaskReport
            : kind === 'update'
              ? useUpdateReports
              : useTaskReports;
    const Harness = () => {
        current = useReportQuery();
        return null;
    };
    const mount = async () => {
        let root;
        await act(async () => {
            root = create(
                createElement(
                    QueryClientProvider,
                    { client },
                    createElement(Harness)
                )
            );
        });
        roots.push(root);
    };
    const logout = async () => {
        await act(async () => {
            client.removeQueries();
            for (const root of roots.splice(0)) root.unmount();
            useReportsStore.setState({ reports: [], snapshotAt: null });
        });
    };
    t.after(async () => {
        await logout();
        client.clear();
        delete globalThis.IS_REACT_ACT_ENVIRONMENT;
    });
    await mount();
    if (kind === 'update') await act(async () => current.updateReports());
    assert.equal(requests.length, online ? 1 : 0);
    if (online && kind !== 'update') assert.ok(requests[0].signal);
    return { client, mount, logout, current: () => current };
};

const respond = async (request, data) => {
    await act(async () => {
        request.respond(data);
        await new Promise((resolve) => setTimeout(resolve, 0));
    });
};

for (const kind of ['single', 'list']) {
    test(`${kind} report query stores a current response`, async (t) => {
        await setup(t, kind);
        assert.equal(requests[0].signal.aborted, false);
        await respond(requests[0], responseFor(kind, report));
        assert.deepEqual(useReportsStore.getState().reports, [report]);
    });

    test(`${kind} report query ignores a late response after logout`, async (t) => {
        const { client, logout } = await setup(t, kind);
        const oldRequest = requests[0];
        await logout();
        assert.equal(oldRequest.signal.aborted, true);
        await respond(oldRequest, responseFor(kind, report));
        assert.deepEqual(useReportsStore.getState().reports, []);
        assert.equal(client.getQueryCache().getAll().length, 0);
    });

    test(`${kind} report query cannot overwrite the next account's reports`, async (t) => {
        const { logout, mount } = await setup(t, kind);
        const oldRequest = requests[0];
        await logout();
        await mount();
        const nextRequest = requests[1];
        const nextReport = { ...report, id: 20, status: 'ON_REVIEW' };
        assert.equal(nextRequest.signal.aborted, false);
        await respond(nextRequest, responseFor(kind, nextReport));
        await respond(oldRequest, responseFor(kind, report));
        assert.deepEqual(useReportsStore.getState().reports, [nextReport]);
    });
}

test('uses the same cancellation signal on every report page', async (t) => {
    const { logout } = await setup(t, 'list');
    const firstRequest = requests[0];
    await respond(firstRequest, {
        ...responseFor('list', report),
        ['next_cursor']: 'second-page',
    });
    const nextRequest = requests[1];
    assert.equal(nextRequest.params.cursor, 'second-page');
    assert.equal(nextRequest.signal, firstRequest.signal);
    await logout();
    assert.equal(nextRequest.signal.aborted, true);
    await respond(nextRequest, responseFor('list', { ...report, id: 11 }));
    assert.deepEqual(useReportsStore.getState().reports, []);
});

test('checks the shared brigade status and allows editing after rejection without automatically loading form fields', async (t) => {
    const { current } = await setup(t, 'single', true);
    await respond(requests[0], {
        ...report,
        status: 'ON_REVIEW',
        ['updated_at']: '2026-10-06T12:00:00Z',
    });
    assert.equal(current().isReadOnly, true);
    assert.deepEqual(useReportDraftStore.getState().drafts, {});
    let refresh;
    await act(async () => {
        refresh = current().refetch();
    });
    await respond(requests[1], {
        ...report,
        ['updated_at']: '2026-10-06T13:00:00Z',
    });
    await act(async () => {
        await refresh;
    });
    assert.equal(current().report.status, 'REJECTED');
    assert.equal(current().isReadOnly, false);
    assert.deepEqual(useReportDraftStore.getState().drafts, {});
});

test('does not redirect away from a brigade form while its submission is uploading files', async (t) => {
    const { client, current } = await setup(t, 'single', true);
    const gate = Promise.withResolvers();
    const observer = new MutationObserver(client, {
        mutationKey: ['report-operation', 'submit'],
        mutationFn: () => gate.promise,
    });
    let sending;
    await act(async () => {
        sending = observer.mutate({ taskId: 1 });
    });
    await respond(requests[0], { ...report, status: 'ON_REVIEW' });
    assert.equal(current().isReadOnly, false);
    await act(async () => {
        gate.resolve();
        await sending;
    });
    await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
    });
    assert.equal(current().isReadOnly, true);
});

const cached = {
    ...report,
    status: 'ON_REVIEW',
    ['updated_at']: '2026-10-06T11:00:00Z',
};
const cacheReport = (client, value = cached) => {
    useReportsStore.setState({ reports: [value] });
    client.setQueryData(['report', value.id], value);
    client.setQueryData(['report', 'task', value.task_id], value);
    client.setQueryData(['reports'], {
        pages: [{ reports: [value] }],
        pageParams: [undefined],
    });
};
const reject = async (request, error) => {
    await act(async () => {
        request.reject(error);
        await new Promise((resolve) => setTimeout(resolve, 0));
    });
};

for (const brigade of [false, true]) {
    test(`server 404 clears a deleted ${brigade ? 'brigade' : 'single'} report and unlocks its task`, async (t) => {
        const { client, current } = await setup(t, 'single', brigade, cached);
        const draft = { comment: 'local edits' };
        useReportDraftStore.setState({ drafts: { 1: draft } });
        await reject(requests[0], { response: { status: 404 } });
        assert.equal(current().report, null);
        assert.equal(current().isReadOnly, false);
        assert.equal(current().isError, false);
        assert.deepEqual(useReportsStore.getState().reports, []);
        assert.equal(client.getQueryData(['report', 10]), null);
        assert.deepEqual(client.getQueryData(['reports']).pages[0].reports, []);
        assert.deepEqual(useReportDraftStore.getState().drafts, { 1: draft });
    });
}

for (const error of [
    new Error('network'),
    { response: { status: 403 } },
    { response: { status: 500 } },
]) {
    test(`a failed task lookup keeps the cached report (${error.message ?? error.response.status})`, async (t) => {
        const { client, current } = await setup(t, 'single');
        cacheReport(client);
        await reject(requests[0], error);
        assert.equal(current().isError, true);
        assert.equal(current().report.id, cached.id);
        assert.deepEqual(useReportsStore.getState().reports, [cached]);
    });
}

test('a late missing-report response preserves a newly submitted report', async (t) => {
    const { client, current } = await setup(t, 'single');
    const submitted = {
        ...cached,
        id: 11,
        ['updated_at']: '2026-10-06T12:01:00Z',
    };
    await act(async () => cacheReport(client, submitted));
    await reject(requests[0], { response: { status: 404 } });
    assert.equal(current().report.id, submitted.id);
    assert.equal(current().isReadOnly, true);
    assert.deepEqual(useReportsStore.getState().reports, [submitted]);
});

for (const kind of ['list', 'update']) {
    test(`${kind} refresh removes deleted reports from the store and all query caches`, async (t) => {
        const { client } = await setup(t, kind);
        cacheReport(client);
        const draft = { comment: 'local edits' };
        useReportDraftStore.setState({ drafts: { 1: draft } });
        await respond(requests[0], {
            reports: [],
            ['snapshot_at']: '2026-10-06T12:00:00Z',
        });
        assert.equal(requests[0].params.update_since, null);
        assert.deepEqual(useReportsStore.getState().reports, []);
        assert.equal(client.getQueryData(['report', 'task', 1]), null);
        assert.equal(client.getQueryData(['report', 10]), null);
        assert.deepEqual(client.getQueryData(['reports']).pages[0].reports, []);
        assert.deepEqual(useReportDraftStore.getState().drafts, { 1: draft });
    });
}

test('a paginated refresh waits for every page before removing missing reports', async (t) => {
    const { client } = await setup(t, 'list');
    cacheReport(client);
    await respond(requests[0], {
        reports: [],
        ['snapshot_at']: '2026-10-06T12:00:00Z',
        ['next_cursor']: 'next',
    });
    assert.deepEqual(useReportsStore.getState().reports, [cached]);
    await reject(requests[1], new Error('network'));
    assert.deepEqual(useReportsStore.getState().reports, [cached]);
});

test('a refresh preserves a report submitted after its server snapshot', async (t) => {
    const { client } = await setup(t, 'list');
    const submitted = { ...cached, ['updated_at']: '2026-10-06T12:01:00Z' };
    await act(async () => cacheReport(client, submitted));
    await respond(requests[0], {
        reports: [],
        ['snapshot_at']: '2026-10-06T12:00:00Z',
    });
    assert.deepEqual(useReportsStore.getState().reports, [submitted]);
    assert.equal(client.getQueryData(['report', 'task', 1]).id, submitted.id);
});

test('a late 404 does not remove the next account reports after logout', async (t) => {
    const { client, logout } = await setup(t, 'single', false, cached);
    const request = requests[0];
    await logout();
    cacheReport(client);
    await reject(request, { response: { status: 404 } });
    assert.deepEqual(useReportsStore.getState().reports, [cached]);
});

test('offline opening keeps a cached report without assuming it was deleted', async (t) => {
    const { current } = await setup(t, 'single', false, cached, false);
    assert.equal(current().report.id, cached.id);
    assert.equal(current().isReadOnly, true);
    assert.deepEqual(useReportsStore.getState().reports, [cached]);
});

test('a late 404 preserves a newer revision of the same report', async (t) => {
    const { client, current } = await setup(t, 'single', false, cached);
    const updated = { ...cached, ['updated_at']: '2026-10-06T12:01:00Z' };
    await act(async () => cacheReport(client, updated));
    await reject(requests[0], { response: { status: 404 } });
    assert.equal(current().report.updated_at, updated.updated_at);
    assert.deepEqual(useReportsStore.getState().reports, [updated]);
});

test('a snapshot cleanup cancels an older active task lookup so its response cannot restore the deleted report', async (t) => {
    const { client } = await setup(t, 'single', false, cached);
    const oldRequest = requests[0];
    const data = { reports: [], ['snapshot_at']: '2026-10-06T12:00:00Z' };
    const removed = useReportsStore
        .getState()
        .setUpdatedReports(data.reports, { snapshotAt: data.snapshot_at });
    const { clearRemovedReportQueries } =
        await import('../lib/clearRemovedReportQueries.js');
    await act(async () =>
        clearRemovedReportQueries(
            client,
            removed,
            useReportsStore.getState().reports
        )
    );
    assert.equal(oldRequest.signal.aborted, true);
    await respond(oldRequest, cached);
    assert.deepEqual(useReportsStore.getState().reports, []);
    assert.equal(client.getQueryData(['report', 'task', 1]), null);
});
