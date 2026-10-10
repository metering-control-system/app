import { useMemo } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { useAnimatedProps, useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN, scheduleOnUI } from 'react-native-worklets';

const useSvgCanvas = () => {
    const size = useSharedValue({ width: 0, height: 0 });
    const strokes = useSharedValue([]);
    const activePoints = useSharedValue([]);
    const activePath = useSharedValue('');
    const completedPath = useSharedValue('');

    const activeAnimatedProps = useAnimatedProps(() => ({
        d: activePath.value,
    }));
    const completedAnimatedProps = useAnimatedProps(() => ({
        d: completedPath.value,
    }));

    const gesture = useMemo(
        () =>
            Gesture.Pan()
                .minDistance(0)
                .maxPointers(1)
                .shouldCancelWhenOutside(true)
                .onBegin(({ x, y }) => {
                    const point = {
                        x: Math.max(0, Math.min(x, size.value.width)),
                        y: Math.max(0, Math.min(y, size.value.height)),
                    };
                    activePoints.value = [point];
                    activePath.value = `M ${point.x} ${point.y} l 0 0`;
                })
                .onUpdate(({ x, y }) => {
                    const lastPoint = activePoints.value.at(-1);
                    if (!lastPoint) return;

                    const point = {
                        x: Math.max(0, Math.min(x, size.value.width)),
                        y: Math.max(0, Math.min(y, size.value.height)),
                    };
                    const dx = point.x - lastPoint.x;
                    const dy = point.y - lastPoint.y;
                    if (dx * dx + dy * dy < 1) return;

                    activePoints.modify((points) => {
                        points.push(point);
                        return points;
                    });
                    activePath.value += ` L ${point.x} ${point.y}`;
                })
                .onFinalize(({ x, y }, success) => {
                    const lastPoint = activePoints.value.at(-1);
                    if (!lastPoint) return;

                    const point = {
                        x: Math.max(0, Math.min(x, size.value.width)),
                        y: Math.max(0, Math.min(y, size.value.height)),
                    };
                    if (
                        success &&
                        (point.x !== lastPoint.x || point.y !== lastPoint.y)
                    ) {
                        activePoints.modify((points) => {
                            points.push(point);
                            return points;
                        });
                        activePath.value += ` L ${point.x} ${point.y}`;
                    }

                    const points = activePoints.value;
                    strokes.modify((current) => {
                        current.push(points);
                        return current;
                    });
                    completedPath.value += ` ${activePath.value}`;
                    activePath.value = '';
                    activePoints.value = [];
                }),
        [activePath, activePoints, completedPath, size, strokes]
    );

    return {
        gesture,
        size,
        strokes,
        activeAnimatedProps,
        completedAnimatedProps,
        exportStrokes: (onExport) => {
            scheduleOnUI(() => {
                'worklet';
                const snapshot = activePoints.value.length
                    ? [...strokes.value, activePoints.value]
                    : strokes.value;
                scheduleOnRN(onExport, snapshot);
            });
        },
        clearCanvas: () => {
            scheduleOnUI(() => {
                'worklet';
                strokes.value = [];
                activePoints.value = [];
                activePath.value = '';
                completedPath.value = '';
            });
        },
    };
};

export default useSvgCanvas;
