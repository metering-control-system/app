import { selectReportForTask } from '@/features/reports/lib/reportUpsert';
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
import {
    requests,
    focusScreens,
    focusState,
} from '@/features/reports/hooks/fixtures/taskReportQueries';
import useReportsSyncStore from '@/features/reports/store/useReportsSyncStore';
import {
    isTaskReportReadOnly,
    filterSubmittedTasks,
} from '@/features/tasks/lib/taskReportVisibility';
import {
    useNetwork,
    useReportsStore,
    useReportDraftStore,
} from '@/features/reports/hooks/fixtures/taskReportSubmission';

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
const { default: useTaskReports } =
    await import('@/features/reports/hooks/useTaskReports');
const { default: useTaskReport } =
    await import('@/features/reports/hooks/useTaskReport');
const { default: useUpdateReports } =
    await import('@/features/reports/hooks/useUpdateReports');
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
    focusState.setState({ focused: true });
    useReportsSyncStore.getState().resetSync();
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
        useTaskReport(
            { ...task, ['is_team_task']: brigade },
            isTaskReportReadOnly
        );
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
            useReportsSyncStore.getState().resetSync();
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
        await import('@/features/reports/lib/clearRemovedReportQueries');
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

const initialSnapshot = '2026-10-06T12:00:00Z';
const nextSnapshot = '2026-10-06T12:01:00Z';
const focus = async () => {
    await act(async () => focusScreens());
};
const ageTaskReports = (client) => {
    const key = ['reports', 'tasks'];
    client.setQueryData(key, client.getQueryData(key), {
        updatedAt: Date.now() - 31 * 1000,
    });
};

test('returning to fresh task or map data does not reload reports', async (t) => {
    const { mount } = await setup(t, 'list');
    await respond(requests[0], responseFor('list', cached));
    await focus();
    await mount();
    await focus();
    assert.equal(requests.length, 1);
});

test('stale task data loads only changes and keeps reports missing from the incremental response', async (t) => {
    const { client, mount } = await setup(t, 'list');
    await respond(requests[0], responseFor('list', cached));
    const updated = {
        ...cached,
        id: 11,
        status: 'REJECTED',
        ['updated_at']: nextSnapshot,
    };
    ageTaskReports(client);
    await focus();
    await mount();
    await focus();
    assert.equal(requests.length, 2);
    assert.equal(requests[1].params.update_since, initialSnapshot);
    await respond(requests[1], {
        reports: [updated],
        ['snapshot_at']: nextSnapshot,
    });
    assert.deepEqual(useReportsStore.getState().reports, [cached, updated]);
    assert.equal(useReportsStore.getState().snapshotAt, initialSnapshot);
    assert.equal(useReportsSyncStore.getState().lastSyncAt, nextSnapshot);
    assert.equal(client.getQueryData(['report', 10]), undefined);
});

test('an empty incremental response cannot erase a sent report or its query cache', async (t) => {
    const { client } = await setup(t, 'list');
    await respond(requests[0], responseFor('list', cached));
    cacheReport(client);
    ageTaskReports(client);
    await focus();
    await respond(requests[1], { reports: [], ['snapshot_at']: nextSnapshot });
    assert.deepEqual(useReportsStore.getState().reports, [cached]);
    assert.equal(client.getQueryData(['report', 10]).id, 10);
    assert.equal(client.getQueryData(['report', 'task', 1]).id, 10);
});

test('the periodic full snapshot removes deleted reports without clearing a local draft', async (t) => {
    const { client } = await setup(t, 'list');
    await respond(requests[0], responseFor('list', cached));
    cacheReport(client);
    const draft = { comment: 'keep my edits' };
    useReportDraftStore.setState({ drafts: { 1: draft } });
    useReportsSyncStore.setState({
        lastFullSyncAt: Date.now() - 5 * 60 * 1000,
    });
    ageTaskReports(client);
    await focus();
    assert.equal(requests[1].params.update_since, null);
    await respond(requests[1], { reports: [], ['snapshot_at']: nextSnapshot });
    assert.deepEqual(useReportsStore.getState().reports, []);
    assert.equal(client.getQueryData(['report', 'task', 1]), null);
    assert.deepEqual(useReportDraftStore.getState().drafts, { 1: draft });
});

