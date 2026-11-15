import { memo, useId } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Svg, { Defs, Path, Pattern, Rect } from 'react-native-svg';
import Animated from 'react-native-reanimated';
import useSvgCanvas from '@/features/acts/hooks/useSvgCanvas';
import FormButton from '@/shared/components/button/formButton';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const SvgCanvas = ({ onSave, onClear, initialStrokes, isSaving = false }) => {
    const gridId = `grid${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
    const {
        gesture,
        size,
        activeAnimatedProps,
        completedAnimatedProps,
        clearCanvas,
        exportStrokes,
    } = useSvgCanvas(initialStrokes);

    const handleClear = async () => {
        if (onClear && (await onClear()) === false) return;
        clearCanvas();
    };

    return (
        <View
            collapsable={false}
            style={styles.container}
            pointerEvents={isSaving ? 'none' : 'auto'}>
            <GestureDetector gesture={gesture}>
                <View
                    collapsable={false}
                    style={styles.canvas}
                    onLayout={({ nativeEvent: { layout } }) => {
                        size.value = {
                            width: layout.width,
                            height: layout.height,
                        };
                    }}>
                    <Svg width='100%' height='100%'>
                        <Defs>
                            <Pattern
                                id={gridId}
                                width={24}
                                height={24}
                                patternUnits='userSpaceOnUse'>
                                <Path
                                    d='M 24 0 L 0 0 L 0 24'
                                    fill='none'
                                    stroke='#dce4ed'
                                    strokeWidth={1}
                                />
                            </Pattern>
                        </Defs>
                        <Rect
                            width='100%'
                            height='100%'
                            fill={`url(#${gridId})`}
                        />
                        <AnimatedPath
                            animatedProps={completedAnimatedProps}
                            fill='none'
                            stroke='#172b4d'
                            strokeWidth={3}
                            strokeLinecap='round'
                            strokeLinejoin='round'
                        />
                        <AnimatedPath
                            animatedProps={activeAnimatedProps}
                            fill='none'
                            stroke='#172b4d'
                            strokeWidth={3}
                            strokeLinecap='round'
                            strokeLinejoin='round'
                        />
                    </Svg>
                </View>
            </GestureDetector>
            <FormButton
                message='Очистить холст'
                onPress={handleClear}
                disabled={isSaving}
            />
            {onSave && (
                <FormButton
                    message='Сохранить подпись'
                    onPress={() => exportStrokes(onSave)}
                    isPending={isSaving}
                    disabled={isSaving}
                />
            )}
        </View>
    );
};

export default memo(SvgCanvas);

const styles = StyleSheet.create({
    container: { flex: 1, gap: 16 },
    canvas: {
        flex: 1,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#cecece',
        borderRadius: 12,
        overflow: 'hidden',
    },
});
