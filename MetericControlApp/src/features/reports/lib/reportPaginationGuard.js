export const registerReportPaginationCursor = (seenCursors, cursor) => {
    if (!cursor) {
        return;
    }

    if (seenCursors.has(cursor)) {
        throw new Error(
            'Не удалось загрузить отчеты: курсор пагинации повторился'
        );
    }

    seenCursors.add(cursor);
};
