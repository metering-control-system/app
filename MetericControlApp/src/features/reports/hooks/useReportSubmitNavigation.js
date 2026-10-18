import { useCallback, useEffect, useRef, useState } from 'react';
import { REPORT_FIELD_REFERENCES as FORM_FIELDS_MAP } from '@/features/reports/constants/reportFieldReferences';
import { useNavigateToElement } from '@/shared/hooks/useNavigateToElement';
import useReportDraftStore from '@/features/reports/store/useReportDraftStore';

const useReportSubmitNavigation = ({
    id,
    task,
    reportQuery,
    isPending,
    reference,
    sourceReportId,
    queueView,
}) => {
    const draft = useReportDraftStore((state) => state.drafts?.[id]);
    const isResolvingSource = Boolean(sourceReportId && reportQuery.isFetching);
    const canUseServerRemarks =
        !task?.is_team_task ||
        reportQuery.data?.status !== 'REJECTED' ||
        (Number(draft?.serverReportSource?.id) ===
            Number(reportQuery.data?.id) &&
            draft?.serverReportSource?.updatedAt ===
                reportQuery.data?.updated_at);
    const referencedField = canUseServerRemarks
        ? FORM_FIELDS_MAP[reference?.toUpperCase()]
        : null;
    const isActualDifferent =
        draft?.meterBefore?.isActualDifferent ??
        Boolean(
            reportQuery.data?.metering &&
            task?.meter &&
            (reportQuery.data.metering.actual_old_meter_number !==
                task.meter.number ||
                reportQuery.data.metering.actual_old_meter_type !==
                    task.meter.type)
        );
    const admissionStatus =
        draft?.admission?.status ?? reportQuery.data?.admission?.status;
    let targetField = referencedField?.field;
    if (!isActualDifferent && targetField === 'meterBefore.actualNumber')
        targetField = 'meterBefore.number';
    if (!isActualDifferent && targetField === 'meterBefore.actualType')
        targetField = 'meterBefore.type';
    if (
        admissionStatus !== 'NOT_ADMITTED' &&
        ['admission.rejectionReason', 'admission.rejectionComment'].includes(
            targetField
        )
    )
        targetField = 'admission.status';
    const [highlightedField, setHighlightedField] = useState(null);

    const scrollRef = useRef();
    const [step, setStep] = useState(0);

    const [navigateToElement, fillPositions] = useNavigateToElement(
        scrollRef,
        setStep
    );

    useEffect(() => {
        if (!canUseServerRemarks) {
            setHighlightedField(null);
            return;
        }
        if (
            referencedField &&
            !isPending &&
            !reportQuery.isPending &&
            !isResolvingSource
        ) {
            navigateToElement({
                elements: {
                    [reference]: { ...referencedField, field: targetField },
                },
                scrollableEl: reference,
            });
            setHighlightedField(targetField ?? null);
        }
    }, [
        canUseServerRemarks,
        reference,
        referencedField,
        targetField,
        navigateToElement,
        isPending,
        reportQuery.isPending,
        isResolvingSource,
    ]);

    const sourceReportChanged =
        sourceReportId &&
        task &&
        !reportQuery.isPending &&
        !isResolvingSource &&
        !reportQuery.isError &&
        (Number(sourceReportId) !== Number(reportQuery.data?.id) ||
            reportQuery.data?.status !== 'REJECTED');

    const redirect =
        !(queueView && ['pending', 'error'].includes(draft?.reportState)) &&
        draft?.reportState !== 'pending' &&
        !reportQuery.isPending &&
        !isResolvingSource &&
        (reportQuery.isReadOnly || sourceReportChanged)
            ? {
                  pathname: `/(authorized)/reportDetails/${sourceReportId ?? reportQuery.report.id}`,
                  params: { reference, viewOnly: '1' },
              }
            : null;
    const onValidationError = useCallback((field) => {
        setHighlightedField(field);
        scrollRef.current?.scrollTo({ y: 0, animated: true });
    }, []);
    return {
        scrollRef,
        fillPositions,
        step,
        setStep,
        highlightedField,
        onValidationError,
        isResolvingSource,
        redirect,
    };
};

export default useReportSubmitNavigation;
