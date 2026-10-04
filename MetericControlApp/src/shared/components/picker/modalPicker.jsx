import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import OptionsList from '@/shared/components/details/optionsList';

const ModalPicker = ({
    visible,
    onClose,
    state,
    variants,
    multiSelect,
    setState,
    label,
    children,
}) => {
    const onSelect = (item) => {
        if (!multiSelect) {
            setState((prev) => (prev === item[0] ? null : item[0]));
            onClose();
        } else {
            const newSet = new Set(state);
            state.has(item[0]) ? newSet.delete(item[0]) : newSet.add(item[0]);
            setState(newSet);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType='fade'
            onRequestClose={onClose}>
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable
                    style={styles.menu}
                    onPress={(e) => e.stopPropagation()}>
                    <Text style={styles.menuTitle}>{label}</Text>

                    <View style={styles.pickerWrapper}>
                        <OptionsList
                            variants={variants}
                            state={state}
                            multiSelect={multiSelect}
                            onSelect={onSelect}
                            optionStyle={styles.option}
                            textStyle={styles.optionText}
                            iconColor='#888'
                            selectedIconColor='#278cff'
                        />
                    </View>

                    {children && (
                        <View style={styles.selectedItem}>
                            <Text style={styles.selectedLabel}>Выбрано:</Text>
                            <Text style={styles.selectedText}>{children}</Text>
                        </View>
                    )}

                    {multiSelect && state instanceof Set && state.size > 0 && (
                        <Text style={styles.selectedCount}>
                            Выбрано: {state.size}
                        </Text>
                    )}

                    <Pressable
                        style={[styles.menuItem, styles.menuItemCancel]}
                        onPress={onClose}>
                        <Text style={styles.menuItemText}>Отмена</Text>
                    </Pressable>
                </Pressable>
            </Pressable>
        </Modal>
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
        width: '85%',
        maxHeight: '70%',
    },
    menuTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
        textAlign: 'center',
    },
    pickerWrapper: {
        backgroundColor: '#383838',
        borderRadius: 12,
        marginBottom: 16,
        maxHeight: 250,
    },
    selectedItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 16,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#383838',
        borderRadius: 12,
    },
    selectedLabel: { color: '#888', fontSize: 14 },
    selectedText: { color: '#278cff', fontSize: 16, fontWeight: '600' },
    selectedCount: {
        color: '#888',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 12,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    optionText: { color: '#fff', fontSize: 16 },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        justifyContent: 'center',
    },
    menuItemCancel: { borderTopWidth: 1, borderTopColor: '#444', marginTop: 8 },
    menuItemText: { color: '#fff', fontSize: 16 },
});

export default ModalPicker;
