import { colors } from '@/shared/consts/baseColors';
import { Text, View, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Entypo } from '@expo/vector-icons';

const Notification = ({ variant, message, handleClose }) => {
    const insets = useSafeAreaInsets();

    if (!message) {
        return null;
    }

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

                {handleClose && (
                    <Pressable onPress={handleClose}>
                        <Entypo
                            name='circle-with-cross'
                            size={16}
                            color={colors[variant ?? 'primary'].color}
                        />
                    </Pressable>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    notification: { position: 'absolute', alignSelf: 'center', top: 0 },
    card: {
        minWidth: 120,
        width: '100%',
        maxWidth: 420,
        padding: 10,
        borderRadius: 12,
        borderWidth: 1,
        columnGap: 10,
        flexDirection: 'row',
    },
    text: { fontSize: 12, flexShrink: 1, flexWrap: 'wrap' },
});

export default Notification;
