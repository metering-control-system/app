import { FORM_FIELDS_MAP } from '@/features/comments/constants/formFieldsMap';

export const detectReference = (message) => {
    return FORM_FIELDS_MAP[message];
};
