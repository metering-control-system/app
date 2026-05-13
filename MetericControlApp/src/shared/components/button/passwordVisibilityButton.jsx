import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

const PasswordVisibilityButton = ({ isVisible, disabled, onPress }) => {
    return (
        <Pressable
            accessibilityRole='button'
            accessibilityLabel={isVisible ? 'Скрыть пароль' : 'Показать пароль'}
            hitSlop={8}
            disabled={disabled}
            style={styles.toggle}
            onPress={onPress}>
            <Ionicons
                name={isVisible ? 'eye-off' : 'eye'}
                size={22}
                color='#727272'
            />
        </Pressable>
    );
};

const styles = StyleSheet.create({
    toggle: {
        width: 44,
        minHeight: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default PasswordVisibilityButton;
