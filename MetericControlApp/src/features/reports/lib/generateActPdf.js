import { printToFileAsync } from 'expo-print';
import { fillActTemplate } from '@/features/reports/lib/fillActTemplate';
import { getActReportFields } from './getActReportFields';
import { createActChecksum } from './createActChecksum';

export const generateActPdf = async ({
    template,
    values,
    resetSignatures = false,
}) => {
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
        signatures: resetSignatures ? {} : (snapshot.actPdf?.signatures ?? {}),
    };
    const normalizedValues = {
        ...snapshot,
        ...getActReportFields(snapshot),
        actPdf,
    };
    const checksum = await createActChecksum({
        template: templateSnapshot,
        values: normalizedValues,
    });
    const html = fillActTemplate(
        templateSnapshot.html,
        normalizedValues,
        templateSnapshot.requiredFields
    );
    const { uri } = await printToFileAsync({ html });
    return { ...actPdf, uri, checksum };
};
