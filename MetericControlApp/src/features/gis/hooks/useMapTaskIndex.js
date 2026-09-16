import { useEffect, useMemo, useState } from 'react';
import { arrangeTasksByDistrict } from '@/features/gis/lib/arrangeTasksByDistrict';
import polygon from '@/features/gis/constants/tiles.json';
import { arrangeTasksByTile } from '@/features/gis/lib/arrangeTasksByTile';

export const useMapTaskIndex = (tasks) => {
    const [tasksByDistrict, setTasksByDistrict] = useState({});

    useEffect(() => {
        const setDt = async () => {
            if (tasks) {
                setTasksByDistrict(
                    await arrangeTasksByDistrict({ tasks, polygon })
                );
            }
        };
        void setDt();
    }, [tasks]);

    const tasksByTile = useMemo(() => {
        if (tasksByDistrict) {
            return arrangeTasksByTile({ tasksByDistrict, tasks });
        }
    }, [tasksByDistrict, tasks]);

    return [tasksByDistrict, tasksByTile];
};
