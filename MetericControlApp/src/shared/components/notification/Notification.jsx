import { colors } from '@/shared/consts/baseColors';
import {
    Text,
    View,
    StyleSheet,
    Pressable,
    ScrollView,
    useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Entypo } from '@expo/vector-icons';

const Notification = ({
    variant = 'primary',
    message,
    handleClose,
    onPress,
}) => {
    const insets = useSafeAreaInsets();
    const { height } = useWindowDimensions();
    const textMaxHeight = Math.max(
        44,
        Math.min(
            180,
            (height - insets.top - insets.bottom) * 0.35 - (onPress ? 66 : 22)
        )
    );
    if (!message) return null;
    const palette = colors[variant];

    return (
        <View
            pointerEvents='box-none'
            style={[styles.notification, { top: insets.top + 8 }]}>
            <View
                style={[
                    styles.card,
                    {
                        backgroundColor: palette.backgroundColor,
                        borderColor: palette.borderColor,
                    },
                ]}>
                <View style={styles.content}>
                    <ScrollView
                        key={message}
                        style={[
                            styles.messageScroll,
                            { maxHeight: textMaxHeight },
                        ]}
                        nestedScrollEnabled
                        keyboardShouldPersistTaps='handled'
                        showsVerticalScrollIndicator>
                        <Text
                            accessibilityRole='alert'
                            accessibilityLiveRegion='polite'
                            style={[styles.text, { color: palette.color }]}>
                            {message}
                        </Text>
                    </ScrollView>
                    {onPress && (
                        <Pressable
                            onPress={onPress}
                            accessibilityRole='button'
                            style={styles.retry}>
                            <Text
                                style={[styles.text, { color: palette.color }]}>
                                Повторить
                            </Text>
                        </Pressable>
                    )}
                </View>
                <Pressable
                    onPress={handleClose}
                    accessibilityRole='button'
                    accessibilityLabel='Закрыть сообщение'
                    style={styles.close}>
                    <Entypo name='cross' size={24} color={palette.color} />
                </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    notification: {
        position: 'absolute',
        left: 10,
        right: 10,
        zIndex: 1000,
        elevation: 20,
        alignItems: 'center',
    },
    card: {
        width: '100%',
        maxWidth: 420,
        padding: 10,
        borderRadius: 12,
        borderWidth: 1,
        gap: 8,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    content: { flex: 1 },
    messageScroll: { flexGrow: 0 },
    text: { fontSize: 14, lineHeight: 20, flexShrink: 1 },
    close: {
        minWidth: 44,
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    retry: { minHeight: 44, justifyContent: 'center' },
});

export default Notification;
