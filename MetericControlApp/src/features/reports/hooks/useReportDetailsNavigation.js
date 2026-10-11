import { useCallback, useEffect, useRef } from 'react';
import { REPORT_FIELD_REFERENCES } from '@/features/reports/constants/reportFieldReferences';
import { useScrollToPosition } from '@/shared/hooks/useNavigateToElement';
import useTaskReport from '@/features/reports/hooks/useTaskReport';
import useReportDraftStore from '@/features/reports/store/useReportDraftStore';
import { isTaskReportReadOnly } from '@/features/tasks/lib/taskReportVisibility';

const useReportDetailsNavigation = ({
    report,
    task,
    isTaskPending,
    reference,
    viewOnly,
}) => {
    const target = REPORT_FIELD_REFERENCES[reference?.toUpperCase()];
    const tiedTaskId = report?.task_id ? Number(report.task_id) : null;
    const scrollRef = useRef(null);
    const [fillPositions, scrollToElement] = useScrollToPosition(scrollRef);
    const latestReportQuery = useTaskReport(
        target && viewOnly !== '1' && report?.status === 'REJECTED'
            ? task
            : null
    );
    const isResolvingReference = Boolean(
        target &&
        viewOnly !== '1' &&
        report?.status === 'REJECTED' &&
        (isTaskPending ||
            latestReportQuery.isPending ||
            latestReportQuery.isFetching)
    );
    const canEditReference = Boolean(
        target &&
        viewOnly !== '1' &&
        task &&
        report?.status === 'REJECTED' &&
        !isResolvingReference &&
        !latestReportQuery.isError &&
        Number(latestReportQuery.report?.id) === Number(report.id) &&
        latestReportQuery.report?.status === 'REJECTED' &&
        !latestReportQuery.isReadOnly
    );
    const scrollToReference = useCallback(() => {
        if (target && !isResolvingReference && !canEditReference) {
            scrollToElement(target);
        }
    }, [target, isResolvingReference, canEditReference, scrollToElement]);
    useEffect(scrollToReference, [scrollToReference, report, task]);
    const draft = useReportDraftStore((state) => state.drafts?.[tiedTaskId]);
    const canOpenTask = Boolean(
        task &&
        report &&
        (report.status === 'REJECTED' || draft) &&
        !isTaskReportReadOnly(task, report, draft)
    );

    const redirect = canEditReference
        ? {
              pathname: `/(authorized)/taskFlow/reportSubmit/${tiedTaskId}`,
              params: { reference, sourceReportId: String(report.id) },
          }
        : null;
    return {
        scrollRef,
        fillPositions,
        scrollToReference,
        target,
        isResolvingReference,
        canOpenTask,
        redirect,
    };
};

export default useReportDetailsNavigation;
