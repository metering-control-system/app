import { useLocalSearchParams } from 'expo-router';
import ScreenLayout from '@/shared/components/screen/screenLayout';
import useCommentsStore from '@/features/comments/store/useCommentsStore';
import CommentsList from '@/features/comments/components/commentsList';
import SendMessagePanel from '@/features/comments/components/sendMessagePanel';
import CommentActionModal from '@/features/comments/components/commentActionModal';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useCallback, useRef, useState } from 'react';

const CommentsScreen = () => {
    const { id } = useLocalSearchParams();
    const comments = useCommentsStore(
        (state) => state.comments[Number(id) === 0 ? null : +id]
    );

    const [selectedComment, setSelectedComment] = useState(null);
    const scrollRef = useRef(null);

    const handleSelectComment = useCallback((comment) => {
        setSelectedComment(comment);
    }, []);

    return (
        <ScreenLayout safe>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                keyboardVerticalOffset={100}
                behavior={'translate-with-padding'}>
                <CommentsList
                    comments={comments}
                    id={id}
                    userId={undefined}
                    ref={scrollRef}
                    onSelectComment={handleSelectComment}
                />
                <SendMessagePanel
                    chatId={Number(id) === 0 ? null : +id}
                    userId={undefined}
                    listRef={scrollRef}
                />
            </KeyboardAvoidingView>
            <CommentActionModal
                comment={selectedComment}
                taskId={id}
                visible={!!selectedComment}
                onClose={() => setSelectedComment(null)}
            />
        </ScreenLayout>
    );
};

export default CommentsScreen;
