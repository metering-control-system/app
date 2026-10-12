export const state = {
    errors: [],
    submissions: [],
    useStorePictures: {
        photos: { report: {} },
        photoMetadata: { report: {} },
        removedPhotoIds: { report: {} },
    },
    useReportDraftStore: { drafts: {} },
    useReportActStore: { result: null, actMetadataByTask: {} },
    useActTemplatesStore: { templates: [] },
};
const noop = () => {};
for (const name of [
    'useStorePictures',
    'useReportDraftStore',
    'useReportActStore',
]) {
    for (const method of [
        'setDraft',
        'clearDraft',
        'appendPhoto',
        'setPhoto',
        'updatePhoto',
        'removePhotoAt',
        'clearEntityPhotos',
        'setEntityPhotoMetadata',
        'addRemovedPhotoId',
        'startSession',
        'clearSession',
    ])
        state[name][method] = noop;
}
export const store = (name) => {
    const hook = (selector) => selector(state[name]);
    hook.getState = () => state[name];
    return hook;
};
export const useSubmitReport = () => ({
    isPending: false,
    submitTaskReport: async (values) => {
        state.submissions.push(values);
        return { offline: true };
    },
});
