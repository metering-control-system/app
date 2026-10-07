import { modesVariants } from '@/features/gis/constants/mapModes';
import { calculateImportance } from '@/features/gis/lib/calculateImportance';
import { colorizeMap, createCountScale } from '@/features/gis/lib/colorizeMap';

export const createMapMetrics = (groups, mode) => {
    const metrics = Object.fromEntries(
        Object.entries(groups ?? {}).map(([district, group]) => {
            const tasks = Object.values(group);
            return [
                district,
                mode === modesVariants.TASKS_COUNT
                    ? tasks.length
                    : calculateImportance(tasks),
            ];
        })
    );
    const scale =
        mode === modesVariants.TASKS_COUNT
            ? createCountScale(Math.max(...(Object.values(metrics) ?? [0])))
            : { color: colorizeMap, ticks: [0, 0.2, 0.4, 0.6, 0.8, 1] };
    return { metrics, ...scale };
};
