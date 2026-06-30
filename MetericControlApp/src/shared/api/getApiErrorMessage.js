const normalizeErrorEntry = (value) => {
    if (Array.isArray(value)) {
        return value
            .map((item) => normalizeErrorEntry(item))
            .filter(Boolean)
            .join(', ');
    }

    if (value && typeof value === 'object') {
        return Object.values(value)
            .map((item) => normalizeErrorEntry(item))
            .filter(Boolean)
            .join(', ');
    }

    if (value === null || value === undefined) {
        return '';
    }

    return String(value).trim();
};

export const getApiErrorMessage = (error, fallbackMessage) => {
    const responseData = error?.response?.data;

    if (
        typeof responseData?.detail === 'string' &&
        responseData.detail.trim()
    ) {
        return responseData.detail.trim();
    }

    const normalizedResponseMessage = normalizeErrorEntry(responseData);

    if (normalizedResponseMessage) {
        return normalizedResponseMessage;
    }

    if (typeof error?.message === 'string' && error.message.trim()) {
        return error.message.trim();
    }

    return fallbackMessage;
};
