import { StyleSheet, Text, View } from 'react-native';
import { modesVariants } from '@/features/gis/constants/mapModes';

const MapLegend = ({ scale, mode, isTiledMap }) => (
    <View style={styles.container}>
        <Text style={styles.title} numberOfLines={2}>
            {mode === modesVariants.TASKS_COUNT
                ? 'Количество задач'
                : 'Срочность'}
            {isTiledMap ? ' в ячейке' : ' в районе'}
        </Text>
        <View style={styles.items}>
            {scale.ticks.map((value) => (
                <View key={value} style={styles.item}>
                    <View
                        style={[
                            styles.swatch,
                            { backgroundColor: scale.color(value) },
                        ]}
                    />
                    <Text style={styles.label}>{value}</Text>
                </View>
            ))}
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        height: 208,
        flexShrink: 0,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    title: {
        height: 36,
        fontSize: 13,
        lineHeight: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    items: { gap: 6 },
    item: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    swatch: { width: 16, height: 16, borderRadius: 4 },
    label: { fontSize: 13, lineHeight: 18, color: '#555' },
});

export default MapLegend;
