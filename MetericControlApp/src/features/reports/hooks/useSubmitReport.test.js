import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import test from 'node:test';
import { createElement } from 'react';
import { act, create } from 'react-test-renderer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as fixtures from './fixtures/taskReportSubmission.js';
import { isTaskReportReadOnly } from '../../tasks/lib/taskReportVisibility.js';

const fixturesUrl = new URL(
    './fixtures/taskReportSubmission.js',
    import.meta.url
).href;
const replacements = new Map(
    [
        ['@/shared/hooks/offline/useNetwork', 'useNetwork'],
        ['@/features/tasks/store/useTasksStore', 'useTasksStore'],
        ['@/features/reports/store/useReportsStore', 'useReportsStore'],
        ['@/features/reports/store/useReportDraftStore', 'useReportDraftStore'],
        ['@/shared/store/useStorePictures', 'useStorePictures'],
    ].map(([specifier, name]) => [
        specifier,
        `data:text/javascript,${encodeURIComponent(`export { ${name} as default } from '${fixturesUrl}';`)}`,
    ])
);
const apiModules = new Set([
    '@/features/reports/api/submitReportApi',
    '@/features/tasks/api/getTaskByIdApi',
    '@/features/reports/lib/savePdfToDocuments',
]);
const loader = registerHooks({
    resolve(specifier, context, nextResolve) {
        if (replacements.has(specifier)) {
            return { url: replacements.get(specifier), shortCircuit: true };
        }
        if (apiModules.has(specifier))
            return { url: fixturesUrl, shortCircuit: true };
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
const { default: useSubmitReport } = await import('./useSubmitReport.js');
loader.deregister();

const setup = async (
    t,
    { brigade = false, report = null, online = true } = {}
) => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    fixtures.api.report = report;
    fixtures.api.calls = [];
    fixtures.api.commentError = null;
    fixtures.api.onWrite = null;
    fixtures.useNetwork.setState({ isChecked: true, isOnline: online });
    fixtures.useTasksStore.setState({
        tasks: [{ id: 1, ['is_team_task']: brigade }],
    });
    fixtures.useReportsStore.setState({ reports: [] });
    fixtures.useReportDraftStore.setState({ drafts: {} });
    fixtures.useStorePictures.setState({ photoMetadata: { report: {} } });
    const client = new QueryClient({
        defaultOptions: { mutations: { retry: false } },
    });
    let submission;
    const Harness = () => {
        submission = useSubmitReport();
        return null;
    };
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
    t.after(async () => {
        await act(async () => root.unmount());
        client.clear();
        delete globalThis.IS_REACT_ACT_ENVIRONMENT;
    });
    return {
        client,
        submit: async (values = fixtures.createValues(), expectedDraft) => {
            let result;
            await act(async () => {
                result = await submission.submitTaskReport({
                    taskId: 1,
                    values,
                    expectedDraft,
                });
            });
            return result;
        },
    };
};

test('locks a single task after the complete submission succeeds', async (t) => {
    const { submit } = await setup(t);
    const result = await submit();
    assert.equal(result.reportId, 10);
    assert.equal(
        isTaskReportReadOnly(
            fixtures.useTasksStore.getState().tasks[0],
            fixtures.useReportsStore.getState().reports[0]
        ),
        true
    );
});

test('persists online single submissions before the server changes and clears them after success', async (t) => {
    const { submit } = await setup(t);
    const values = {
        ...fixtures.createValues(),
        comment: 'unfinished comment',
    };
    fixtures.api.onWrite = (report) => {
        const draft = fixtures.useReportDraftStore.getState().getDraft('1');
        assert.deepEqual(draft, { ...values, reportState: 'pending' });
        fixtures.useReportsStore.getState().setUpdatedReports([report]);
        assert.equal(
            isTaskReportReadOnly(
                fixtures.useTasksStore.getState().tasks[0],
                fixtures.useReportsStore.getState().reports[0],
                draft
            ),
            false
        );
    };
    await submit(values);
    assert.equal(
        fixtures.useReportDraftStore.getState().getDraft('1'),
        undefined
    );
    assert.equal(
        isTaskReportReadOnly(
            fixtures.useTasksStore.getState().tasks[0],
            fixtures.api.report
        ),
        true
    );
});

test('resumes a persisted online submission after restart using the same report', async (t) => {
    const { submit } = await setup(t);
    let persistedDraft;
    let partialReport;
    fixtures.api.onWrite = (report) => {
        persistedDraft = JSON.parse(
            JSON.stringify(
                fixtures.useReportDraftStore.getState().getDraft('1')
            )
        );
        partialReport = { ...report };
    };
    await submit({ ...fixtures.createValues(), comment: 'unfinished comment' });
    fixtures.api.onWrite = null;
    fixtures.api.report = partialReport;
    fixtures.api.calls = [];
    fixtures.useReportDraftStore.setState({ drafts: { 1: persistedDraft } });
    assert.equal(
        isTaskReportReadOnly(
            fixtures.useTasksStore.getState().tasks[0],
            partialReport,
            persistedDraft
        ),
        false
    );
    const result = await submit(persistedDraft, persistedDraft);
    assert.equal(result.reportId, partialReport.id);
    assert.equal(fixtures.api.calls[0].operation, 'update');
    assert.deepEqual(
        fixtures.useReportDraftStore.getState().getDraft('1'),
        persistedDraft
    );
});

test('preserves a newer draft when an online submission succeeds', async (t) => {
    const { submit } = await setup(t);
    const newerDraft = {
        ...fixtures.createValues(),
        comment: 'new edits',
        reportState: 'pending',
    };
    fixtures.api.onWrite = () => {
        fixtures.useReportDraftStore.setState({ drafts: { 1: newerDraft } });
    };
    await submit();
    assert.deepEqual(
        fixtures.useReportDraftStore.getState().getDraft('1'),
        newerDraft
    );
});

test('keeps failed partial submissions editable and retries the same report', async (t) => {
    const { submit } = await setup(t);
    fixtures.api.commentError = new Error('network');
    const values = { ...fixtures.createValues(), comment: 'comment' };
    await assert.rejects(submit(values), /network/);
    assert.deepEqual(fixtures.useReportsStore.getState().reports, []);
    const draft = fixtures.useReportDraftStore.getState().getDraft('1');
    assert.equal(draft.reportState, 'error');
    assert.equal(
        isTaskReportReadOnly(
            fixtures.useTasksStore.getState().tasks[0],
            fixtures.api.report,
            draft
        ),
        false
    );
    fixtures.api.commentError = null;
    const result = await submit(values);
    assert.equal(result.reportId, 10);
    assert.deepEqual(
        fixtures.api.calls.map((call) => call.operation),
        ['create', 'update']
    );
});

test('leaves an offline submission pending without calling the backend', async (t) => {
    const { submit } = await setup(t, { online: false });
    assert.equal((await submit()).offline, true);
    assert.equal(
        fixtures.useReportDraftStore.getState().getDraft('1').reportState,
        'pending'
    );
    assert.deepEqual(fixtures.api.calls, []);
    assert.deepEqual(fixtures.useReportsStore.getState().reports, []);
});

test('hides a synchronized offline task after its sent draft is cleared', async (t) => {
    const { submit } = await setup(t, { online: false });
    await submit();
    await act(async () => fixtures.useNetwork.setState({ isOnline: true }));
    await submit();
    fixtures.useReportDraftStore.setState({ drafts: {} });
    assert.equal(
        isTaskReportReadOnly(
            fixtures.useTasksStore.getState().tasks[0],
            fixtures.useReportsStore.getState().reports[0],
            fixtures.useReportDraftStore.getState().getDraft('1')
        ),
        true
    );
});

test('uses the current rejection instead of a stale cached review status', async (t) => {
    const report = { id: 10, ['task_id']: 1, status: 'REJECTED', images: [] };
    const { client, submit } = await setup(t, { report });
    client.setQueryData(['report', 'task', 1], {
        ...report,
        status: 'ON_REVIEW',
    });
    const result = await submit();
    assert.equal(result.reportId, 10);
    assert.equal(fixtures.api.calls[0].payload.status, 'ON_REVIEW');
});

test('prevents a repeated submission without creating an editable error draft', async (t) => {
    const report = { id: 10, ['task_id']: 1, status: 'ON_REVIEW', images: [] };
    const { submit } = await setup(t, { report });
    await assert.rejects(submit(), /недоступен/);
    assert.deepEqual(fixtures.api.calls, []);
    assert.equal(
        fixtures.useReportDraftStore.getState().getDraft('1'),
        undefined
    );
});

test('stops retrying an old pending draft after the admin accepts its report', async (t) => {
    const report = { id: 10, ['task_id']: 1, status: 'ACCEPTED', images: [] };
    const { submit } = await setup(t, { report });
    fixtures.useReportDraftStore.setState({
        drafts: { 1: { ...fixtures.createValues(), reportState: 'pending' } },
    });
    await assert.rejects(submit(), /недоступен/);
    assert.equal(
        fixtures.useReportDraftStore.getState().getDraft('1').reportState,
        'error'
    );
    assert.deepEqual(fixtures.api.calls, []);
});

test('preserves brigade editing and leaves its rejected status unchanged', async (t) => {
    const report = { id: 10, ['task_id']: 1, status: 'REJECTED', images: [] };
    const { submit } = await setup(t, { brigade: true, report });
    fixtures.api.onWrite = () => {
        assert.equal(
            fixtures.useReportDraftStore.getState().getDraft('1'),
            undefined
        );
    };
    const result = await submit();
    assert.equal(result.reportResponse.status, 'REJECTED');
    assert.equal(Object.hasOwn(fixtures.api.calls[0].payload, 'status'), false);
});
