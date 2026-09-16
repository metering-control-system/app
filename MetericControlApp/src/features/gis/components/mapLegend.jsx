import { StyleSheet, Text, View } from 'react-native';
import { colorizeMap } from '@/features/gis/lib/colorizeMap';

const LEGEND_ITEMS = [0, 1, 2, 3, 4, 5];
const MAX_LEGEND_ITEMS = 5;

const MapLegend = () => (
    <View style={styles.container}>
        <Text style={styles.title}>Задач в районе</Text>
        <View style={styles.items}>
            {LEGEND_ITEMS.map((quantity) => (
                <View key={quantity} style={styles.item}>
                    <View
                        style={[
                            styles.swatch,
                            { backgroundColor: colorizeMap(quantity) },
                        ]}
                    />
                    <Text style={styles.label}>
                        {quantity >= MAX_LEGEND_ITEMS
                            ? `${quantity}+`
                            : quantity}
                    </Text>
                </View>
            ))}
        </View>
    </View>
);

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
