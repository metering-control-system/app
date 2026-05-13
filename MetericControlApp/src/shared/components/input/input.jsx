import { useController } from 'react-hook-form';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '@/shared/consts/baseColors';
import PasswordVisibilityButton from '@/shared/components/button/passwordVisibilityButton';

export const FormInput = ({
    control,
    name,
    placeholder,
    multiline,
    secureTextEntry,
    editable = true,
    ...other
}) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const {
        field,
        fieldState: { invalid, error },
    } = useController({ name, control });
    const hasPasswordToggle = secureTextEntry && !multiline;

    return (
        <>
            <View
                style={[
                    styles.control,
                    error && styles.inputError,
                    !editable && styles.disabled,
                ]}>
                <TextInput
                    name={name}
                    style={[
                        styles.input,
                        hasPasswordToggle && styles.inputWithToggle,
                    ]}
                    value={field.value}
                    onBlur={field.onBlur}
                    onChangeText={field.onChange}
                    placeholder={placeholder}
                    accessibilityLabelledBy={name}
                    multiline={multiline}
                    secureTextEntry={secureTextEntry && !isPasswordVisible}
                    editable={editable}
                    {...other}
                />
                {hasPasswordToggle && (
                    <PasswordVisibilityButton
                        isVisible={isPasswordVisible}
                        disabled={!editable}
                        onPress={() =>
                            setIsPasswordVisible((previous) => !previous)
                        }
                    />
                )}
            </View>
            {invalid && <Text style={styles.error}>{error.message}</Text>}
        </>
    );
};

const styles = StyleSheet.create({
    control: {
        width: '100%',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        color: '#000',
        flex: 1,
        minHeight: 48,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    inputWithToggle: { paddingRight: 4 },
    error: { color: colors.warning.color, fontSize: 12 },
    disabled: { opacity: 0.75 },
    inputError: { borderColor: '#d84c4c', backgroundColor: '#fff5f5' },
});
