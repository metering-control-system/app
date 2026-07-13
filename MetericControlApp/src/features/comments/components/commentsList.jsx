import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useReceiveComments } from '@/features/comments/hooks/useReceiveComments';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ScreenLoader from '@/shared/components/loader/screenLoader';
import { Comment } from '@/features/comments/components/comment';
import { usePullNewComments } from '@/features/comments/hooks/usePullNewComments';
import { sortMessages } from '@/features/comments/lib/sortMessages';
import { ScrollListButton } from '@/features/comments/components/scrollListButton';
import Notification from '@/shared/components/notification/Notification';

const CommentsList = ({ comments, id, userId, ref, onSelectComment }) => {
    const [listHeight, setListHeight] = useState(0);
    const [contentHeight, setContentHeight] = useState(0);
    const isAutoFetchingRef = useRef(false);

    const {
        fetchNextPage,
        isPending,
        isFetching,
        isFetchingNextPage,
        hasNextPage,
        rehydrateError,
        rehydrateLocaleComments,
    } = useReceiveComments(id);

    const { newCommentsNumber, setNewCommentsNumber, newCommentsIds } =
        usePullNewComments(
            Number(id) === 0 ? null : +id,
            isPending || isFetching
        );

    useEffect(() => {
        if (
            !hasNextPage ||
            isFetching ||
            isFetchingNextPage ||
            isAutoFetchingRef.current
        ) {
            return;
        }

        if (
            listHeight > 0 &&
            contentHeight > 0 &&
            contentHeight <= listHeight
        ) {
            isAutoFetchingRef.current = true;
            fetchNextPage({ cancelRefetch: false }).finally(() => {
                isAutoFetchingRef.current = false;
            });
        }
    }, [
        contentHeight,
        listHeight,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
        fetchNextPage,
    ]);

    const displayedComments = useMemo(() => {
        if (comments) {
            return sortMessages(comments);
        }
    }, [comments]);

    const renderItem = useCallback(
        ({ item: comment }) => (
            <Comment
                comment={comment}
                isPending={comment?.isPending}
                isOwn={comment?.author_id === userId}
                onPress={onSelectComment}
                id={id}
            />
        ),
        [userId, onSelectComment]
    );

    const handleScrolledMessages = useCallback(({ viewableItems }) => {
        viewableItems.forEach((viewableItem) => {
            if (newCommentsIds.has(viewableItem.item.id)) {
                newCommentsIds.delete(viewableItem.item.id);
                setNewCommentsNumber(newCommentsIds.size);
            }
        });
    }, []);

    const scrollToBottom = () => {
        ref.current.scrollToOffset({ offset: 0, animated: true });
        setNewCommentsNumber(0);
    };

    if (isPending) {
        return <ScreenLoader />;
    }

    return (
        <View
            style={styles.container}
            onLayout={(event) => {
                setListHeight(event.nativeEvent.layout.height);
            }}>
            {(rehydrateError ?? null) && (
                <Notification
                    variant='warning'
                    message={rehydrateError}
                    onPress={rehydrateLocaleComments}
                />
            )}
            <FlatList
                ref={ref}
                data={displayedComments}
                style={styles.list}
                renderItem={renderItem}
                keyExtractor={(item) => item.localId}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<Text>No comments found.</Text>}
                onContentSizeChange={(_, height) => {
                    setContentHeight(height);
                }}
                inverted
                removeClippedSubviews
                maxToRenderPerBatch={15}
                windowSize={15}
                initialNumToRender={15}
                keyboardShouldPersistTaps='handled'
                onStartReached={() => {
                    if (hasNextPage && !isFetching && !isFetchingNextPage) {
                        fetchNextPage({ cancelRefetch: false });
                    }
                }}
                viewabilityConfig={{
                    minimumViewTime: 100,
                    viewAreaCoveragePercentThreshold: 10,
                }}
                onViewableItemsChanged={handleScrolledMessages}
                onStartReachedThreshold={0.5}
                ListFooterComponent={
                    isFetchingNextPage && (
                        <Text style={styles.loadingText}>Идет загрузка...</Text>
                    )
                }
            />
            {newCommentsNumber > 0 && (
                <ScrollListButton
                    scrollToBottom={scrollToBottom}
                    displayValue={newCommentsNumber}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, minWidth: '100%', position: 'relative' },
    list: { flexGrow: 1 },
    loadingText: { alignSelf: 'center', marginHorizontal: 10 },
});

export default CommentsList;
