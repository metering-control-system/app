export const filteringByStatus = (statuses, reports) => {
    if (!statuses?.length) {
        return reports;
    }

    return reports?.filter((curr) => statuses.includes(curr.status));
};

export const filteringByAdmissionStatus = (statuses, reports) => {
    if (!statuses?.length) {
        return reports;
    }

    return reports?.filter((curr) => statuses.includes(curr.admission?.status));
};

export const filteringBy = (statuses, reports) => {
    let filtered = [...(reports ?? [])];
    filtered = filteringByAdmissionStatus(statuses.admission, filtered);
    filtered = filteringByStatus(statuses.statuses, filtered);

    return filtered;
};
