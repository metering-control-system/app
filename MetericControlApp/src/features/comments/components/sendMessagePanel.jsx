import useSendComment from '@/features/comments/hooks/useSendComment';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useDeferredValue, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { filterDetectedReferences } from '@/features/comments/lib/detectReference';
import { TipsList } from '@/features/comments/components/tipsList';

const SendMessagePanel = ({ chatId, userId, listRef }) => {
    const [message, setMessage] = useState('');
    const { handleComment } = useSendComment(userId);
    const [tips, setTips] = useState([]);
    const deferredTips = useDeferredValue(tips, []);

    const lastWord = message.split(/\s+/).at(-1).trim();

    useEffect(() => {
        const filteredTips = filterDetectedReferences(lastWord);
        setTips(filteredTips?.length ? filteredTips : []);
    }, [message]);

    const handleTipPress = (tip) => {
        const words = message.split(/\s+/);
        words[words.length - 1] = tip;
        setMessage(words.join(' ') + ' ');
    };

    return (
        <View style={{ position: 'relative' }}>
            {deferredTips?.length !== 0 && (
                <TipsList
                    displayedTips={deferredTips}
                    onTipPress={handleTipPress}
                    searchQuery={lastWord}
                />
            )}
            <View style={styles.panelRow}>
                <TextInput
                    style={styles.input}
                    value={message}
                    onChangeText={setMessage}
                    placeholder='Введите сообщение'
                    cursorColor='white'
                    multiline
                    numberOfLines={10}
                    autoFocus
                    textAlignVertical='top'
                />
                <Pressable
                    style={({ pressed }) => [
                        styles.sendButton,
                        !message && styles.disabled,
                        pressed && message && styles.sendButtonPressed,
                    ]}
                    disabled={!message}
                    onPress={async () => {
                        listRef.current?.scrollToOffset({
                            offset: 0,
                            animated: false,
                        });
                        await handleComment({ id: chatId, message });
                        setMessage('');
                    }}>
                    <Ionicons name='send-sharp' size={14} color='white' />
                </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    panelRow: {
        paddingVertical: 10,
        paddingHorizontal: 5,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    input: {
        color: 'white',
        backgroundColor: '#383838',
        flex: 1,
        minHeight: 48,
        padding: 5,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#555',
    },
    sendButton: {
        borderRadius: 100,
        backgroundColor: '#0094cf',
        padding: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonPressed: { opacity: 0.8 },
    disabled: { opacity: 0.4 },
});

export default SendMessagePanel;
