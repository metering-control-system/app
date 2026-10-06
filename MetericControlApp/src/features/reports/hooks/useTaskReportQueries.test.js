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
loader.deregister();

const task = { id: 1, ['is_team_task']: false };
const report = { id: 10, ['task_id']: task.id, status: 'REJECTED' };
const responseFor = (kind, report) =>
    kind === 'single'
        ? report
        : { reports: [report], ['snapshot_at']: '2026-10-06T12:00:00Z' };

const setup = async (t, kind, brigade = false) => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    requests.length = 0;
    useNetwork.setState({ isChecked: true, isOnline: true });
    useReportsStore.setState({ reports: [] });
    useReportDraftStore.setState({ drafts: {} });
    const client = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    const roots = [];
    let current;
    const useSelectedTaskReport = () =>
        useTaskReport({ ...task, ['is_team_task']: brigade });
    const useReportQuery =
        kind === 'single' ? useSelectedTaskReport : useTaskReports;
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
            useReportsStore.setState({ reports: [] });
        });
    };
    t.after(async () => {
        await logout();
        client.clear();
        delete globalThis.IS_REACT_ACT_ENVIRONMENT;
    });
    await mount();
    assert.equal(requests.length, 1);
    assert.ok(requests[0].signal);
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
