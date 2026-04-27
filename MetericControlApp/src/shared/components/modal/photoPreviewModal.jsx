import { Modal, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';

const PhotoPreviewModal = ({ uri, modalVisible, setModalVisible }) => {
    return (
        <Modal
            animationType='fade'
            visible={modalVisible}
            transparent
            onRequestClose={() => setModalVisible(false)}>
            <View style={styles.centeredView}>
                <View style={styles.container}>
                    <Image
                        source={{ uri }}
                        style={styles.image}
                        contentFit='cover'
                    />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        justifyContent: 'center',
        alignItems: 'center',
        top: '35%',
    },
    container: {
        alignSelf: 'center',
        width: '90%',
        aspectRatio: 16 / 9,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    image: { width: '100%', height: '100%', borderRadius: 12 },
});

export default PhotoPreviewModal;
