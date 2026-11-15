import { Alert } from 'react-native';
import { REPORT_DRAFT_STATE } from '@/features/reports/constants/reportDraftState';
import { buildReportReplacement } from '@/features/reports/lib/reportFormHydration';
import { mapTaskToReportDefaults } from '@/features/reports/lib/mapTaskToReportDefaults';
import { createClientReportId } from '@/features/reports/lib/createClientReportId';
import { formatReportDateTime } from '@/features/reports/lib/reportActFieldValues';
import { fillEmptyReportFields } from '@/features/reports/lib/fillEmptyReportFields';
import useStorePictures from '@/shared/store/useStorePictures';
import useReportDraftStore from '@/features/reports/store/useReportDraftStore';
import { useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getReportByTaskId } from '@/features/reports/api/submitReportApi';
import { loadReportReplacement } from '@/features/reports/lib/loadReportReplacement';
import useReportsStore from '@/features/reports/store/useReportsStore';
import {
    REPORT_OPERATION_KEY,
    startReportOperation,
} from '@/features/reports/lib/reportOperation';
import { getApiErrorMessage } from '@/shared/api/getApiErrorMessage';

const useLoadBrigadeReport = ({
    onError: handleError,
    task,
    id,
    getValues,
    hydratedDraftIdRef,
    hydratedPhotosIdRef,
    reset,
    setStepIndex,
}) => {
    const taskId = task?.id ?? id;
    const draftId = String(taskId);
    const replaceEntityPhotos = useStorePictures(
        (state) => state.replaceEntityPhotos
    );
    const setDraft = useReportDraftStore((state) => state.setDraft);
    const onLoaded = (report, mode) => {
        const replacement = buildReportReplacement(
            report,
            mapTaskToReportDefaults(task, {
                clientReportId: createClientReportId(),
                compiledAt: formatReportDateTime(new Date()),
            })
        );
        const pictures = useStorePictures.getState();
        const {
            values,
            photoMetadata,
            removedPhotoIds = [],
        } = mode === 'empty'
            ? fillEmptyReportFields({
                  currentValues: {
                      ...getValues(),
                      photos:
                          pictures.photos.report?.[id] ?? getValues('photos'),
                  },
                  replacement,
                  localPhotoMetadata: pictures.photoMetadata.report?.[id],
                  removedPhotoIds: pictures.removedPhotoIds.report?.[id],
              })
            : replacement;
        hydratedDraftIdRef.current = draftId;
        hydratedPhotosIdRef.current = draftId;
        replaceEntityPhotos({
            entity: 'report',
            entityId: id,
            photos: values.photos,
            photoMetadata,
            removedPhotoIds,
        });
        const loadedValues = {
            ...values,
            reportState: REPORT_DRAFT_STATE.DRAFT,
            requiresManualSubmit: true,
            serverReportSource: { id: report.id, updatedAt: report.updated_at },
        };
        reset(loadedValues);
        setDraft({ draftId, values: loadedValues });
        setStepIndex(0);
    };
    const queryClient = useQueryClient();
    const mounted = useRef(true);

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    const { mutateAsync, isPending: isLoading } = useMutation({
        mutationKey: [...REPORT_OPERATION_KEY, 'load'],
        networkMode: 'always',
        retry: false,
        mutationFn: ({ taskId: requestedTaskId, mode }) =>
            loadReportReplacement({
                taskId: requestedTaskId,
                fetchReport: getReportByTaskId,
                shouldApply: () => mounted.current,
                applyReport: (report) => {
                    onLoaded(report, mode);
                    queryClient.setQueryData(['report', report.id], report);
                    queryClient.setQueryData(
                        ['report', 'task', Number(requestedTaskId)],
                        report
                    );
                    useReportsStore.getState().setUpdatedReports([report]);
                },
            }),
        onSuccess: (report, { mode }) => {
            if (!mounted.current) return;
            Alert.alert(
                report ? 'Отчёт загружен' : 'Отчёт пока не отправлен',
                report
                    ? mode === 'empty'
                        ? 'Пустые поля заполнены данными с сервера. Проверьте отчёт и отправьте его вручную.'
                        : 'Локальный отчёт заменён данными с сервера. Загрузка не отправляет отчёт на проверку.'
                    : 'По этой задаче пока нет отправленного отчёта. Ваши данные сохранены.'
            );
        },
        onError: (error) => {
            if (mounted.current) {
                handleError(
                    'Не удалось загрузить отчёт',
                    getApiErrorMessage(
                        error,
                        'Проверьте соединение и повторите попытку. Ваши данные сохранены.'
                    )
                );
            }
        },
    });

    const loadReport = (mode = 'replace') => {
        if (!mounted.current) return;
        return startReportOperation(queryClient, taskId, () =>
            mutateAsync({ taskId, mode })
        ).catch(() => undefined);
    };

    return { loadReport, isLoading };
};

export default useLoadBrigadeReport;
