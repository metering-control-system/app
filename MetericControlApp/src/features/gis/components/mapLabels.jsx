import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import polygon from '@/features/gis/constants/tiles.json';
import { View } from 'react-native';

export const MapDistrictsLabels = ({
    scale,
    counterFontSize,
    districts,
    tasksByDistrict,
    baseScale,
}) => {
    const labelTextStyle = useAnimatedStyle(() => ({
        fontSize: 10 / scale.value,
        display: scale.value > 2 ? 'flex' : 'none',
    }));

    const labelCountStyle = useAnimatedStyle(() => ({
        fontSize: counterFontSize / scale.value,
    }));

    return districts.map((district) => {
        const center = polygon.coordinates[district].center;
        const tasksCount = Object.values(
            tasksByDistrict?.[district] ?? {}
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
                    transform: [{ translateX: '-25%' }, { translateY: '-5%' }],
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
    });
};

export const MapTilesLabels = ({
    scale,
    counterFontSize,
    districts,
    tasksByTile,
    baseScale,
}) => {
    const labelCountTileStyle = useAnimatedStyle(() => ({
        fontSize: counterFontSize / scale.value,
    }));

    return districts.flatMap((district) =>
        Object.entries(polygon.coordinates[district])
            .filter(([key]) => key !== 'center')
            .map(([tileKey, tile]) => {
                const tasksCount =
                    tasksByTile?.[`${tile.x}:${tile.y}`]?.length ?? 0;
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
};
