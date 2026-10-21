import useActStore from '@/features/acts/store/useActStore';
import { validateAct } from '@/features/acts/lib/validateAct';
import { savePdfToDocuments } from '@/features/acts/lib/savePdfToDocuments';
import { buildSignaturesPayload } from '@/features/acts/lib/buildSignaturesPayload';
import { generateActPdf } from '@/features/acts/lib/generateActPdf';
import { ensureActFileExists } from '@/features/acts/lib/ensureActFileExists';

export const createActOperations = (getFields) => ({
    validateReportAct: ({ taskId, values }) =>
        validateAct({
            taskId,
            actPdf: values.actPdf,
            fields: values.actPdf?.isRefused ? undefined : getFields(values),
        }),
    getActRecord: (taskId) =>
        useActStore.getState().actMetadataByTask[String(taskId)],
    getActId: (taskId, createId) =>
        useActStore.getState().getActId(taskId, createId),
    clearTaskAct: (taskId, expectedAct) =>
        useActStore.getState().clearTaskAct(taskId, expectedAct),
    savePdfToDocuments,
    buildReportSignaturesPayload: buildSignaturesPayload,
    ensureActFileExists,
    generateActPdf: ({ template, values, previousAct }) =>
        generateActPdf({
            template,
            fields: getFields(values),
            actPdf: values.actPdf,
            previousAct,
        }),
    saveAct: useActStore.getState().saveAct,
    clearSignatureResult: useActStore.getState().clearResult,
    startSignatureSession: (session) =>
        useActStore
            .getState()
            .startSession({ ...session, fields: getFields(session.values) }),
});
