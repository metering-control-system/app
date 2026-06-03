import { Text, View, StyleSheet } from 'react-native';

export const FieldRow = ({ label, value, defaultValue }) => (
    <View style={styles.control}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.field}>{value ?? defaultValue}</Text>
    </View>
);

const styles = StyleSheet.create({
    control: { paddingHorizontal: 5, marginVertical: 10 },
    label: { fontSize: 12, color: '#7a7a7a', marginBottom: 10 },
    field: {
        width: '100%',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        flexDirection: 'row',
        alignItems: 'center',
        color: '#000',
        flex: 1,
        minHeight: 48,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
});
