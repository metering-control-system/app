import { colors } from '@/shared/consts/baseColors';
import { Text, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Notification = ({ variant, message }) => {
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.notification}>
            <View
                style={[
                    styles.card,
                    { marginTop: insets.top },
                    {
                        backgroundColor:
                            colors[variant ?? 'primary'].backgroundColor,
                        borderColor: colors[variant ?? 'primary'].borderColor,
                    },
                ]}>
                <Text
                    style={[
                        styles.text,
                        { color: colors[variant ?? 'primary'].color },
                    ]}>
                    {message}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    notification: { position: 'absolute', alignSelf: 'center', top: 0 },
    card: { minWidth: 120, padding: 10, borderRadius: 12, borderWidth: 1 },
    text: { fontSize: 12 },
});

export default Notification;
