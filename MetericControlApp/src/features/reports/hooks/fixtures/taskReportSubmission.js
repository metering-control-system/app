import { create } from 'zustand';
import { mergeReportUpdates } from '../../lib/mergeReportUpdates.js';

export const api = { report: null, calls: [], commentError: null };
export const useNetwork = create(() => ({ isChecked: true, isOnline: true }));
export const useTasksStore = create(() => ({ tasks: [] }));
export const useReportsStore = create((set, get) => ({
    reports: [],
    setUpdatedReports: (reports) =>
        set({ reports: mergeReportUpdates(get().reports, reports) }),
}));
export const useReportDraftStore = create((set, get) => ({
    drafts: {},
    getDraft: (id) => get().drafts[id],
    setDraft: ({ draftId, values }) =>
        set({ drafts: { ...get().drafts, [draftId]: values } }),
}));
export const useStorePictures = create((set, get) => ({
    photoMetadata: { report: {} },
    removedPhotoIds: { report: {} },
    setEntityPhotoMetadata: ({ entityId, photoMetadata }) =>
        set({
            photoMetadata: {
                report: {
                    ...get().photoMetadata.report,
                    [entityId]: photoMetadata,
                },
            },
        }),
}));

export const getTaskById = async (id) =>
    useTasksStore.getState().tasks.find((task) => task.id === id);
export const getReportByTaskId = async () => api.report;
export const createReport = async (payload) => {
    api.calls.push({ operation: 'create', payload });
    api.report = {
        ...payload,
        id: 10,
        status: 'ON_REVIEW',
        images: [],
        ['updated_at']: '2026-10-05T12:00:00Z',
    };
    return api.report;
};
export const updateReport = async (id, payload) => {
    api.calls.push({ operation: 'update', id, payload });
    api.report = {
        ...api.report,
        ...payload,
        ['updated_at']: '2026-10-05T13:00:00Z',
    };
    return api.report;
};
export const addReportComment = async () => {
    if (api.commentError) throw api.commentError;
};
export const uploadReportImage = async () => api.report;
export const deleteReportImage = async () => {};
export const uploadReportPdfAct = async () => api.report;
export const updateReportPdfAct = async () => api.report;
export const savePdfToDocuments = async ({ sourceUri }) => sourceUri;

export const createValues = () => ({
    clientReportId: '9d9e7f4a-0e8c-4f9c-b8ec-123456789abc',
    meterBefore: { number: 'old', type: 'meter' },
    metering: { newMeterNumber: 'new', newMeterType: 'meter' },
    admission: { status: 'ADMITTED' },
    consumerContact: { isRefusedContact: true },
    photos: {},
    actPdf: { isRefused: true },
    comment: '',
});
