export const detectReference = (message, references) =>
    references?.[message?.toUpperCase()];

export const filterDetectedReferences = (message, references) => {
    if (!message.startsWith('@')) return [];
    return Object.keys(references ?? {}).filter((reference) =>
        reference.includes(message.toUpperCase())
    );
};
