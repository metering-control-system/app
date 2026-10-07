import { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import polygon from '@/features/gis/constants/tiles.json';
import Animated, {
    useAnimatedReaction,
    useSharedValue,
} from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';
import CanvasMap from '@/features/gis/components/canvasMap';
import {
    TILED_MIN_ZOOM,
    USER_TILE_ZOOM,
} from '@/features/gis/constants/mapScale';
import useMapGestures from '@/features/gis/hooks/useMapGestures';
import {
    MapDistrictsLabels,
    MapTilesLabels,
} from '@/features/gis/components/mapLabels';
import { MapTaskList } from '@/features/gis/components/mapTaskList';
import MapUserGeolocation from '@/features/gis/components/mapUserGeolocation';

const getScale = (screenWidth, mapWidth) => {
    return screenWidth / mapWidth;
};

const counterFontSize = 8;

const InteractiveMap = ({
    tasksByDistrict,
    tasksByTile,
    goToTask,
    isTiledMap,
    setIsTiledMap,
    userTile,
    resetRequest,
    focusRequest,
    selectMapColorPaletteByMode,
}) => {
    const [width, setWidth] = useState(0);
    const [districtPressed, setDistrictPressed] = useState(null);
    const [tilePressed, setTilePressed] = useState(null);

    const districts = Object.keys(polygon.coordinates);

    const baseScale = useMemo(() => {
        if (width) {
            return getScale(width, polygon.width);
        }
        return 0;
    }, [width]);

    const canvasWidth = useSharedValue(0);

    const closeList = useCallback(() => {
        setDistrictPressed(null);
        setTilePressed(null);
    }, []);

    const handlePointTap = (point) => {
        if (!isTiledMap) {
            const found = districts.find((d) =>
                Object.entries(polygon.coordinates[d])
                    .filter(([key]) => key !== 'center')
                    .some(
                        ([, t]) =>
                            point.x >= t.x &&
                            point.x <= t.x + polygon.size &&
                            point.y >= t.y &&
                            point.y <= t.y + polygon.size
                    )
            );

            if (!found) {
                setDistrictPressed(null);
                return;
            }

            if (districtPressed === found) {
                setDistrictPressed(null);
                return;
            }
            setDistrictPressed(found);
        } else {
            const found = Object.entries(tasksByTile).find(([key]) => {
                const [x, y] = key.split(':');
                return (
                    point.x >= Number(x) &&
                    point.x <= Number(x) + polygon.size &&
                    point.y >= Number(y) &&
                    point.y <= Number(y) + polygon.size
                );
            });
            if (found) {
                setTilePressed((prev) => (prev === found[0] ? null : found[0]));
            } else {
                setTilePressed(null);
            }
        }
    };

    const {
        resetMap,
        composedGestures: mapGestures,
        animatedStyles,
        scale,
        bringCloserRelativePoint,
    } = useMapGestures({ canvasWidth, closeList, handlePointTap });

    useEffect(() => {
        if (!focusRequest || !userTile || !baseScale) {
            return;
        }

        closeList();
        bringCloserRelativePoint({
            point: {
                x: (userTile.x + polygon.size / 2) * baseScale,
                y: (userTile.y + polygon.size / 2) * baseScale,
            },
            targetScale: USER_TILE_ZOOM,
        });
    }, [
        baseScale,
        bringCloserRelativePoint,
        closeList,
        focusRequest,
        userTile,
    ]);

    useEffect(() => {
        if (resetRequest) resetMap();
    }, [resetRequest, resetMap]);

    useAnimatedReaction(
        () => scale.value >= TILED_MIN_ZOOM,
        (isZoomed, prev) => {
            if (isZoomed !== prev) {
                scheduleOnRN(setIsTiledMap, isZoomed);
            }
        }
    );

    const selectedTasks = useMemo(() => {
        if (
            districtPressed &&
            tasksByDistrict[districtPressed] &&
            !isTiledMap
        ) {
            return Object.values(tasksByDistrict[districtPressed]);
        } else if (tilePressed && tasksByTile[tilePressed]) {
            return tasksByTile[tilePressed];
        }
        return [];
    }, [
        districtPressed,
        tasksByDistrict,
        tilePressed,
        tasksByTile,
        isTiledMap,
    ]);

    return (
        <View style={{ flex: 1 }}>
            <GestureDetector gesture={mapGestures}>
                <View
                    style={{
                        width: '100%',
                        aspectRatio: 1,
                        overflow: 'hidden',
                        position: 'relative',
                    }}
                    onLayout={(e) => {
                        setWidth(e.nativeEvent.layout.width);
                        canvasWidth.value = e.nativeEvent.layout.width;
                    }}>
                    <Animated.View
                        style={[{ width, height: width }, animatedStyles]}>
                        <CanvasMap
                            isTiledMap={isTiledMap}
                            size={width}
                            baseScale={baseScale}
                            selectMapColorPaletteByMode={
                                selectMapColorPaletteByMode
                            }
                        />
                        <MapUserGeolocation
                            tile={userTile}
                            baseScale={baseScale}
                            scale={scale}
                        />
                        {isTiledMap ? (
                            <MapTilesLabels
                                districts={districts}
                                baseScale={baseScale}
                                tasksByTile={tasksByTile}
                                scale={scale}
                                counterFontSize={counterFontSize}
                            />
                        ) : (
                            <MapDistrictsLabels
                                districts={districts}
                                baseScale={baseScale}
                                tasksByDistrict={tasksByDistrict}
                                scale={scale}
                                counterFontSize={counterFontSize}
                            />
                        )}
                    </Animated.View>
                </View>
            </GestureDetector>
            <MapTaskList
                onClose={closeList}
                selectedTasks={selectedTasks}
                title={districtPressed || tilePressed}
                tilePressed={tilePressed}
                goToTask={goToTask}
            />
        </View>
    );
};

export default InteractiveMap;
