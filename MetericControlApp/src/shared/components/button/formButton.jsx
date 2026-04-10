import { Pressable, Text, StyleSheet } from 'react-native';

const FormButton = ({ message, onPress, isPending, disabled }) => {
    return (
        <Pressable
            style={({ pressed }) => [
                styles.button,
                (pressed || disabled) && { opacity: 0.75 },
            ]}
            disabled={isPending}
            onPress={onPress}>
            <Text style={styles.text}>
                {isPending ? '...Загрузка' : message}
            </Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    button: {
        width: '100%',
        paddingVertical: 20,
        backgroundColor: 'blue',
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
