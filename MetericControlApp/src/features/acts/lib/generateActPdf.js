import { printToFileAsync } from 'expo-print';
import { fillActTemplate } from '@/features/acts/lib/fillActTemplate';
import { createActChecksum } from '@/features/acts/lib/createActChecksum';

export const generateActPdf = async ({
    template,
    fields,
    actPdf: currentAct,
    previousAct,
}) => {
    if (!template?.html) throw new Error('Выберите шаблон акта.');
    const snapshot = JSON.parse(JSON.stringify({ fields, actPdf: currentAct }));
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
    const actFields = snapshot.fields;
    const checksum = await createActChecksum({
        template: templateSnapshot,
        fields: actFields,
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
