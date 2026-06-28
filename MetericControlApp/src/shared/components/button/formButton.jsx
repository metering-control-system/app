import { Pressable, Text, StyleSheet } from 'react-native';

const FormButton = ({
    message,
    onPress,
    isPending,
    disabled,
    style,
    textStyle,
}) => {
    return (
        <Pressable
            style={({ pressed }) => [
                styles.button,
                (pressed || disabled) && { opacity: 0.75 },
                { ...style },
            ]}
            disabled={disabled}
            onPress={onPress}>
            <Text style={[styles.text, textStyle]}>
                {isPending ? '...Загрузка' : message}
            </Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    button: {
        width: '100%',
        paddingVertical: 20,
        backgroundColor: '#0080ff',
        borderRadius: 10,
    },
    text: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default FormButton;
