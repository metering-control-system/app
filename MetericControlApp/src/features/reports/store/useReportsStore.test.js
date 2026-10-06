import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import test from 'node:test';

const storageUrl = `data:text/javascript,${encodeURIComponent(`
    export const reportOfflineStorage = {
        value: null,
        getString() { return this.value; },
        set(name, value) { this.value = value; },
        remove() { this.value = null; },
    };
`)}`;
const { reportOfflineStorage } = await import(storageUrl);
const cachedReports = [
    {
        id: 1,
        ['task_id']: 10,
        status: 'REJECTED',
        ['consumer_contact']: { ['last_name']: 'Иванов' },
        metering: { ['new_meter_number']: 'METER-123' },
    },
    {
        id: 2,
        ['task_id']: 20,
        status: 'ACCEPTED',
        ['consumer_contact']: { ['last_name']: 'Петров' },
        metering: { ['new_meter_number']: 'METER-456' },
    },
];
const persistReports = (reports) => {
    reportOfflineStorage.set(
        'reports-store',
        JSON.stringify({ state: { reports }, version: 0 })
    );
};
persistReports(cachedReports);

const loader = registerHooks({
    resolve(specifier, context, nextResolve) {
        if (specifier === '@/features/reports/store/reportOfflineStorage') {
            return { url: storageUrl, shortCircuit: true };
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
const { default: useReportsStore } = await import('./useReportsStore.js');
const { filterBySearch } =
    await import('../../../shared/lib/collections/filterBySearch.js');
loader.deregister();

const search = (input) =>
    filterBySearch({ query: useReportsStore.getState().reports, input }).map(
        (report) => report.id
    );

test('shows all cached reports immediately after automatic hydration without a server request', () => {
    assert.equal(useReportsStore.persist.hasHydrated(), true);
    assert.deepEqual(search(''), [1, 2]);
    assert.deepEqual(
        useReportsStore
            .getState()
            .reports.map((report) => ({ ...report, search: undefined })),
        cachedReports.map((report) => ({ ...report, search: undefined }))
    );
});

test('searches only the matching restored report by name or meter number', () => {
    assert.deepEqual(search('ИВАНОВ'), [1]);
    assert.deepEqual(search('meter-456'), [2]);
    assert.deepEqual(search('нет такого отчёта'), []);
});

test('restores search fields on manual hydration without persisting them', async () => {
    persistReports(cachedReports);
    await useReportsStore.persist.rehydrate();
    assert.deepEqual(search('Петров'), [2]);
    useReportsStore.getState().setUpdatedReports([]);
    const persisted = JSON.parse(
        reportOfflineStorage.getString('reports-store')
    );
    assert.ok(
        persisted.state.reports.every(
            (report) => !Object.hasOwn(report, 'search')
        )
    );
    await useReportsStore.persist.rehydrate();
    assert.deepEqual(search('meter-123'), [1]);
});

test('keeps an empty or cleared report cache empty during hydration', async () => {
    for (const reports of [[], null]) {
        persistReports(reports);
        await useReportsStore.persist.rehydrate();
        assert.deepEqual(useReportsStore.getState().reports, reports);
        assert.equal(useReportsStore.persist.hasHydrated(), true);
    }
});
