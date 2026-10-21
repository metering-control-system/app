import { REPORT_STATUS } from '@/features/reports/constants/reportStatus';
import { REPORT_DRAFT_STATE } from '@/features/reports/constants/reportDraftState';
import { fillEmptyReportFields } from '@/features/reports/lib/fillEmptyReportFields';
import { Alert, Keyboard } from 'react-native';
import useStorePictures from '@/shared/store/useStorePictures';
import { mapTaskToReportDefaults } from '@/features/reports/lib/mapTaskToReportDefaults';
import { buildReportReplacement } from '@/features/reports/lib/reportFormHydration';
import useLoadBrigadeReport from '@/features/reports/hooks/useLoadBrigadeReport';

const useBrigadeReportLoading = ({
    onError,
    task,
    id,
    getValues,
    hydratedDraftIdRef,
    draftId,
    hydratedPhotosIdRef,
    replaceEntityPhotos,
    reset,
    setDraft,
    setStepIndex,
    isOnline,
    isEditingDisabled,
    onActionStart,
    existingReport,
}) => {
    const { loadReport, isLoading: isLoadingReport } = useLoadBrigadeReport({
        onError,
        taskId: task?.id ?? id,
        onLoaded: (report, mode) => {
            const replacement = buildReportReplacement(
                report,
                mapTaskToReportDefaults(task)
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
                              pictures.photos.report?.[id] ??
                              getValues('photos'),
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
                serverReportSource:
                    mode === 'replace'
                        ? { id: report.id, updatedAt: report.updated_at }
                        : null,
            };
            reset(loadedValues);
            setDraft({ draftId, values: loadedValues });
            setStepIndex(0);
        },
    });
    const confirmLoadReport = () => {
        if (!isOnline || isEditingDisabled) return;
        onActionStart();
        const load = (mode) => {
            Keyboard.dismiss();
            void loadReport(mode);
        };
        if (existingReport?.status === REPORT_STATUS.REJECTED) {
            Alert.alert(
                'Загрузить отчёт с замечаниями?',
                'Поля и фотографии вашего локального черновика будут заменены отклонённым отчётом с сервера.',
                [
                    { text: 'Отмена', style: 'cancel' },
                    { text: 'Загрузить', onPress: () => load('replace') },
                ]
            );
            return;
        }
        Alert.alert(
            'Загрузить отчёт бригады',
            'Заменить весь отчёт или заполнить только пустые поля? Во втором случае ваши заполненные значения и фото-разделы сохранятся. Выключенные галочки включатся, если они включены на сервере; уже включённые останутся включёнными. После загрузки отчёт нужно отправить вручную.',
            [
                { text: 'Отмена', style: 'cancel' },
                { text: 'Только пустые поля', onPress: () => load('empty') },
                {
                    text: 'Заменить всё',
                    style: 'destructive',
                    onPress: () =>
                        Alert.alert(
                            'Заменить ваш отчёт?',
                            'Все поля и фотографии будут заменены данными с сервера, включая пустые поля. Ожидающая отправка старого черновика будет отменена. Отменить замену нельзя.',
                            [
                                { text: 'Отмена', style: 'cancel' },
                                {
                                    text: 'Заменить',
                                    style: 'destructive',
                                    onPress: () => load('replace'),
                                },
                            ]
                        ),
                },
            ]
        );
    };
    return { confirmLoadReport, isLoadingReport };
};
export default useBrigadeReportLoading;
