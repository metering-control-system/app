import Card from '@/shared/components/wrapper/card';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useCallback } from 'react';
import { detectReference } from '@/features/comments/lib/detectReference';
import { useRouter } from 'expo-router';

const Comment = ({ comment, isPending, isOwn, onPress, id }) => {
    const router = useRouter();

    const getCommentText = useCallback((message) => {
        const content = message?.split(/\s+/).filter(Boolean);

        return (
            <Text>
                {content?.reduce((prev, curr) => {
                    if (detectReference(curr))
                        return (
                            <>
                                <Text>{`${prev} `}</Text>
                                <Text
                                    onPress={() =>
                                        router.push({
                                            pathname: `/(authorized)/taskFlow/${id}`,
                                            params: { reference: curr },
                                        })
                                    }
                                    style={{ fontWeight: 'bold' }}>
                                    <Text>{curr}</Text>
                                </Text>
                            </>
                        );
                    return `${prev} ${curr}`;
                }, '')}
            </Text>
        );
    }, []);

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
                        {getCommentText(comment.content)}
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
