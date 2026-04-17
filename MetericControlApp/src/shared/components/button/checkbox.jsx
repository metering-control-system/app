import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Checkbox = ({ active, setActive, size = 10 }) => {
    return (
        <Pressable
            style={[
                styles.checkbox,
                { width: size, height: size },
                active && styles.active,
            ]}
            onPress={setActive}>
            {active && (
                <Ionicons
                    name='checkmark-sharp'
                    size={Math.ceil(size / 1.5)}
                    color='#fff'
                />
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    checkbox: {
        borderRadius: 8,
        backgroundColor: '#fff',
        borderColor: '#ddd',
        borderWidth: 1,
        borderStyle: 'solid',
        justifyContent: 'center',
        alignItems: 'center',
    },
    active: { backgroundColor: '#0080ff' },
});

export default Checkbox;
