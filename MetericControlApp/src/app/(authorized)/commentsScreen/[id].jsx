import useErrors from '@/shared/hooks/useErrors';
import Notification from '@/shared/components/notification/Notification';
import { useLocalSearchParams } from 'expo-router';
import ScreenLayout from '@/shared/components/screen/screenLayout';
import useCommentsStore from '@/features/comments/store/useCommentsStore';
import CommentsList from '@/features/comments/components/commentsList';
import SendMessagePanel from '@/features/comments/components/sendMessagePanel';
import CommentActionModal from '@/features/comments/components/commentActionModal';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useCallback, useRef, useState } from 'react';
import { useMe } from '@/features/comments/hooks/useMe';

const CommentsScreen = () => {
    const { error: errorMessage, handleError, dismissError } = useErrors();

    const { id } = useLocalSearchParams();
    const comments = useCommentsStore(
        (state) => state.comments[Number(id) === 0 ? null : +id]
    );
    const user = useMe();
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
                    onError={handleError}
                    comments={comments}
                    id={id}
                    userId={user?.user_id}
                    ref={scrollRef}
                    onSelectComment={handleSelectComment}
                />
                <SendMessagePanel
                    onError={handleError}
                    chatId={Number(id) === 0 ? null : +id}
                    userId={user?.user_id}
                    listRef={scrollRef}
                />
            </KeyboardAvoidingView>
            <CommentActionModal
                onError={handleError}
                comment={selectedComment}
                taskId={id}
                visible={!!selectedComment}
                onClose={() => setSelectedComment(null)}
            />
            <Notification
                variant='warning'
                message={errorMessage}
                handleClose={dismissError}
            />
        </ScreenLayout>
    );
};

export default CommentsScreen;
