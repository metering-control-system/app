import { ensureActFileExists } from '@/features/reports/lib/ensureActFileExists';
import { PdfView } from 'react-native-pdf-light';
import { Modal, Pressable, StyleSheet } from 'react-native';
import { ZoomPdfView } from 'react-native-pdf-light/Zoom';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useCallback, useEffect, useState } from 'react';

const OverlayPdfViewer = ({ visible, onClose, source, onError }) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType='fade'
            onRequestClose={onClose}>
            <GestureHandlerRootView>
                <Pressable style={styles.overlay} onPress={onClose}>
                    <Pressable
                        style={styles.menu}
                        onPress={(e) => {
                            e.stopPropagation();
                        }}>
                        <ZoomPdfView
                            onError={onError}
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

const PdfViewer = ({ onError, source }) => {
    const [visible, setVisible] = useState(false);

    const [unavailable, setUnavailable] = useState(false);
    const handleError = useCallback(() => {
        setVisible(false);
        setUnavailable(true);
        onError(
            'Не удалось открыть акт',
            'Файл недоступен или повреждён. Сгенерируйте акт заново.'
        );
    }, [onError]);
    useEffect(() => {
        setUnavailable(false);
        if (!source) return;
        try {
            ensureActFileExists(source);
        } catch {
            handleError();
        }
    }, [source, handleError]);
    if (!source || unavailable) return null;
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
                } catch {
                    handleError();
                }
            }}
            disabled={!source}>
            <PdfView
                page={0}
                style={{ flex: 1 }}
                source={source}
                onError={handleError}
                resizeMode='contain'
            />
            <OverlayPdfViewer
                onError={handleError}
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
