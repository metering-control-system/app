import ScreenLayout from '@/shared/components/screen/screenLayout';
import { Text, StyleSheet } from 'react-native';
import LoginForm from '@/features/auth/components/loginForm';
import { useState } from 'react';
import Notification from '@/shared/components/notification/Notification';

const LoginScreen = () => {
    const [error, setError] = useState();

    return (
        <ScreenLayout safe centered>
            {error && <Notification variant='warning' message={error} />}
            <Text style={styles.title}>Войдите в приложение</Text>
            <LoginForm setError={setError} />
        </ScreenLayout>
    );
};

const styles = StyleSheet.create({
    title: { fontSize: 20, fontWeight: 'semibold', marginBottom: 20 },
});

export default LoginScreen;
