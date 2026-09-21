const pendingSubmissions = new Map();

export const enqueueReportSubmission = (taskId, submit) => {
    const queueKey = String(taskId);
    const previousSubmission =
        pendingSubmissions.get(queueKey) ?? Promise.resolve();
    const currentSubmission = previousSubmission
        .catch(() => undefined)
        .then(submit);

    pendingSubmissions.set(queueKey, currentSubmission);

    return currentSubmission.finally(() => {
        if (pendingSubmissions.get(queueKey) === currentSubmission) {
            pendingSubmissions.delete(queueKey);
        }
    });
};

export const isCurrentReportDraft = (expectedDraft, currentDraft) =>
    !expectedDraft || expectedDraft === currentDraft;
