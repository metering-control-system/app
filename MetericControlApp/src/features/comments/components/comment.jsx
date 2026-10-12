import Card from '@/shared/components/wrapper/card';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useCallback, useMemo } from 'react';
import { detectReference } from '@/features/comments/lib/detectReference';

const Comment = ({
    comment,
    isPending,
    isOwn,
    onPress,
    references,
    onReferencePress,
}) => {
    const referencePattern = useMemo(() => {
        const tags = Object.keys(references ?? {});
        if (!tags.length) return null;
        return new RegExp(
            `(${tags
                .sort((first, second) => second.length - first.length)
                .map((tag) => tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
                .join('|')})(?=$|[\\s.,!?;:»”)])`,
            'gi'
        );
    }, [references]);

    const getCommentText = useCallback(
        (message) => {
            const parts = referencePattern
                ? (message?.split(referencePattern) ?? [])
                : [message ?? ''];
            return parts.map((part, index) => {
                const reference = part.replace(/[.,!?;:»”)]*$/, '');
                if (!detectReference(reference, references)) return part;
                return (
                    <Text
                        key={`${index}-${part}`}
                        onPress={(event) => {
                            event.stopPropagation();
                            onReferencePress?.(reference);
                        }}
                        style={styles.reference}>
                        {part}
                    </Text>
                );
            });
        },
        [referencePattern, references, onReferencePress]
    );

    return (
        <Pressable
            onPress={() => isOwn && !isPending && onPress?.(comment)}
            style={[
                styles.commentSection,
                { alignItems: isOwn ? 'flex-end' : 'flex-start' },
            ]}>
            <View style={styles.rowWrapper}>
                {isOwn ? (
                    <View style={styles.ownBadge}>
                        <Text style={styles.ownBadgeText}>Я</Text>
                    </View>
                ) : (
                    <MaterialIcons name='person' size={24} color='#92B637' />
                )}
                <View style={styles.contentFlex}>
                    <Card style={isOwn ? styles.ownCard : styles.otherCard}>
                        <Text>{getCommentText(comment.content)}</Text>
                    </Card>
                    {isPending && (
                        <View style={styles.pendingWrapper}>
                            <MaterialIcons
                                name='downloading'
                                size={10}
                                color='#555'
                            />
                        </View>
                    )}
                </View>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    reference: { fontWeight: 'bold', color: '#0076a5' },
    commentSection: {
        width: '100%',
        paddingHorizontal: 5,
        paddingVertical: 10,
        position: 'relative',
    },
    rowWrapper: {
        width: '85%',
        flexDirection: 'row',
        gap: 5,
        alignItems: 'center',
    },
    contentFlex: { flex: 1 },
    pendingWrapper: { alignItems: 'flex-start', marginTop: 4 },
    ownBadge: {
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 5,
        paddingHorizontal: 10,
        backgroundColor: '#0094cf',
    },
    ownBadgeText: { color: 'white' },
    ownCard: { borderLeftWidth: 3, borderLeftColor: '#0094cf' },
    otherCard: { borderLeftWidth: 3, borderLeftColor: '#92B637' },
});

export { Comment };
