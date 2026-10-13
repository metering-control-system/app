import { printToFileAsync } from 'expo-print';
import { fillActTemplate } from '@/features/reports/lib/fillActTemplate';
import { getActReportFields } from './getActReportFields';
import { createActChecksum } from './createActChecksum';

export const generateActPdf = async ({ template, values, previousAct }) => {
    if (!template?.html) throw new Error('Выберите шаблон акта.');
    const snapshot = JSON.parse(JSON.stringify(values));
    const templateSnapshot = {
        ...template,
        requiredFields: [...(template.requiredFields ?? [])],
    };
    const actPdf = {
        ...snapshot.actPdf,
        isRefused: false,
        templateId: String(templateSnapshot.id),
        signatures: {},
    };
    const actFields = getActReportFields(snapshot);
    const checksum = await createActChecksum({
        template: templateSnapshot,
        values: snapshot,
    });
    const savedAct = previousAct ?? snapshot.actPdf;
    actPdf.signatures =
        savedAct?.checksum === checksum ? (savedAct.signatures ?? {}) : {};
    const html = fillActTemplate(
        templateSnapshot.html,
        { ...actFields, actPdf: { signatures: actPdf.signatures } },
        templateSnapshot.requiredFields
    );
    const { uri } = await printToFileAsync({ html });
    return { ...actPdf, uri, checksum };
};