test('manual task refresh always takes a full snapshot even while the cache is fresh', async (t) => {
    const { client, current } = await setup(t, 'list');
    await respond(requests[0], responseFor('list', cached));
    cacheReport(client);
    let refresh;
    await act(async () => {
        refresh = current().refreshReports();
    });
    assert.equal(requests.length, 2);
    assert.equal(requests[1].params.update_since, null);
    await respond(requests[1], { reports: [], ['snapshot_at']: nextSnapshot });
    await act(async () => refresh);
    assert.deepEqual(useReportsStore.getState().reports, []);
    assert.equal(client.getQueryData(['report', 10]), null);
    await focus();
    assert.equal(requests.length, 2);
});

test('failed incremental pagination preserves the cursor and the last full snapshot', async (t) => {
    const { client } = await setup(t, 'list');
    await respond(requests[0], responseFor('list', cached));
    const fullSyncAt = useReportsSyncStore.getState().lastFullSyncAt;
    ageTaskReports(client);
    await focus();
    await respond(requests[1], {
        reports: [],
        ['snapshot_at']: nextSnapshot,
        ['next_cursor']: 'next',
    });
    assert.equal(requests[2].params.update_since, initialSnapshot);
    await reject(requests[2], new Error('network'));
    assert.equal(useReportsSyncStore.getState().lastSyncAt, initialSnapshot);
    assert.equal(useReportsSyncStore.getState().lastFullSyncAt, fullSyncAt);
    assert.deepEqual(useReportsStore.getState().reports, [cached]);
});

test('the first task sync is full even if the reports list already set a pagination cursor', async (t) => {
    const { logout, mount } = await setup(t, 'list');
    await logout();
    useReportsSyncStore.getState().setLastSyncAt(initialSnapshot);
    await mount();
    assert.equal(requests[1].params.update_since, null);
    await respond(requests[1], responseFor('list', cached));
});

test('inactive task and map screens do not trigger a report refresh', async (t) => {
    const { client } = await setup(t, 'list');
    await respond(requests[0], responseFor('list', cached));
    ageTaskReports(client);
    await act(async () => focusState.setState({ focused: false }));
    await focus();
    assert.equal(requests.length, 1);
    await act(async () => focusState.setState({ focused: true }));
    assert.equal(requests.length, 2);
    assert.equal(requests[1].params.update_since, initialSnapshot);
    await respond(requests[1], responseFor('list', cached));
});

test('a late manual refresh after logout cannot restore the old reports or sync cursor', async (t) => {
    const { logout } = await setup(t, 'update');
    await logout();
    await respond(requests[0], responseFor('list', cached));
    assert.deepEqual(useReportsStore.getState().reports, []);
    assert.equal(useReportsSyncStore.getState().lastSyncAt, null);
    assert.equal(useReportsSyncStore.getState().lastFullSyncAt, null);
});

test('an older manual snapshot cannot move the incremental cursor backwards', async (t) => {
    await setup(t, 'update');
    useReportsSyncStore.getState().recordSync(nextSnapshot, false);
    await respond(requests[0], responseFor('list', cached));
    assert.equal(useReportsSyncStore.getState().lastSyncAt, nextSnapshot);
});

for (const brigade of [false, true]) {
    test(`incremental status updates hide and return a ${brigade ? 'brigade' : 'single'} task`, async (t) => {
        const { client } = await setup(t, 'list');
        const selectedTask = { ...task, ['is_team_task']: brigade };
        await respond(requests[0], responseFor('list', report));
        const visibleTasks = () =>
            filterSubmittedTasks(
                [selectedTask],
                (taskId) =>
                    selectReportForTask(
                        useReportsStore.getState().reports,
                        taskId
                    ),
                {}
            );
        assert.equal(visibleTasks().length, 1);
        ageTaskReports(client);
        await focus();
        await respond(requests[1], {
            reports: [{ ...cached, ['updated_at']: nextSnapshot }],
            ['snapshot_at']: nextSnapshot,
        });
        assert.equal(visibleTasks().length, 0);
        ageTaskReports(client);
        await focus();
        assert.equal(requests[2].params.update_since, nextSnapshot);
        await respond(requests[2], {
            reports: [{ ...report, ['updated_at']: '2026-10-06T12:02:00Z' }],
            ['snapshot_at']: '2026-10-06T12:02:00Z',
        });
        assert.equal(visibleTasks().length, 1);
    });
}

test('manual report list refresh still checks for deletions after a recent full sync', async (t) => {
    const { client, current } = await setup(t, 'update');
    await respond(requests[0], responseFor('list', cached));
    cacheReport(client);
    await act(async () => current().updateReports());
    assert.equal(requests[1].params.update_since, null);
    await respond(requests[1], { reports: [], ['snapshot_at']: nextSnapshot });
    assert.deepEqual(useReportsStore.getState().reports, []);
    assert.equal(client.getQueryData(['report', 10]), null);
});
