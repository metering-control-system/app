export const normalizeTaskResponse = (task) => ({
    ...(task ?? {}),
    address: {
        ...task.address,
        // eslint-disable-next-line camelcase
        display_address: [
            task.address?.locality,
            task.address?.street,
            task.address?.house,
            task.address?.building,
            task.address?.apartment,
        ]
            .filter(
                (value) => value !== null && value !== undefined && value !== ''
            )
            .join(', '),
    },
});

export const processingTaskResponse = (data) => ({
    ...data,
    tasks: (data.results ?? []).map((task) => normalizeTaskResponse(task)),
});
