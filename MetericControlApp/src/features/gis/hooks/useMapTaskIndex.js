import { useMemo } from 'react';
import { arrangeTasksByDistrict } from '@/features/gis/lib/arrangeTasksByDistrict';
import polygon from '@/features/gis/constants/tiles.json';
import { arrangeTasksByTile } from '@/features/gis/lib/arrangeTasksByTile';

export const useMapTaskIndex = (tasks) => {
    const tasksByDistrict = useMemo(() => {
        if (tasks) {
            return arrangeTasksByDistrict({ tasks, polygon });
        }
    }, [tasks]);

    const tasksByTile = useMemo(() => {
        if (tasksByDistrict) {
            return arrangeTasksByTile({ tasksByDistrict, tasks });
        }
    }, [tasksByDistrict, tasks]);

    return [tasksByDistrict, tasksByTile];
};
