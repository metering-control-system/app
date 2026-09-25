const wait = (delayMs) =>
    new Promise((resolve) => {
        setTimeout(resolve, delayMs);
    });

export const isRetryableImageUploadError = (error) => {
    const status = error?.response?.status;

    return (
        !status ||
        status === 408 ||
        status === 425 ||
        status === 429 ||
        status >= 500
    );
};

export const retryReportImageUpload = async (
    upload,
    { maxRetries = 5, baseDelayMs = 300, waitForRetry = wait } = {}
) => {
    let retryCount = 0;

    while (true) {
        try {
            return await upload();
        } catch (error) {
            if (
                retryCount >= maxRetries ||
                !isRetryableImageUploadError(error)
            ) {
                throw error;
            }

            const delayMs = baseDelayMs * 2 ** retryCount;
            retryCount += 1;
            await waitForRetry(delayMs);
        }
    }
};
