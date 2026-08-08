import { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { getScale } from '@/features/gis/lib/tileMap';
import polygon from '@/features/gis/constants/tiles.json';
import {
    arrangeTasksByDistrict,
    arrangeTasksByTile,
} from '@/features/gis/lib/calculateLocation';
import Animated, {
    Easing,
    useAnimatedReaction,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';
import CanvasMap from '@/features/gis/components/canvasMap';
import { MAX_SCALE, TILED_MIN_ZOOM } from '@/features/gis/constants/mapScale';

const clamp = (value, min, max) => {
    'worklet';
    return Math.min(Math.max(value, min), max);
};

const counterFontSize = 8;

const InteractiveMap = ({ tasks }) => {
    const [width, setWidth] = useState(0);
    const [districtsTasks, setDistrictsTasks] = useState({});
    const [isTiledMap, setIsTiledMap] = useState(false);
    const [districtPressed, setDistrictPressed] = useState(null);
    const [tilePressed, setTilePressed] = useState(null);

    const listAnim = useSharedValue(0);

    useEffect(() => {
        const setDt = async () => {
            if (tasks) {
                setDistrictsTasks(
                    await arrangeTasksByDistrict({ tasks, polygon })
                );
            }
        };
        void setDt();
    }, [tasks]);

    const tilesTasks = useMemo(() => {
        if (districtsTasks) {
            return arrangeTasksByTile({
                tasksByDistrict: districtsTasks,
                tasks,
            });
        }
    }, [districtsTasks, tasks]);

    const baseScale = useMemo(() => {
        if (width) {
            return getScale(width, polygon.width);
        }
    }, [width]);

    const districts = Object.keys(polygon.coordinates);

    const canvasWidth = useSharedValue(0);

    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const scale = useSharedValue(1);
    const pinchBase = useSharedValue(1);
    const txBase = useSharedValue(0);
    const tyBase = useSharedValue(0);

    const animatedStyles = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }));

    const closeList = () => {
        if (districtPressed) {
            setDistrictPressed(null);
        }
        if (tilePressed) {
            setTilePressed(null);
        }
    };

    const pan = Gesture.Pan()
        .maxPointers(1)
        .onStart(() => {
            scheduleOnRN(closeList);
        })
        .onChange((event) => {
            const bound = ((scale.value - 1) * canvasWidth.value) / 2;
            translateX.value =
                Math.abs(translateX.value + event.changeX) > bound
                    ? translateX.value
                    : translateX.value + event.changeX;
            translateY.value =
                Math.abs(translateY.value + event.changeY) > bound
                    ? translateY.value
                    : translateY.value + event.changeY;
        })
        .onFinalize(() => {
            const bound = ((scale.value - 1) * canvasWidth.value) / 2;
            translateX.value = withSpring(
                clamp(translateX.value, -bound, bound)
            );
            translateY.value = withSpring(
                clamp(translateY.value, -bound, bound)
            );
        });

    const pinchGesture = Gesture.Pinch()
        .onStart(() => {
            scheduleOnRN(closeList);
            pinchBase.value = scale.value;
            txBase.value = translateX.value;
            tyBase.value = translateY.value;
        })
        .onUpdate((event) => {
            scale.value = clamp(pinchBase.value * event.scale, 1, MAX_SCALE);

            const s1 = pinchBase.value;
            const s2 = scale.value;
            const cx = canvasWidth.value / 2;

            const bound = ((scale.value - 1) * canvasWidth.value) / 2;
            const targetX = clamp(
                (event.focalX - cx) * (1 - s2 / s1) + txBase.value * (s2 / s1),
                -bound,
                bound
            );
            const targetY = clamp(
                (event.focalY - cx) * (1 - s2 / s1) + tyBase.value * (s2 / s1),
                -bound,
                bound
            );

            translateX.value =
                translateX.value + (targetX - translateX.value) * 0.4;
            translateY.value =
                translateY.value + (targetY - translateY.value) * 0.4;
        })
        .onFinalize(() => {
            const bound = ((scale.value - 1) * canvasWidth.value) / 2;
            translateX.value = withTiming(
                clamp(translateX.value, -bound, bound),
                { duration: 400, easing: Easing.inOut(Easing.ease) }
            );
            translateY.value = withTiming(
                clamp(translateY.value, -bound, bound),
                { duration: 400, easing: Easing.inOut(Easing.ease) }
            );
        });

    useAnimatedReaction(
        () => scale.value >= TILED_MIN_ZOOM,
        (isZoomed, prev) => {
            if (isZoomed !== prev) {
                scheduleOnRN(setIsTiledMap, isZoomed);
            }
        }
    );

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
            const found = Object.entries(tilesTasks).find(([key]) => {
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

    useEffect(() => {
        if (districtPressed || tilePressed) {
            listAnim.value = withTiming(1, { duration: 200 });
        } else {
            listAnim.value = withTiming(0, { duration: 200 });
        }
    }, [districtPressed, tilePressed, listAnim]);

    const singleTap = Gesture.Tap()
        .maxDuration(250)
        .onEnd((event) => {
            const cx = canvasWidth.value / 2;
            const nx =
                (((event.x - translateX.value - cx) / scale.value + cx) *
                    polygon.width) /
                canvasWidth.value;
            const ny =
                (((event.y - translateY.value - cx) / scale.value + cx) *
                    polygon.width) /
                canvasWidth.value;
            scheduleOnRN(handlePointTap, {
                x: nx,
                y: ny,
                screenX: event.x,
                screenY: event.y,
            });
        });

    const composedGestures = Gesture.Simultaneous(
        Gesture.Race(pan, singleTap),
        pinchGesture
    );

    const selectedTasks = useMemo(() => {
        if (districtPressed && districtsTasks[districtPressed] && !isTiledMap) {
            return Object.values(districtsTasks[districtPressed]);
        } else if (tilePressed && tilesTasks[tilePressed]) {
            return tilesTasks[tilePressed];
        }
        return [];
    }, [districtPressed, districtsTasks, tilePressed, tilesTasks, isTiledMap]);

    const listAnimatedStyle = useAnimatedStyle(() => ({
        opacity: listAnim.value,
    }));

    const labelTextStyle = useAnimatedStyle(() => ({
        fontSize: 10 / scale.value,
        display: scale.value > 2 ? 'block' : 'none',
    }));

    const labelCountStyle = useAnimatedStyle(() => ({
        fontSize: counterFontSize / scale.value,
    }));

    const labelCountTileStyle = useAnimatedStyle(() => ({
        fontSize: counterFontSize / scale.value,
    }));

    const districtsInscriptions = !isTiledMap
        ? districts.map((district) => {
              const center = polygon.coordinates[district].center;
              const tasksCount = Object.values(
                  districtsTasks?.[district] ?? {}
              ).length;
              return (
                  <View
                      key={district}
                      style={{
                          position: 'absolute',
                          top: center.y * baseScale,
                          left: center.x * baseScale,
                          width: 20,
                          alignItems: 'center',
                          zIndex: 100,
                          transform: [
                              { translateX: '-25%' },
                              { translateY: '-5%' },
                          ],
                      }}>
                      <Animated.Text
                          ellipsizeMode='tail'
                          numberOfLines={1}
                          style={[
                              {
                                  width: '100%',
                                  textAlign: 'center',
                                  fontWeight: 'bold',
                              },
                              labelTextStyle,
                          ]}>
                          {district}
                      </Animated.Text>
                      <Animated.Text
                          style={[{ textAlign: 'center' }, labelCountStyle]}>
                          {tasksCount}
                      </Animated.Text>
                  </View>
              );
          })
        : districts.flatMap((district) =>
              Object.entries(polygon.coordinates[district])
                  .filter(([key]) => key !== 'center')
                  .map(([tileKey, tile]) => {
                      const tasksCount =
                          tilesTasks?.[`${tile.x}:${tile.y}`]?.length ?? 0;
                      if (tasksCount <= 0) {
                          return null;
                      }
                      const s = polygon.size * baseScale;
                      return (
                          <View
                              key={tileKey}
                              style={{
                                  position: 'absolute',
                                  top: tile.y * baseScale,
                                  left: tile.x * baseScale,
                                  width: s,
                                  height: s,
                                  alignItems: 'center',
                                  justifyContent: 'center',
                              }}>
                              <Animated.Text
                                  style={[
                                      { fontWeight: 'bold', fontSize: 8 },
                                      labelCountTileStyle,
                                  ]}>
                                  {tasksCount}
                              </Animated.Text>
                          </View>
                      );
                  })
          );

    return (
        <View style={{ flex: 1 }}>
            <GestureDetector gesture={composedGestures}>
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
                            districtsTasks={districtsTasks}
                            tilesTasks={tilesTasks}
                        />
                        {districtsInscriptions}
                    </Animated.View>
                    {(districtPressed || tilePressed) && (
                        <Animated.View
                            style={[
                                { position: 'absolute' },
                                styles.list,
                                listAnimatedStyle,
                            ]}>
                            <View style={styles.listHeader}>
                                <Text style={styles.listHeaderText}>
                                    {districtPressed || tilePressed}
                                </Text>
                                <Text style={styles.listHeaderCount}>
                                    {selectedTasks.length}
                                </Text>
                            </View>
                            <FlatList
                                data={selectedTasks}
                                keyExtractor={(task) => String(task.id)}
                                renderItem={({ item }) => (
                                    <View style={styles.listItem}>
                                        <Text
                                            numberOfLines={2}
                                            ellipsizeMode='tail'
                                            style={styles.listItemAddress}>
                                            {item.address?.display_address}
                                        </Text>
                                        <Text
                                            numberOfLines={1}
                                            ellipsizeMode='tail'
                                            style={styles.listItemConsumer}>
                                            {item.consumer?.full_name}
                                        </Text>
                                    </View>
                                )}
                                ListEmptyComponent={
                                    <Text style={styles.listEmpty}>
                                        В этом районе нет задач
                                    </Text>
                                }
                            />
                        </Animated.View>
                    )}
                </View>
            </GestureDetector>
        </View>
    );
};

const styles = StyleSheet.create({
    list: {
        backgroundColor: '#fff',
        borderRadius: 12,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        overflow: 'hidden',
        zIndex: 1000,
    },
    listHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#f5f5f5',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    listHeaderText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#333',
        flexShrink: 1,
    },
    listHeaderCount: { fontSize: 12, color: '#999' },
    listItem: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    listItemAddress: { fontSize: 12, fontWeight: '600', color: '#333' },
    listItemConsumer: { fontSize: 11, color: '#999', marginTop: 2 },
    listEmpty: {
        padding: 14,
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
    },
});

export default InteractiveMap;
