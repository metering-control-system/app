import { ensureActFileExists } from './ensureActFileExists';
import { createActChecksum } from './createActChecksum';
import { areReportDraftsEqual } from './areReportDraftsEqual';
import useReportActStore from '@/features/reports/store/useReportActStore';
import useActTemplatesStore from '@/features/reports/store/useActTemplatesStore';

export const validateReportAct = async ({ taskId, values }) => {
    if (values.actPdf?.isRefused) return;
    const actPdf = values.actPdf;
    const record =
        useReportActStore.getState().actMetadataByTask[String(taskId)];
    const template = useActTemplatesStore
        .getState()
        .templates.find(
            (item) => String(item.id) === String(actPdf?.templateId)
        );
    if (!actPdf?.uri || !actPdf.checksum || !record?.checksum || !template) {
        throw new Error(
            'Сгенерируйте акт перед подписанием или отправкой отчёта.'
        );
    }
    ensureActFileExists(actPdf.uri);
    const checksum = await createActChecksum({ values, template });
    if (
        useReportActStore.getState().actMetadataByTask[String(taskId)] !==
            record ||
        checksum !== actPdf.checksum ||
        checksum !== record.checksum ||
        String(record.templateId) !== String(template.id) ||
        !areReportDraftsEqual(actPdf.signatures ?? {}, record.signatures ?? {})
    ) {
        throw new Error(
            'Данные отчёта или шаблон изменились. Пересоздайте акт. Прежние подписи будут удалены.'
        );
    }
};
