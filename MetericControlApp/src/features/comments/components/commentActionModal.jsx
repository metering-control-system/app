import { useState } from 'react';
import {
    Alert,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import useCommentActions from '@/features/comments/hooks/useCommentActions';

const CommentActionModal = ({ onError, comment, taskId, visible, onClose }) => {
    const [editVisible, setEditVisible] = useState(false);
    const [editText, setEditText] = useState(comment?.content ?? '');
    const { handleEdit, handleDelete, isEditing } = useCommentActions(taskId);

    const onDelete = () => {
        onClose();
        Alert.alert('Удалить комментарий?', '', [
            { text: 'Отмена', style: 'cancel' },
            {
                text: 'Удалить',
                style: 'destructive',
                onPress: () =>
                    handleDelete({ commentId: comment.id }).catch(() =>
                        onError(
                            'Не удалось удалить комментарий',
                            'Проверьте подключение и повторите попытку.'
                        )
                    ),
            },
        ]);
    };

    const onEdit = () => {
        setEditText(comment?.content ?? '');
        setEditVisible(true);
    };

    const onSaveEdit = () => {
        if (editText.trim() && editText !== comment?.content) {
            void handleEdit({
                commentId: comment?.id,
                content: editText.trim(),
            }).catch(() =>
                onError(
                    'Не удалось изменить комментарий',
                    'Проверьте подключение и повторите редактирование.'
                )
            );
        }
        onClose();
        setEditVisible(false);
    };

    return (
        <>
            <Modal
                visible={visible}
                transparent
                animationType='fade'
                onRequestClose={onClose}>
                <Pressable style={styles.overlay} onPress={onClose}>
                    <Pressable style={styles.menu}>
                        <Text style={styles.menuTitle}>Действия</Text>
                        <Pressable style={styles.menuItem} onPress={onEdit}>
                            <MaterialIcons name='edit' size={20} color='#fff' />
                            <Text style={styles.menuItemText}>
                                Редактировать
                            </Text>
                        </Pressable>
                        <Pressable style={styles.menuItem} onPress={onDelete}>
                            <MaterialIcons
                                name='delete'
                                size={20}
                                color='#ff4444'
                            />
                            <Text style={styles.menuItemTextDanger}>
                                Удалить
                            </Text>
                        </Pressable>
                        <Pressable
                            style={[styles.menuItem, styles.menuItemCancel]}
                            onPress={onClose}>
                            <Text style={styles.menuItemText}>Отмена</Text>
                        </Pressable>
                    </Pressable>
                </Pressable>
            </Modal>

            <Modal
                visible={editVisible}
                transparent
                animationType='fade'
                onRequestClose={() => setEditVisible(false)}>
                <Pressable
                    style={styles.overlay}
                    onPress={() => setEditVisible(false)}>
                    <Pressable style={styles.editModal}>
                        <Text style={styles.menuTitle}>
                            Редактировать комментарий
                        </Text>
                        <TextInput
                            style={styles.editInput}
                            value={editText}
                            onChangeText={setEditText}
                            multiline
                            autoFocus
                        />
                        <View style={styles.editButtons}>
                            <Pressable
                                style={styles.editButton}
                                onPress={() => setEditVisible(false)}>
                                <Text style={styles.editButtonText}>
                                    Отмена
                                </Text>
                            </Pressable>
                            <Pressable
                                style={[
                                    styles.editButton,
                                    styles.editButtonSave,
                                ]}
                                onPress={onSaveEdit}
                                disabled={isEditing || !editText.trim()}>
                                <Text style={styles.editButtonText}>
                                    Сохранить
                                </Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menu: {
        backgroundColor: '#2a2a2a',
        borderRadius: 16,
        padding: 20,
        width: '80%',
        gap: 8,
    },
    menuTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        textAlign: 'center',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
    },
    menuItemCancel: {
        borderTopWidth: 1,
        borderTopColor: '#444',
        justifyContent: 'center',
        marginTop: 4,
    },
    menuItemText: { color: '#fff', fontSize: 16 },
    menuItemTextDanger: { color: '#ff4444', fontSize: 16 },
    editModal: {
        backgroundColor: '#2a2a2a',
        borderRadius: 16,
        padding: 20,
        width: '85%',
    },
    editInput: {
        color: '#fff',
        backgroundColor: '#383838',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        minHeight: 80,
        textAlignVertical: 'top',
        marginBottom: 12,
    },
    editButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
    editButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    editButtonSave: { backgroundColor: '#4CAF50' },
    editButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default CommentActionModal;
