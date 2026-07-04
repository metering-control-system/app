import { FORM_FIELDS_MAP } from '@/features/comments/constants/formFieldsMap';

export const detectReference = (message) => {
    return FORM_FIELDS_MAP[message];
};

export const filterDetectedReferences = (message) => {
    if (!message.startsWith('@')) {
        return null;
    }

    const references = [];

    for (const ref in FORM_FIELDS_MAP) {
        if (ref.includes(message)) {
            references.push(ref);
        }
    }
    return references;
};
