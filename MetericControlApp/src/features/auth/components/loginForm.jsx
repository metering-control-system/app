import { StyleSheet, Text, View } from 'react-native';
import { useForm } from 'react-hook-form';
import { FormInput } from '@/shared/components/input/input';
import { loginSchema } from '@/features/auth/validation/loginSchema';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { zodResolver } from '@hookform/resolvers/zod';
import FormButton from '@/shared/components/button/formButton';
import { getApiErrorMessage } from '@/shared/api/getApiErrorMessage';

const LoginForm = ({ setError }) => {
    const { handleSubmit, control } = useForm({
        defaultValues: { login: '', password: '' },
        resolver: zodResolver(loginSchema),
    });
    const { isPending, userLogin } = useLogin();

    const onSubmit = async (data) => {
        if (isPending) {
            return;
        }
        try {
            setError(null);
            await userLogin({
                login: data.login.trim(),
                password: data.password,
            });
        } catch (error) {
            setError(
                error?.response?.status === 401
                    ? 'Неверный логин или пароль. Проверьте данные и попробуйте снова.'
                    : getApiErrorMessage(
                          error,
                          'Не удалось войти. Попробуйте ещё раз.'
                      )
            );
        }
    };

    const onError = (error) => {
        setError(
            error.login?.message ??
                error.password?.message ??
                'Проверьте логин и пароль.'
        );
    };

    return (
        <View style={styles.form}>
            <View style={styles.field}>
                <Text style={styles.label}>Логин</Text>
                <FormInput
                    name='login'
                    control={control}
                    placeholder='Введите логин'
                    textContentType='username'
                    returnKeyType='done'
                    editable={!isPending}
                    autoFocus
                    autoComplete='username'
                />
            </View>
            <View style={styles.field}>
                <Text style={styles.label}>Пароль</Text>
                <FormInput
                    name='password'
                    control={control}
                    placeholder='Введите пароль'
                    secureTextEntry
                    textContentType='password'
                    returnKeyType='done'
                    editable={!isPending}
                    autoComplete='password'
                />
            </View>
            <View style={styles.field}>
                <FormButton
                    onPress={handleSubmit(onSubmit, onError)}
                    isPending={isPending}
                    disabled={isPending}
                    message='Войти'
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    form: {
        width: '100%',
        flexDirection: 'column',
        borderRadius: 12,
        rowGap: 5,
        minHeight: 100,
        boxSizing: 'border-box',
        shadowColor: '#000',
        shadowOffset: { width: 10, height: 50 },
        shadowOpacity: 1,
        shadowRadius: 10,
        paddingHorizontal: 5,
        paddingVertical: 5,
        backgroundColor: 'white',
        marginBottom: 15,
    },
    field: { width: '100%', padding: 15, alignItems: 'flex-start', gap: 5 },
    label: { fontSize: 12, color: 'black', marginBottom: 10 },
});

export default LoginForm;
