import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import useCommentsStore from '@/features/comments/store/useCommentsStore';
import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { sortMessages } from '@/features/comments/lib/sortMessages';

export const ShrinkedChat = ({ reportId, onPress }) => {
    const comments = useCommentsStore(
        (state) => state.comments[Number(reportId) === 0 ? null : +reportId]
    );

    const displayedComments = useMemo(() => {
        if (comments) {
            return sortMessages(comments);
        }
    }, [comments]);

    return (
        <View style={styles.wrapper}>
            <Pressable onPress={onPress} style={styles.header}>
                <Ionicons
                    name='chatbubble-ellipses'
                    size={16}
                    color='#0094cf'
                />
                <Text style={styles.headerText}>
                    {comments?.length ? 'Комментарии' : 'Комментировать отчет'}
                </Text>
                <Ionicons name='chevron-forward' size={16} color='#999' />
            </Pressable>
            {comments?.length > 0 && (
                <View style={styles.listArea}>
                    <FlatList
                        data={displayedComments}
                        renderItem={({ item }) => (
                            <View style={styles.bubble}>
                                <Text
                                    numberOfLines={1}
                                    style={styles.commentText}>
                                    {item.content}
                                </Text>
                            </View>
                        )}
                        keyExtractor={(item) => item?.localId}
                        scrollEnabled
                        nestedScrollEnabled
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        borderRadius: 16,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        overflow: 'hidden',
        marginHorizontal: 8,
        marginBottom: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#fafafa',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#333' },
    listArea: { height: 90, paddingHorizontal: 12, paddingVertical: 6 },
    bubble: {
        backgroundColor: '#f0f4ff',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 6,
        alignSelf: 'flex-start',
        maxWidth: '85%',
        marginVertical: 3,
    },
    commentText: { fontSize: 13, color: '#333' },
});
