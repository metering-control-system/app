import { StyleSheet, Text, View } from 'react-native';
import { colorizeMap } from '@/features/gis/lib/colorizeMap';
import { useMemo } from 'react';

const MapLegend = ({ tasks, mode }) => {
    const midValue = Math.max(
        5,
        tasks.length /
            tasks.reduce((acc, curr) => {
                acc.add(curr.address.district);
                return acc;
            }, new Set()).size
    );

    const LEGEND_ITEMS = useMemo(() => {
        const arr = [];
        if (mode === 'TASKS_PRIORITY') {
            for (let i = 0; i < 1; i += 1 / 5) {
                arr.push(i.toFixed(1));
            }
            return arr;
        }
        for (let i = 0; i < midValue; i += midValue / 5) {
            arr.push(Math.trunc(i));
        }
        return arr;
    }, [tasks, mode]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Задач в районе</Text>
            <View style={styles.items}>
                {LEGEND_ITEMS?.map((quantity, index) => (
                    <View
                        key={String(quantity) + String(index)}
                        style={styles.item}>
                        <View
                            style={[
                                styles.swatch,
                                {
                                    backgroundColor:
                                        mode === 'TASKS_COUNT'
                                            ? colorizeMap(quantity, 25.6)
                                            : colorizeMap(quantity, 128),
                                },
                            ]}
                        />
                        <Text style={styles.label}>
                            {quantity === LEGEND_ITEMS.at(-1)
                                ? `${quantity}+`
                                : quantity}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    title: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 8 },
    items: { gap: 6 },
    item: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    swatch: { width: 16, height: 16, borderRadius: 4 },
    label: { fontSize: 13, color: '#555' },
});

export default MapLegend;
