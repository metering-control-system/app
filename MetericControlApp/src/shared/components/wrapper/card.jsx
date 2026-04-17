import { Pressable, StyleSheet, Text, View } from 'react-native';

const Card = ({ clickable, title, titleAlign, style, children, ...other }) => {
    if (clickable) {
        return (
            <Pressable
                style={({ pressed }) => [
                    styles.card,
                    pressed && styles.active,
                    style,
                ]}
                {...other}>
                <>
                    {title && (
                        <Text
                            style={[
                                styles.title,
                                { alignSelf: titleAlign || 'flex-start' },
                            ]}>
                            {title}
                        </Text>
                    )}
                    {children}
                </>
            </Pressable>
        );
    }

    return (
        <View style={[styles.card, style]} {...other}>
            {title && (
                <Text
                    style={[
                        styles.title,
                        { alignSelf: titleAlign && 'flex-start' },
                    ]}>
                    {title}
                </Text>
            )}
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        width: '100%',
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        gap: 7,
        minHeight: 100,
        boxSizing: 'border-box',
        elevation: 3,
    },
    active: { opacity: 0.75 },
    title: { fontSize: 16, fontWeight: 'bold' },
});

export default Card;
