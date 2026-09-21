import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { getReportByTaskId } from '@/features/reports/api/submitReportApi';
import { loadReportReplacement } from '@/features/reports/lib/loadReportReplacement';
import useReportsStore from '@/features/reports/store/useReportsStore';
import { getApiErrorMessage } from '@/shared/api/getApiErrorMessage';

const useLoadBrigadeReport = ({ taskId, onLoaded }) => {
    const queryClient = useQueryClient();
    const mounted = useRef(true);
    const busy = useRef(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    const loadReport = async () => {
        if (busy.current || !mounted.current) return;
        busy.current = true;
        setIsLoading(true);
        try {
            const report = await loadReportReplacement({
                taskId,
                fetchReport: getReportByTaskId,
                shouldApply: () => mounted.current,
                applyReport: (report) => {
                    onLoaded(report);
                    queryClient.setQueryData(['report', report.id], report);
                    queryClient.setQueryData(
                        ['report', 'task', Number(taskId)],
                        report
                    );
                    useReportsStore.getState().setUpdatedReports([report]);
                },
            });
            if (!mounted.current) return;
            Alert.alert(
                report ? 'Отчёт загружен' : 'Отчёт пока не отправлен',
                report
                    ? 'Локальный отчёт заменён данными с сервера. Загрузка не отправляет отчёт на проверку.'
                    : 'По этой задаче пока нет отправленного отчёта. Ваши данные сохранены.'
            );
        } catch (error) {
            if (mounted.current) {
                Alert.alert(
                    'Не удалось загрузить отчёт',
                    getApiErrorMessage(
                        error,
                        'Проверьте соединение и повторите попытку. Ваши данные сохранены.'
                    )
                );
            }
        } finally {
            busy.current = false;
            if (mounted.current) setIsLoading(false);
        }
    };

    return { loadReport, isLoading };
};

export default useLoadBrigadeReport;
