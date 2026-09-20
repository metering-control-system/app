const unavailableFields = [
    'photos',
    'admission',
    'comment',
    'isRefusedContact',
    'isActualDifferent',
];

export const fillActTemplate = (html, data) => {
    let result = html;

    const regex = /\{\{([^}]+)}}/g;

    let match;

    while ((match = regex.exec(html)) !== null) {
        const path = match[1];
        const value = path.split('.').reduce((acc, part) => acc?.[part], data);

        if (!value || unavailableFields.includes(path.split('.').at(-1))) {
            result = result.replace(`{{${path}}}`, '');
        }

        result = result.replace(`{{${path}}}`, value);
    }

    return result;
};
