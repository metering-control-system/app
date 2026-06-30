import { StyleSheet } from 'react-native';

export const taskDetailsFormStyles = StyleSheet.create({
    form: {
        paddingHorizontal: 15,
        width: '100%',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    control: { paddingHorizontal: 5, marginVertical: 10 },
    label: { fontSize: 12, color: '#7a7a7a', marginBottom: 10 },
    details: {
        width: '100%',
        borderTopColor: '#ddd',
        borderTopWidth: 1,
        marginVertical: 10,
    },
    panel: { width: '100%', borderTopColor: '#ddd', borderTopWidth: 1 },
    switchRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
