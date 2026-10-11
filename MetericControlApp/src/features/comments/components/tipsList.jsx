import {
    Animated,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useEffect, useRef } from 'react';

const HighlightedText = ({ text, query }) => {
    if (!query) return <Text style={styles.optionKey}>{text}</Text>;

    const idx = text.indexOf(query);
    if (idx === -1) return <Text style={styles.optionKey}>{text}</Text>;

    return (
        <Text style={styles.optionKey}>
            <Text>{text.slice(0, idx)}</Text>
            <Text style={styles.highlight}>{query}</Text>
            <Text>{text.slice(idx + query.length)}</Text>
        </Text>
    );
};

export const TipsList = ({
    displayedTips,
    onTipPress,
    searchQuery,
    references,
}) => {
    const animValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(animValue, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [animValue]);

    return (
        <Animated.View style={[styles.selectionZone, { opacity: animValue }]}>
            <FlatList
                data={displayedTips}
                keyExtractor={(tip) => tip}
                renderItem={({ item }) => {
                    const meta = references?.[item];
                    return (
                        <Pressable
                            onPress={() => onTipPress?.(item)}
                            style={({ pressed }) => [
                                styles.option,
                                pressed && styles.optionPressed,
                            ]}>
                            <View style={styles.optionContent}>
                                <HighlightedText
                                    text={item}
                                    query={searchQuery}
                                />
                                {meta?.label && (
                                    <Text style={styles.optionLabel}>
                                        {meta.label}
                                    </Text>
                                )}
                            </View>
                            {meta?.step !== undefined && (
                                <View style={styles.stepBadge}>
                                    <Text style={styles.stepBadgeText}>
                                        {meta.stepLabel}
                                    </Text>
                                </View>
                            )}
                        </Pressable>
                    );
                }}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps='handled'
            />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    selectionZone: {
        position: 'absolute',
        bottom: '100%',
        left: 0,
        right: 0,
        zIndex: 10,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        maxHeight: 220,
        marginHorizontal: 5,
        marginBottom: 4,
        overflow: 'hidden',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    optionPressed: { backgroundColor: '#f0f6ff' },
    optionContent: { flex: 1, gap: 2 },
    optionKey: {
        fontSize: 13,
        fontWeight: '600',
        color: '#183153',
        fontFamily: 'monospace',
    },
    highlight: { color: '#0094cf', fontWeight: '700' },
    optionLabel: { fontSize: 12, color: '#7b8794', marginTop: 1 },
    stepBadge: {
        backgroundColor: '#eaf4ff',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
        marginLeft: 10,
    },
    stepBadgeText: { fontSize: 10, color: '#0094cf', fontWeight: '600' },
    separator: { height: 1, backgroundColor: '#f0f0f0', marginHorizontal: 14 },
});
