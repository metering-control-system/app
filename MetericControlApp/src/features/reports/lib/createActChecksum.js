import { CryptoDigestAlgorithm, digestStringAsync } from 'expo-crypto';
import { getActReportFields } from '@/features/reports/lib/getActReportFields';

export const createActChecksum = ({ values, template }) => {
    if (!template?.html) throw new Error('Выберите шаблон акта.');
    const content = JSON.stringify({
        version: 1,
        fields: getActReportFields(values),
        template: {
            id: String(template.id),
            html: template.html,
            requiredFields: [...new Set(template.requiredFields ?? [])].sort(),
        },
    });
    return digestStringAsync(CryptoDigestAlgorithm.SHA256, content);
};
