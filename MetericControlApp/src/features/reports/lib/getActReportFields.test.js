import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import test from 'node:test';
import { getActReportFields } from '@/features/reports/lib/getActReportFields';

const moduleUrl = (source) =>
    `data:text/javascript,${encodeURIComponent(source)}`;
const printUrl = moduleUrl(`
    export const printedHtml = [];
    export const printToFileAsync = async ({ html }) => {
        printedHtml.push(html);
        return { uri: 'file:///report-act.pdf' };
    };
`);
const actStoreUrl = moduleUrl(`
    const state = { actMetadataByTask: {} };
    export default { getState: () => state };
`);
const templatesStoreUrl = moduleUrl(`
    const state = { templates: [] };
    export default { getState: () => state };
`);
const replacements = new Map([
    ['expo-print', printUrl],
    [
        'expo-crypto',
        moduleUrl(`
            import { createHash } from 'node:crypto';
            export const CryptoDigestAlgorithm = { SHA256: 'sha256' };
            export const digestStringAsync = async (algorithm, value) =>
                createHash(algorithm).update(value).digest('hex');
        `),
    ],
    ['expo-file-system', moduleUrl('export class File { exists = true; }')],
    ['@/features/acts/store/useActStore', actStoreUrl],
    ['@/features/acts/store/useActTemplatesStore', templatesStoreUrl],
]);
const loader = registerHooks({
    resolve(specifier, context, nextResolve) {
        if (replacements.has(specifier))
            return { url: replacements.get(specifier), shortCircuit: true };
        if (specifier.startsWith('@/'))
            return {
                url: new URL(
                    `../../../${specifier.slice(2)}.js`,
                    import.meta.url
                ).href,
                shortCircuit: true,
            };
        if (specifier.startsWith('./') && !specifier.endsWith('.js'))
            return nextResolve(`${specifier}.js`, context);
        return nextResolve(specifier, context);
    },
});
const { generateActPdf: generatePdf } =
    await import('@/features/acts/lib/generateActPdf');
const { createActChecksum: checksumAct } =
    await import('@/features/acts/lib/createActChecksum');
const { validateAct } = await import('@/features/acts/lib/validateAct');
const { printedHtml } = await import(printUrl);
const { default: actStore } = await import(actStoreUrl);
const { default: templatesStore } = await import(templatesStoreUrl);
loader.deregister();

const generateActPdf = ({ values, ...options }) =>
    generatePdf({
        ...options,
        fields: getActReportFields(values),
        actPdf: values.actPdf,
    });
const createActChecksum = ({ values, template }) =>
    checksumAct({ fields: getActReportFields(values), template });
const validateReportAct = ({ taskId, values }) =>
    validateAct({
        taskId,
        actPdf: values.actPdf,
        fields: getActReportFields(values),
    });

const actDetails = {
    compiledAt: '12.10.2026 11:40',
    representativePosition: 'Инженер',
    representativeName: 'Иванов Иван',
    powerOfAttorneyNumber: 'Д-123',
    powerOfAttorneyDate: '01.10.2026',
    utilityRepresentativeName: 'Петров Пётр',
};
const template = {
    id: 1,
    html: Object.keys(actDetails)
        .map((field) => `<p>{{actDetails.${field}}}</p>`)
        .join(''),
    requiredFields: Object.keys(actDetails).map(
        (field) => `actDetails.${field}`
    ),
};

test('generated act includes all six report details with HTML escaping', async () => {
    const values = {
        actDetails: { ...actDetails, representativeName: 'Иванов <Иван>' },
    };
    await generateActPdf({ template, values });
    assert.equal(
        printedHtml.at(-1),
        Object.values(values.actDetails)
            .map((value) => `<p>${value.replace('<Иван>', '&lt;Иван&gt;')}</p>`)
            .join('')
    );
});

test('each changed report detail blocks a stale act and clears signatures on regeneration', async () => {
    const values = { actDetails: { ...actDetails } };
    const checksum = await createActChecksum({ values, template });
    const savedAct = {
        uri: 'file:///report-act.pdf',
        templateId: '1',
        checksum,
        signatures: { master: [[{ x: 1, y: 2 }]] },
    };
    actStore.getState().actMetadataByTask['1'] = savedAct;
    templatesStore.getState().templates = [template];
    await validateReportAct({
        taskId: 1,
        values: { ...values, actPdf: savedAct },
    });

    for (const field of Object.keys(actDetails)) {
        const changed = {
            ...values,
            actDetails: {
                ...actDetails,
                [field]: `${actDetails[field]} изменено`,
            },
            actPdf: savedAct,
        };
        await assert.rejects(
            validateReportAct({ taskId: 1, values: changed }),
            /Данные отчёта или шаблон изменились/,
            field
        );
        const regenerated = await generateActPdf({ template, values: changed });
        assert.notEqual(regenerated.checksum, checksum, field);
        assert.deepEqual(regenerated.signatures, {}, field);
    }
    assert.deepEqual(savedAct.signatures, { master: [[{ x: 1, y: 2 }]] });
});

test('report detail normalization is stable through generation and checksum validation', async () => {
    const values = {
        actDetails: { ...actDetails, representativeName: '  Иванов Иван  ' },
    };
    const projected = getActReportFields(values);
    assert.equal(projected.actDetails.representativeName, 'Иванов Иван');
    assert.deepEqual(getActReportFields(projected), projected);
    assert.deepEqual(getActReportFields({}).actDetails, {});
    assert.equal(
        await createActChecksum({ values, template }),
        await createActChecksum({ values: projected, template })
    );
});
