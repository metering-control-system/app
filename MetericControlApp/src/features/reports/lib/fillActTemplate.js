export const fillActTemplate = (html, data, requiredFields = []) => {
    let result = html;

    const regex = /\{\{([^}]+)}}/g;

    let match;

    while ((match = regex.exec(html)) !== null) {
        const placeholder = `{{${match[1]}}}`;
        const value = match[1]
            .split('.')
            .reduce((acc, part) => acc?.[part], data);

        if (!value || !requiredFields.includes(match[1])) {
            result = result.replace(placeholder, '');
            continue;
        }

        result = result.replace(placeholder, () => value);
    }

    return result;
};
