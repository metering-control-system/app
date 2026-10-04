import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getReportByTaskId } from '@/features/reports/api/submitReportApi';
import { loadReportReplacement } from '@/features/reports/lib/loadReportReplacement';
import useReportsStore from '@/features/reports/store/useReportsStore';
import {
    REPORT_OPERATION_KEY,
    startReportOperation,
} from '@/features/reports/lib/reportOperation';
import { getApiErrorMessage } from '@/shared/api/getApiErrorMessage';

const useLoadBrigadeReport = ({ taskId, onLoaded }) => {
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
                Alert.alert(
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
