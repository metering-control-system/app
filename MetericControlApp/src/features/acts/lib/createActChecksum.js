import { CryptoDigestAlgorithm, digestStringAsync } from 'expo-crypto';

export const createActChecksum = ({ fields, template }) => {
    if (!template?.html) throw new Error('Выберите шаблон акта.');
    const content = JSON.stringify({
        version: 1,
        fields,
        template: {
            id: String(template.id),
            html: template.html,
            requiredFields: [...new Set(template.requiredFields ?? [])].sort(),
        },
    });
    return digestStringAsync(CryptoDigestAlgorithm.SHA256, content);
};
