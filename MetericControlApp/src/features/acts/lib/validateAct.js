import { ensureActFileExists } from '@/features/acts/lib/ensureActFileExists';
import { createActChecksum } from '@/features/acts/lib/createActChecksum';
import { areObjectsEqual } from '@/shared/lib/collections/areObjectsEqual';
import useActStore from '@/features/acts/store/useActStore';
import useActTemplatesStore from '@/features/acts/store/useActTemplatesStore';

export const validateAct = async ({ taskId, actPdf, fields }) => {
    if (actPdf?.isRefused) return;
    const record = useActStore.getState().actMetadataByTask[String(taskId)];
    const template = useActTemplatesStore
        .getState()
        .templates.find(
            (item) => String(item.id) === String(actPdf?.templateId)
        );
    if (!actPdf?.uri || !record?.checksum || !template) {
        throw new Error(
            'Сгенерируйте акт перед подписанием или отправкой отчёта.'
        );
    }
    ensureActFileExists(actPdf.uri);
    const checksum = await createActChecksum({ fields, template });
    if (
        useActStore.getState().actMetadataByTask[String(taskId)] !== record ||
        checksum !== record.checksum ||
        (record.uri && record.uri !== actPdf.uri) ||
        String(record.templateId) !== String(template.id) ||
        !areObjectsEqual(actPdf.signatures ?? {}, record.signatures ?? {})
    ) {
        throw new Error(
            'Данные отчёта или шаблон изменились. Пересоздайте акт. Прежние подписи будут удалены.'
        );
    }
};
