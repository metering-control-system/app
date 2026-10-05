import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import polygon from '@/features/gis/constants/tiles.json';

const tileBorderWidth = 2;

const MapUserGeolocation = ({ tile, baseScale, scale }) => {
    const borderStyle = useAnimatedStyle(() => ({
        borderWidth: tileBorderWidth / scale.value,
    }));

    if (!tile) {
        return null;
    }

    const side = polygon.size * baseScale;

    return (
        <Animated.View
            style={[
                styles.tile,
                {
                    left: tile.x * baseScale,
                    top: tile.y * baseScale,
                    width: side,
                    height: side,
                },
                borderStyle,
            ]}
        />
    );
};

const styles = StyleSheet.create({
    tile: {
        position: 'absolute',
        backgroundColor: 'rgba(0, 148, 207, 0.45)',
        borderColor: '#0094cf',
    },
});

export default MapUserGeolocation;
