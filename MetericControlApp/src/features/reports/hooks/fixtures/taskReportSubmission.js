import { create } from 'zustand';
import { mergeReportUpdates } from '../../lib/mergeReportUpdates.js';

export const api = {
    report: null,
    calls: [],
    commentError: null,
    onWrite: null,
    lookupCount: 0,
    lookupError: null,
    updateError: null,
    onLookup: null,
    actCalls: [],
    fileValidationError: null,
    fileValidationCalls: [],
};
export const useNetwork = create(() => ({ isChecked: true, isOnline: true }));
export const useTasksStore = create(() => ({ tasks: [] }));
export const useReportsStore = create((set, get) => ({
    reports: [],
    snapshotAt: null,
    setUpdatedReports: (reports, { snapshotAt } = {}) => {
        const previous = get().reports;
        const merged = mergeReportUpdates(previous, reports, {
            snapshotAt,
            previousSnapshotAt: get().snapshotAt,
        });
        const mergedIds = new Set(merged.map((report) => report.id));
        set({
            reports: merged,
            ...(Number.isFinite(Date.parse(snapshotAt)) &&
            !(Date.parse(snapshotAt) < Date.parse(get().snapshotAt))
                ? { snapshotAt }
                : {}),
        });
        return previous.filter((report) => !mergedIds.has(report.id));
    },
    removeReports: (expectedReports) => {
        const removed = get().reports.filter((report) =>
            expectedReports.some(
                (expected) =>
                    expected.id === report.id &&
                    expected.updated_at === report.updated_at
            )
        );
        const ids = new Set(removed.map((report) => report.id));
        set({ reports: get().reports.filter((report) => !ids.has(report.id)) });
        return removed;
    },
}));
export const useReportDraftStore = create((set, get) => ({
    drafts: {},
    getDraft: (id) => get().drafts[id],
    setDraft: ({ draftId, values }) =>
        set({ drafts: { ...get().drafts, [draftId]: values } }),
    clearDraft: (id) => {
        const drafts = { ...get().drafts };
        delete drafts[id];
        set({ drafts });
    },
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
export const getReportByTaskId = async () => {
    api.lookupCount++;
    api.onLookup?.();
    if (api.lookupError) throw api.lookupError;
    return api.report;
};
export const createReport = async (payload) => {
    api.calls.push({ operation: 'create', payload });
    api.report = {
        ...payload,
        id: 10,
        status: 'ON_REVIEW',
        images: [],
        ['updated_at']: '2026-10-05T12:00:00Z',
    };
    api.onWrite?.(api.report);
    return api.report;
};
export const updateReport = async (id, payload) => {
    if (api.updateError) throw api.updateError;
    api.calls.push({ operation: 'update', id, payload });
    api.report = {
        ...api.report,
        ...payload,
        ['updated_at']: '2026-10-05T13:00:00Z',
    };
    api.onWrite?.(api.report);
    return api.report;
};
export const addReportComment = async () => {
    if (api.commentError) throw api.commentError;
};
export const uploadReportImage = async () => api.report;
export const submitReport = async () => api.report;
export const deleteReportImage = async () => {};
export const validateReportUploadFiles = async (payload) => {
    api.fileValidationCalls.push(payload);
    if (api.fileValidationError) throw api.fileValidationError;
};
export const validateReportAct = async () => {};
export const useReportActStore = create(() => ({
    actMetadataByTask: {},
    clearTaskAct: () => {},
}));
const savePdfAct = (operation, reportId, payload) => {
    api.actCalls.push({ operation, reportId, payload });
    api.report = {
        ...api.report,
        act: {
            ['client_act_id']: payload.client_act_id,
            url: 'https://example.test/act.pdf',
        },
        ['updated_at']: '2026-10-05T14:00:00Z',
    };
    return api.report;
};
export const uploadReportPdfAct = async (reportId, payload) =>
    savePdfAct('upload', reportId, payload);
export const updateReportPdfAct = async (reportId, payload, clientActId) =>
    savePdfAct('update', reportId, {
        ...payload,
        ['client_act_id']: clientActId,
    });
export const savePdfToDocuments = async ({ sourceUri }) => sourceUri;

export const createValues = () => ({
    clientReportId: '9d9e7f4a-0e8c-4f9c-b8ec-123456789abc',
    meterBefore: { number: 'old', type: 'meter' },
    metering: {
        newMeterNumber: 'new',
        newMeterType: 'meter',
        dismantlingCompleted: false,
        installationReading: '0',
    },
    admission: { status: 'ADMITTED' },
    consumerContact: { isRefusedContact: true },
    photos: {},
    actPdf: { isRefused: true },
    comment: '',
});
