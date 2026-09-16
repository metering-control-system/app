import { Pressable, StyleSheet, Text } from 'react-native';

export const OverlayButton = ({ onPress, displayValue, icon }) => {
    return (
        <Pressable onPress={onPress} style={styles.button}>
            {icon || <Text style={styles.buttonText}>{displayValue}</Text>}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    button: {
        position: 'absolute',
        bottom: 50,
        right: 20,
        borderRadius: 50,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0094cf',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    buttonText: { color: 'white', fontSize: 14, fontWeight: '600' },
});
