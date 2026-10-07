export const modesObj = {
    TASKS_COUNT: 'По количеству',
    TASKS_PRIORITY: 'По важности',
};

export const modes = Object.entries(modesObj);
export const modesVariants = Object.fromEntries(
    Object.entries(modesObj).map(([key]) => [key, key])
);
