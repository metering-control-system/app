import assert from 'node:assert/strict';
import test from 'node:test';

import { registerReportPaginationCursor } from './reportPaginationGuard.js';

test('accepts new report pagination cursors', () => {
    const seenCursors = new Set();

    registerReportPaginationCursor(seenCursors, 'cursor-a');
    registerReportPaginationCursor(seenCursors, 'cursor-b');

    assert.deepEqual(seenCursors, new Set(['cursor-a', 'cursor-b']));
});

test('rejects a repeated report pagination cursor', () => {
    const seenCursors = new Set();

    registerReportPaginationCursor(seenCursors, 'cursor-a');
    registerReportPaginationCursor(seenCursors, 'cursor-b');

    assert.throws(
        () => registerReportPaginationCursor(seenCursors, 'cursor-a'),
        /курсор пагинации повторился/
    );
});
