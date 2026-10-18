import { Button, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import ScreenLayout from '@/shared/components/screen/screenLayout';
import { FontAwesome } from '@expo/vector-icons';
import { useState } from 'react';

const CameraPermissionScreen = ({ style, requestPermission }) => {
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <View style={style}>
            <ScreenLayout safe style={[styles.topBar]}>
                <Pressable onPress={() => setModalVisible(true)}>
                    <FontAwesome
                        name='question-circle'
                        size={22}
                        color='#aaa'
                    />
                </Pressable>
            </ScreenLayout>
            <Text style={styles.message}>
                Нужен доступ к камере, чтобы сделать фото счетчика
            </Text>
            <Button
                onPress={requestPermission}
                title='Разрешить доступ к камере'
            />
            <Modal
                animationType='slide'
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}>
                <View style={styles.centeredView}>
                    <Text style={styles.title}>
                        Как выдать разрешения камере?
                    </Text>
                    <Text style={styles.message}>
                        Нажмите «Разрешить доступ к камере» и подтвердите
                        системный запрос. Можно разрешить доступ только на этот
                        раз. Если система больше не показывает запрос, включите
                        доступ к камере в настройках приложения.
                    </Text>
                    <Button
                        onPress={() => setModalVisible(false)}
                        title='Понятно'
                    />
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    title: { marginBottom: 20, fontSize: 18, fontWeight: 'bold' },
    message: { textAlign: 'center', marginBottom: 16, fontSize: 16 },
    topBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    topBarActions: { flexDirection: 'row', gap: 12 },
    centeredView: {
        justifyContent: 'center',
        alignItems: 'center',
        top: '35%',
    },
});

export default CameraPermissionScreen;
