import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import { createElement } from 'react';
import { act, create } from 'react-test-renderer';

const require = createRequire(import.meta.url);
const { transformSync } = require('@babel/core');
const { code } = transformSync(
    readFileSync(new URL('./taskList.jsx', import.meta.url), 'utf8'),
    {
        babelrc: false,
        configFile: false,
        plugins: [
            ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }],
            '@babel/plugin-transform-modules-commonjs',
        ],
    }
);

const setup = async (t, { updateTasks, refreshReports, sync }) => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    const errors = [];
    const modules = {
        'react-native': {
            FlatList: 'FlatList',
            View: 'View',
            Text: 'Text',
            StyleSheet: { create: (styles) => styles },
        },
        task: () => null,
        screenLoader: () => null,
        useTasks: () => ({ isPending: false, hasNextPage: false }),
        useUpdateTasks: () => ({ updateTasks, isPending: false }),
        useTaskReports: () => ({
            refreshReports,
            isPending: false,
            isFetching: false,
        }),
        useTasksStore: (selector) => selector({ tasks: [] }),
        useReportsStore: (selector) => selector({ reports: [] }),
        useReportDraftStore: (selector) => selector({ drafts: {} }),
        taskStatus: { taskStatus: {} },
        taskPriority: { taskPriority: {} },
        sortTasks: { sortBy: (tasks) => tasks },
        filterTasks: { filterBy: (_options, tasks) => tasks },
        filterBySearch: { filterBySearch: ({ query }) => query },
        taskReportVisibility: { filterSubmittedTasks: (tasks) => tasks },
        reportUpsert: { selectReportForTask: () => null },
    };
    const module = { exports: {} };
    const load = (specifier) =>
        modules[specifier] ??
        modules[specifier.split('/').at(-1)] ??
        require(specifier);
    new Function('require', 'module', 'exports', code)(
        load,
        module,
        module.exports
    );
    let root;
    await act(async () => {
        root = create(
            createElement(module.exports.default, {
                setError: (error) => errors.push(error),
                filtering: new Set(),
                syncingRecords: {},
                sync,
            })
        );
    });
    t.after(async () => {
        await act(async () => root.unmount());
        delete globalThis.IS_REACT_ACT_ENVIRONMENT;
    });
    return { errors, list: () => root.root.findByType('FlatList') };
};

test('a report refresh failure still starts draft synchronization and keeps the spinner until it finishes', async (t) => {
    let taskUpdates = 0;
    let syncCalls = 0;
    let finishSync;
    const pendingSync = new Promise((resolve) => {
        finishSync = resolve;
    });
    const { list, errors } = await setup(t, {
        updateTasks: () => taskUpdates++,
        refreshReports: async () => {
            throw new Error('refresh failed');
        },
        sync: () => {
            syncCalls++;
            return pendingSync;
        },
    });
    let refreshing;
    await act(async () => {
        refreshing = list().props.onRefresh();
    });

    assert.equal(taskUpdates, 1);
    assert.equal(syncCalls, 1);
    assert.equal(list().props.refreshing, true);

    await act(async () => {
        finishSync(0);
        await refreshing;
    });
    assert.equal(list().props.refreshing, false);
    assert.equal(errors.at(-1), 'Не удалось обновить статусы отчётов.');
});

test('synchronous update errors do not prevent other operations and sync rejection is handled', async (t) => {
    let reportRefreshes = 0;
    let syncCalls = 0;
    const { list, errors } = await setup(t, {
        updateTasks: () => {
            throw new Error('update failed');
        },
        refreshReports: async () => reportRefreshes++,
        sync: async () => {
            syncCalls++;
            throw new Error('sync failed');
        },
    });

    await act(async () => list().props.onRefresh());

    assert.equal(reportRefreshes, 1);
    assert.equal(syncCalls, 1);
    assert.equal(list().props.refreshing, false);
    assert.equal(errors.at(-1), 'Не удалось синхронизировать отчёты.');
});

test('reports the number of unsynchronized drafts after independent refreshes', async (t) => {
    const { list, errors } = await setup(t, {
        updateTasks: () => undefined,
        refreshReports: async () => undefined,
        sync: async () => 2,
    });

    await act(async () => list().props.onRefresh());

    assert.equal(list().props.refreshing, false);
    assert.equal(errors.at(-1), 'Не синхронизировано отчётов: 2.');
});

test('does not show an error when all refresh operations succeed', async (t) => {
    const { list, errors } = await setup(t, {
        updateTasks: () => undefined,
        refreshReports: async () => undefined,
        sync: async () => 0,
    });

    await act(async () => list().props.onRefresh());

    assert.equal(list().props.refreshing, false);
    assert.deepEqual(errors.filter(Boolean), []);
});
