import { useController } from 'react-hook-form';
import { StyleSheet, Text, TextInput } from 'react-native';
import { colors } from '@/shared/consts/baseColors';

export const FormInput = ({ control, name, placeholder, ...other }) => {
    const {
        field,
        fieldState: { invalid, error },
    } = useController({ name, control, rules: { required: true } });

    return (
        <>
            <TextInput
                name={name}
                style={[styles.control, error && styles.inputError]}
                value={field.value}
                onBlur={field.onBlur}
                onChangeText={field.onChange}
                placeholder={placeholder}
                accessibilityLabelledBy={name}
                {...other}
            />
            {invalid && <Text style={styles.error}>{error.message}</Text>}
        </>
    );
};

const styles = StyleSheet.create({
    control: {
        color: '#000',
        width: '100%',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    error: { color: colors.warning.color, fontSize: 12 },
    inputError: { borderColor: '#d84c4c', backgroundColor: '#fff5f5' },
});
