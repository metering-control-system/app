import {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';
import { MAX_SCALE } from '@/features/gis/constants/mapScale';
import polygon from '@/features/gis/constants/tiles.json';

const clamp = (value, min, max) => {
    'worklet';
    return Math.min(Math.max(value, min), max);
};

const useMapGestures = ({ canvasWidth, closeList, handlePointTap }) => {
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

    const singleTap = Gesture.Tap()
        .maxDuration(250)
        .numberOfTaps(1)
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

    const doubleTap = Gesture.Tap()
        .numberOfTaps(2)
        .maxDuration(300)
        .onEnd((event) => {
            const s1 = scale.value;
            const s2 = Math.min(s1 * 1.5, MAX_SCALE);

            const cx = canvasWidth.value / 2;
            const cy = cx;

            const newTranslateX =
                event.x - cx - (s2 / s1) * (event.x - cx - translateX.value);

            const newTranslateY =
                event.y - cy - (s2 / s1) * (event.y - cy - translateY.value);

            const bound = ((s2 - 1) * canvasWidth.value) / 2;

            translateX.value = withTiming(clamp(newTranslateX, -bound, bound), {
                duration: 250,
                easing: Easing.inOut(Easing.ease),
            });

            translateY.value = withTiming(clamp(newTranslateY, -bound, bound), {
                duration: 250,
                easing: Easing.inOut(Easing.ease),
            });

            scale.value = withTiming(s2, {
                duration: 250,
                easing: Easing.inOut(Easing.ease),
            });

            scheduleOnRN(closeList);
        });

    const composedGestures = Gesture.Race(
        pan,
        pinchGesture,
        Gesture.Exclusive(doubleTap, singleTap)
    );

    const bringCloserRelativePoint = ({ point, sc }) => {
        const s1 = scale.value;
        const s2 = Math.min(s1 * sc, MAX_SCALE);

        const cx = canvasWidth.value / 2;
        const cy = cx;

        const newTranslateX =
            point.x - cx - (s2 / s1) * (point.x - cx - translateX.value);

        const newTranslateY =
            point.y - cy - (s2 / s1) * (point.y - cy - translateY.value);

        const bound = ((s2 - 1) * canvasWidth.value) / 2;

        translateX.value = withTiming(clamp(newTranslateX, -bound, bound), {
            duration: 250,
            easing: Easing.inOut(Easing.ease),
        });

        translateY.value = withTiming(clamp(newTranslateY, -bound, bound), {
            duration: 250,
            easing: Easing.inOut(Easing.ease),
        });

        scale.value = withTiming(s2, {
            duration: 250,
            easing: Easing.inOut(Easing.ease),
        });
    };

    return {
        composedGestures,
        animatedStyles,
        scale,
        bringCloserRelativePoint,
    };
};

export default useMapGestures;
