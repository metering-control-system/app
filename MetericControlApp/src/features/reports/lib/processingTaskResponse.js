export const processingReportResponse = (data) => {
    const dataCopy = { ...data };
    dataCopy.reports = dataCopy.results ?? [];
    delete dataCopy.results;
    return dataCopy;
};
