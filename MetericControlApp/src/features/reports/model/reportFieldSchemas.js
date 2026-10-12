import { z } from 'zod';

const isValidText = (value) =>
    [...value].every((character) => {
        const code = character.codePointAt(0);
        return code !== 0 && !(code >= 0xd800 && code <= 0xdfff);
    });

export const reportTextSchema = (maxLength, message) => {
    let schema = z
        .string({ error: 'Введите значение в правильном формате' })
        .trim()
        .refine(isValidText, 'Уберите недопустимые символы');
    if (maxLength != null)
        schema = schema.refine(
            (value) => [...value].length <= maxLength,
            message
        );
    return schema;
};

const numericInput = (schema) =>
    z.preprocess(
        (value) =>
            value == null
                ? ''
                : typeof value === 'number'
                  ? String(value)
                  : value,
        schema
    );

export const reportReadingSchema = (requiredMessage) => {
    let schema = reportTextSchema();
    if (requiredMessage) schema = schema.min(1, requiredMessage);
    return numericInput(
        schema.refine(
            (value) =>
                !value ||
                /^[+-]?(?:\d{1,9}(?:[.,]\d{0,3})?|[.,]\d{1,3})$/.test(value),
            'Введите показания: до 9 цифр до запятой и до 3 после'
        )
    );
};

export const reportIntegerSchema = () =>
    numericInput(
        reportTextSchema().refine(
            (value) =>
                !value || (/^\d+$/.test(value) && Number(value) <= 32767),
            'Введите целое число от 0 до 32767'
        )
    );

export const reportChoiceSchema = (options, requiredMessage) => {
    let schema = reportTextSchema();
    if (requiredMessage) schema = schema.min(1, requiredMessage);
    return schema.refine(
        (value) => !value || options.some((option) => option.value === value),
        'Выберите значение из списка'
    );
};
