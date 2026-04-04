import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';

export default function ScreenLayout({ safe, children, ...other }) {
    const insets = useSafeAreaInsets();

    if (!safe) {
        return (
            <View style={[styles.container, other.style ?? '']}>
                {children}
            </View>
        );
    }

    return (
        <View
            style={[
                styles.container,
                { paddingTop: insets.top, paddingBottom: insets.bottom },
                other.style ?? '',
            ]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 20,
        backgroundColor: '#e1ebfd',
        boxSizing: 'border-box',
    },
});
