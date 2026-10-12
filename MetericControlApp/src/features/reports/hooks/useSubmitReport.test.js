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
        ['@/features/reports/store/useReportActStore', 'useReportActStore'],
    ].map(([specifier, name]) => [
        specifier,
        `data:text/javascript,${encodeURIComponent(`export { ${name} as default } from '${fixturesUrl}';`)}`,
    ])
);
const apiModules = new Set([
    '@/features/reports/api/submitReportApi',
    '@/features/tasks/api/getTaskByIdApi',
    '@/features/reports/lib/savePdfToDocuments',
    '@/features/reports/lib/validateReportAct',
    '@/features/reports/lib/validateReportUploadFiles',
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
    fixtures.api.lookupCount = 0;
    fixtures.api.lookupError = null;
    fixtures.api.updateError = null;
    fixtures.api.onLookup = null;
    fixtures.api.actCalls = [];
    fixtures.api.fileValidationError = null;
    fixtures.useNetwork.setState({ isChecked: true, isOnline: online });
    fixtures.useTasksStore.setState({
        tasks: [{ id: 1, ['is_team_task']: brigade }],
    });
    fixtures.useReportsStore.setState({ reports: [], snapshotAt: null });
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

for (const brigade of [false, true]) {
    test(`resubmits a rejected ${brigade ? 'brigade' : 'single'} report using fresh status`, async (t) => {
        const report = {
            id: 10,
            ['task_id']: 1,
            status: 'REJECTED',
            images: [],
        };
        const { client, submit } = await setup(t, { brigade, report });
        client.setQueryData(['report', 'task', 1], {
            ...report,
            status: 'ON_REVIEW',
        });
        const result = await submit();
        assert.equal(result.reportId, report.id);
        assert.equal(result.reportResponse.status, 'ON_REVIEW');
        assert.equal(fixtures.api.calls[0].operation, 'update');
        assert.equal(fixtures.api.calls[0].payload.status, 'ON_REVIEW');
        assert.equal(
            fixtures.useReportDraftStore.getState().getDraft('1'),
            undefined
        );
    });
}

test('prevents a brigade participant from overwriting an already submitted report, including from an old offline draft', async (t) => {
    const report = {
        id: 10,
        ['task_id']: 1,
        status: 'ON_REVIEW',
        images: [],
        ['updated_at']: '2026-10-06T12:00:00Z',
    };
    const { submit } = await setup(t, { brigade: true, report });
    const draft = { ...fixtures.createValues(), reportState: 'pending' };
    fixtures.useReportDraftStore.setState({ drafts: { 1: draft } });
    await assert.rejects(submit(draft, draft), /недоступен/);
    assert.deepEqual(fixtures.api.calls, []);
    assert.equal(
        isTaskReportReadOnly(
            fixtures.useTasksStore.getState().tasks[0],
            report,
            fixtures.useReportDraftStore.getState().getDraft('1')
        ),
        true
    );
});

test('keeps a failed brigade upload editable and resumes the same server report', async (t) => {
    const { submit } = await setup(t, { brigade: true });
    fixtures.api.commentError = new Error('network');
    const values = {
        ...fixtures.createValues(),
        comment: 'unfinished comment',
    };
    await assert.rejects(submit(values), /network/);
    const draft = JSON.parse(
        JSON.stringify(fixtures.useReportDraftStore.getState().getDraft('1'))
    );
    assert.equal(draft.reportState, 'error');
    assert.deepEqual(draft.submissionReport, {
        id: 10,
        updatedAt: fixtures.api.report.updated_at,
    });
    assert.equal(
        isTaskReportReadOnly(
            fixtures.useTasksStore.getState().tasks[0],
            fixtures.api.report,
            draft
        ),
        false
    );
    fixtures.useReportDraftStore.setState({ drafts: { 1: draft } });
    fixtures.api.commentError = null;
    const result = await submit(draft);
    assert.equal(result.reportId, 10);
    assert.deepEqual(
        fixtures.api.calls.map((call) => call.operation),
        ['create', 'update']
    );
    assert.equal(
        fixtures.useReportDraftStore.getState().getDraft('1'),
        undefined
    );
});

test('returns the persisted brigade submission revision for offline synchronization cleanup', async (t) => {
    const { submit } = await setup(t, { brigade: true, online: false });
    await submit();
    const draft = fixtures.useReportDraftStore.getState().getDraft('1');
    await act(async () => fixtures.useNetwork.setState({ isOnline: true }));
    const result = await submit(draft, draft);
    assert.deepEqual(
        fixtures.useReportDraftStore.getState().getDraft('1'),
        result.submittedDraft
    );
    assert.equal(result.submittedDraft.submissionReport.id, result.reportId);
});

for (const failure of ['lookupError', 'updateError']) {
    test(`preserves the brigade submission revision when a retry fails with ${failure}`, async (t) => {
        const { submit } = await setup(t, { brigade: true });
        const values = {
            ...fixtures.createValues(),
            comment: 'unfinished comment',
        };
        fixtures.api.commentError = new Error('comment failed');
        await assert.rejects(submit(values), /comment failed/);
        const previous = fixtures.useReportDraftStore.getState().getDraft('1');
        const editedValues = { ...values, comment: 'edited comment' };
        fixtures.api.commentError = null;
        fixtures.api[failure] = new Error('retry failed');

        await assert.rejects(submit(editedValues), /retry failed/);

        const draft = fixtures.useReportDraftStore.getState().getDraft('1');
        assert.equal(draft.comment, editedValues.comment);
        assert.equal(draft.reportState, 'error');
        assert.deepEqual(draft.submissionReport, previous.submissionReport);
        assert.equal(
            isTaskReportReadOnly(
                fixtures.useTasksStore.getState().tasks[0],
                fixtures.api.report,
                draft
            ),
            false
        );

        fixtures.api[failure] = null;
        const result = await submit(editedValues);
        assert.equal(result.reportId, previous.submissionReport.id);
        assert.deepEqual(
            fixtures.api.calls.map((call) => call.operation),
            ['create', 'update']
        );
        assert.equal(
            fixtures.useReportDraftStore.getState().getDraft('1'),
            undefined
        );
    });
}

test('a failed preflight lookup does not overwrite newer local edits', async (t) => {
    const { submit } = await setup(t, { brigade: true });
    const previous = { ...fixtures.createValues(), reportState: 'pending' };
    const edited = { ...previous, comment: 'new edits' };
    fixtures.useReportDraftStore.setState({ drafts: { 1: previous } });
    fixtures.api.onLookup = () =>
        fixtures.useReportDraftStore.setState({ drafts: { 1: edited } });
    fixtures.api.lookupError = new Error('lookup failed');

    await assert.rejects(submit(fixtures.createValues()), /lookup failed/);

    assert.deepEqual(
        fixtures.useReportDraftStore.getState().getDraft('1'),
        edited
    );
});

test('a failed initial lookup saves form values when no draft exists yet', async (t) => {
    const { submit } = await setup(t);
    const values = { ...fixtures.createValues(), comment: 'keep form values' };
    fixtures.api.lookupError = new Error('lookup failed');

    await assert.rejects(submit(values), /lookup failed/);

    assert.deepEqual(fixtures.useReportDraftStore.getState().getDraft('1'), {
        ...values,
        reportState: 'error',
    });
});

test('a failed brigade upload does not replace newer local edits with its old submission draft', async (t) => {
    const { submit } = await setup(t, { brigade: true });
    const edited = { ...fixtures.createValues(), comment: 'new edits' };
    fixtures.api.onWrite = () =>
        fixtures.useReportDraftStore.setState({ drafts: { 1: edited } });
    fixtures.api.commentError = new Error('network');
    await assert.rejects(
        submit({ ...fixtures.createValues(), comment: 'old comment' }),
        /network/
    );
    assert.deepEqual(
        fixtures.useReportDraftStore.getState().getDraft('1'),
        edited
    );
});

for (const brigade of [false, true]) {
    for (const existingAct of [false, true]) {
        test(`${brigade ? 'brigade' : 'single'} submission keeps the ${existingAct ? 'updated' : 'uploaded'} act response without another lookup`, async (t) => {
            const report = existingAct
                ? {
                      id: 10,
                      ['task_id']: 1,
                      status: 'REJECTED',
                      images: [],
                      act: {
                          ['client_act_id']:
                              '39e4518d-2bec-4d03-9082-e1d141f45e15',
                      },
                  }
                : null;
            const { client, submit } = await setup(t, { brigade, report });
            const result = await submit({
                ...fixtures.createValues(),
                actPdf: { uri: 'file://act.pdf', isRefused: false },
            });
            assert.equal(fixtures.api.lookupCount, 1);
            assert.equal(
                fixtures.api.actCalls[0].operation,
                existingAct ? 'update' : 'upload'
            );
            assert.deepEqual(
                result.reportResponse.act,
                fixtures.api.report.act
            );
            assert.equal(
                result.reportResponse.updated_at,
                fixtures.api.report.updated_at
            );
            assert.deepEqual(
                fixtures.useReportsStore.getState().reports[0].act,
                fixtures.api.report.act
            );
            assert.deepEqual(
                client.getQueryData(['report', 10]).act,
                fixtures.api.report.act
            );
            assert.deepEqual(
                client.getQueryData(['report', 'task', 1]).act,
                fixtures.api.report.act
            );
            if (existingAct)
                assert.equal(
                    result.reportResponse.act.client_act_id,
                    report.act.client_act_id
                );
        });
    }
}

test('a comment failure after a successful act upload keeps the current brigade revision for retry', async (t) => {
    const { submit } = await setup(t, { brigade: true });
    fixtures.api.commentError = new Error('comment network error');
    const values = {
        ...fixtures.createValues(),
        actPdf: { uri: 'file://act.pdf', isRefused: false },
        comment: 'comment',
    };
    await assert.rejects(submit(values), /comment network error/);
    const draft = fixtures.useReportDraftStore.getState().getDraft('1');
    assert.equal(fixtures.api.lookupCount, 1);
    assert.equal(
        draft.submissionReport.updatedAt,
        fixtures.api.report.updated_at
    );
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
    assert.equal(fixtures.api.lookupCount, 2);
    assert.deepEqual(result.reportResponse.act, fixtures.api.report.act);
});

test('invalid fields prevent both interactive and queued drafts from making API requests', async (t) => {
    const { submit } = await setup(t);
    const values = fixtures.createValues();
    values.metering.installationReading = '1.1234';
    await assert.rejects(submit(values), (error) => {
        assert.equal(error.code, 'REPORT_VALIDATION_ERROR');
        assert.equal(
            error.validationErrors.metering.installationReading.message,
            'Введите показания: до 9 цифр до запятой и до 3 после'
        );
        return true;
    });
    assert.equal(fixtures.api.lookupCount, 0);
    assert.equal(fixtures.api.calls.length, 0);
    assert.equal(
        fixtures.useReportDraftStore.getState().getDraft('1').metering
            .installationReading,
        '1.1234'
    );
    const queued = { ...values, reportState: 'pending' };
    fixtures.useReportDraftStore
        .getState()
        .setDraft({ draftId: '1', values: queued });
    await assert.rejects(submit(queued, queued), {
        code: 'REPORT_VALIDATION_ERROR',
    });
    assert.equal(fixtures.api.calls.length, 0);
});

test('invalid files fail before saving server data and retain the entered report', async (t) => {
    const { submit } = await setup(t);
    fixtures.api.fileValidationError = Object.assign(
        new Error('Файл повреждён'),
        { code: 'REPORT_VALIDATION_ERROR' }
    );
    const values = fixtures.createValues();
    values.comment = 'Сохранить мой комментарий';
    await assert.rejects(submit(values), { code: 'REPORT_VALIDATION_ERROR' });
    assert.equal(fixtures.api.calls.length, 0);
    assert.equal(
        fixtures.useReportDraftStore.getState().getDraft('1').comment,
        values.comment
    );
});
