export const filteringBy = (filters, reports) =>
    (reports ?? []).filter(
        (report) =>
            (!filters.admission?.length ||
                filters.admission.includes(report.admission?.status)) &&
            (!filters.statuses?.length ||
                filters.statuses.includes(report.status))
    );
