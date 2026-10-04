import { clamp } from '@/features/gis/lib/colorizeMap';

const mapImportance = { NOT_SPECIFIED: 0, LOW: 0.3, MEDIUM: 0.7, HIGH: 1 };

export const calculateImportance = (tasks) => {
    const length = tasks?.length || 1;
    let importance = 0;
    for (const task of tasks) {
        importance += mapImportance?.[task.manual_priority];
    }

    const externalValue = clamp(Math.log10(length), 0, 1 - importance / length);

    return importance / length + externalValue;
};
