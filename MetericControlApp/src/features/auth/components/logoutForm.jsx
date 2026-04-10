import useLogout from '@/features/auth/hooks/useLogout';
import FormButton from '@/shared/components/button/formButton';
import { StyleSheet, View } from 'react-native';

const LogoutForm = () => {
    const { isPending, logoutUser } = useLogout();

    const handleLogout = async () => {
        if (!isPending) {
            void logoutUser();
        }
    };

    return (
        <View style={styles.form}>
            <FormButton
                isPending={isPending}
                onPress={handleLogout}
                message='Выйти'
            />
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
});

export default LogoutForm;
