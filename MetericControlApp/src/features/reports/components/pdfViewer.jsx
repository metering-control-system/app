import { PdfView } from 'react-native-pdf-light';
import { Modal, Pressable, StyleSheet } from 'react-native';
import { ZoomPdfView } from 'react-native-pdf-light/Zoom';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useState } from 'react';

const OverlayPdfViewer = ({ visible, onClose, source }) => {
    return (
        <Modal visible={visible} transparent animationType='fade'>
            <GestureHandlerRootView>
                <Pressable style={styles.overlay} onPress={onClose}>
                    <Pressable
                        style={styles.menu}
                        onPress={(e) => {
                            e.stopPropagation();
                        }}>
                        <ZoomPdfView
                            page={0}
                            style={{ flex: 1 }}
                            source={source ?? ''}
                            resizeMode='contain'
                        />
                    </Pressable>
                </Pressable>
            </GestureHandlerRootView>
        </Modal>
    );
};

const PdfViewer = ({ source }) => {
    const [visible, setVisible] = useState(false);

    return (
        <Pressable
            style={({ pressed }) => [
                {
                    flex: 1,
                    minHeight: 300,
                    backgroundColor: '#6c6c6c0f',
                    borderWidth: 1,
                    borderColor: '#6c6c6c',
                    borderStyle: 'solid',
                    opacity: pressed ? 0.9 : 1,
                    marginBottom: 20,
                },
            ]}
            onPress={() => setVisible(true)}>
            <PdfView
                page={0}
                style={{ flex: 1 }}
                source={source ?? ''}
                shrinkToFit='never'
            />
            <OverlayPdfViewer
                visible={visible}
                onClose={() => setVisible(false)}
                source={source}
            />
        </Pressable>
    );
};
export default PdfViewer;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menu: { aspectRatio: '3/4', width: '90%' },
});
