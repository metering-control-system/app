import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';

export default function ScreenLayout({
    safe,
    centered,
    style,
    children,
    ...other
}) {
    const insets = useSafeAreaInsets();

    if (!safe) {
        return (
            <View
                style={[
                    styles.container,
                    centered && {
                        justifyContent: 'center',
                        alignItems: 'center',
                    },
                    style,
                ]}
                {...other}>
                {children}
            </View>
        );
    }

    return (
        <View
            style={[
                styles.container,
                { paddingTop: insets.top, paddingBottom: insets.bottom },
                centered && { justifyContent: 'center', alignItems: 'center' },
                style,
            ]}
            {...other}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 10,
        paddingVertical: 20,
        boxSizing: 'border-box',
        position: 'relative',
    },
});
