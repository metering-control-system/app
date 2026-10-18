export const state = {
    errors: [],
    submissions: [],
    addedPhotos: [],
    fileValidationError: null,
    submissionError: null,
    useStorePictures: {
        photos: { report: {} },
        photoMetadata: { report: {} },
        removedPhotoIds: { report: {} },
    },
    useReportDraftStore: { drafts: {} },
    useActStore: { result: null, actMetadataByTask: {} },
    useActTemplatesStore: { templates: [] },
};
const noop = () => {};
for (const name of ['useStorePictures', 'useReportDraftStore', 'useActStore']) {
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
state.useStorePictures.appendPhoto = (photo) => state.addedPhotos.push(photo);
export const validateReportPhoto = async () => {
    if (state.fileValidationError) throw state.fileValidationError;
};

export const store = (name) => {
    const hook = (selector) => selector(state[name]);
    hook.getState = () => state[name];
    return hook;
};
export const useSubmitReport = () => ({
    isPending: false,
    submitTaskReport: async (values) => {
        if (state.submissionError) throw state.submissionError;
        state.submissions.push(values);
        return { offline: true };
    },
});
