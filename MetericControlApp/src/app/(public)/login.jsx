import ScreenLayout from '@/shared/components/screen/screenLayout';
import { Text, StyleSheet } from 'react-native';
import LoginForm from '@/features/auth/components/loginForm';
import { useState } from 'react';
import Notification from '@/shared/components/notification/Notification';
import { DismissKeyboardWrapper } from '@/shared/components/wrapper/dismissKeyboardWrapper';

const LoginScreen = () => {
    const [error, setError] = useState();

    return (
        <DismissKeyboardWrapper style={styles.dismissKeyboard}>
            <ScreenLayout safe centered>
                {error && (
                    <Notification
                        variant='warning'
                        message={error}
                        handleClose={() => setError(null)}
                    />
                )}
                <Text style={styles.title}>Войдите в приложение</Text>
                <LoginForm setError={setError} />
            </ScreenLayout>
        </DismissKeyboardWrapper>
    );
};

const styles = StyleSheet.create({
    title: { fontSize: 20, fontWeight: '600', marginBottom: 20 },
    dismissKeyboard: { flex: 1 },
});

export default LoginScreen;
