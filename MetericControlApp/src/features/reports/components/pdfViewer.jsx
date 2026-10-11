import { ensureActFileExists } from '@/features/reports/lib/ensureActFileExists';
import { PdfView } from 'react-native-pdf-light';
import { Alert, Modal, Pressable, StyleSheet, Text } from 'react-native';
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

    if (!source) {
        return null;
    }
    try {
        ensureActFileExists(source);
    } catch (error) {
        return <Text>{error.message}</Text>;
    }
    return (
        <Pressable
            style={({ pressed }) => [
                styles.overlayButton,
                { opacity: pressed ? 0.9 : 1 },
            ]}
            onPress={() => {
                try {
                    ensureActFileExists(source);
                    setVisible(true);
                } catch (error) {
                    Alert.alert('Акт недоступен', error.message);
                }
            }}
            disabled={!source}>
            <PdfView
                page={0}
                style={{ flex: 1 }}
                source={source}
                onError={(event) => console.error(event.message)}
                resizeMode='contain'
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
    overlayButton: {
        flex: 1,
        minHeight: 300,
        backgroundColor: '#6c6c6c0f',
        borderWidth: 1,
        borderColor: '#cecece',
        borderStyle: 'solid',
        marginBottom: 20,
    },
});
