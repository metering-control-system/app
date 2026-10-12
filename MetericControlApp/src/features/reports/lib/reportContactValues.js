export const splitReportContactName = (value) => {
    const [lastName = '', firstName = '', ...middleNames] =
        value?.trim().split(/\s+/) ?? [];
    return { lastName, firstName, middleName: middleNames.join(' ') };
};
