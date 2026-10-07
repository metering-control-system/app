import { Pressable, StyleSheet, Text } from 'react-native';

export const OverlayButton = ({
    onPress,
    displayValue,
    icon,
    absolute = true,
    disabled = false,
}) => {
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={[styles.button, absolute && styles.floating]}>
            {icon || <Text style={styles.buttonText}>{displayValue}</Text>}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    button: {
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
    floating: { position: 'absolute', bottom: 50, right: 20 },
    buttonText: { color: 'white', fontSize: 14, fontWeight: '600' },
});
