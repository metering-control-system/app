import { useCallback, useMemo, useState } from 'react';
import { modesVariants } from '@/features/gis/constants/mapModes';
import { createMapMetrics } from '@/features/gis/lib/createMapMetrics';

export const useMapMode = ({ tasksByDistrict, tasksByTile }) => {
    const [currentMode, setCurrentMode] = useState(modesVariants.TASKS_COUNT);
    const districts = useMemo(
        () => createMapMetrics(tasksByDistrict, currentMode),
        [tasksByDistrict, currentMode]
    );
    const tiles = useMemo(
        () => createMapMetrics(tasksByTile, currentMode),
        [tasksByTile, currentMode]
    );

    const selectMapColorPaletteByMode = useCallback(
        (isTiledMap, district, tile) => {
            const scale = isTiledMap ? tiles : districts;
            const key = isTiledMap ? `${tile.x}:${tile.y}` : district;
            return scale.color(scale.metrics[key] ?? 0);
        },
        [districts, tiles]
    );

    return {
        currentMode,
        setCurrentMode,
        selectMapColorPaletteByMode,
        districts,
        tiles,
    };
};
