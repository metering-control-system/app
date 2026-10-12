import { ensureActFileExists } from '@/features/reports/lib/ensureActFileExists';
import { PdfUtil, PdfView } from 'react-native-pdf-light';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { ZoomPdfView } from 'react-native-pdf-light/Zoom';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useCallback, useEffect, useState } from 'react';

const OverlayPdfViewer = ({
    visible,
    onClose,
    source,
    onError,
    pageCount,
    page,
    setPage,
}) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType='fade'
            onRequestClose={onClose}>
            <GestureHandlerRootView style={styles.root}>
                <Pressable style={styles.overlay} onPress={onClose}>
                    <Pressable
                        style={styles.menu}
                        onPress={(e) => {
                            e.stopPropagation();
                        }}>
                        <ZoomPdfView
                            onError={onError}
                            key={`${source}-${page}`}
                            page={page}
                            style={{ flex: 1 }}
                            source={source ?? ''}
                            resizeMode='contain'
                        />
                        <View style={styles.pagination}>
                            <Pressable
                                accessibilityLabel='Предыдущая страница'
                                disabled={page === 0}
                                onPress={() =>
                                    setPage((current) => current - 1)
                                }
                                style={[
                                    styles.pageButton,
                                    page === 0 && styles.disabled,
                                ]}>
                                <Text style={styles.pageButtonText}>Назад</Text>
                            </Pressable>
                            <Text style={styles.pageCount}>
                                {page + 1} / {pageCount}
                            </Text>
                            <Pressable
                                accessibilityLabel='Следующая страница'
                                disabled={page >= pageCount - 1}
                                onPress={() =>
                                    setPage((current) => current + 1)
                                }
                                style={[
                                    styles.pageButton,
                                    page >= pageCount - 1 && styles.disabled,
                                ]}>
                                <Text style={styles.pageButtonText}>Далее</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </Pressable>
            </GestureHandlerRootView>
        </Modal>
    );
};

const PdfViewer = ({ onError, source }) => {
    const [visible, setVisible] = useState(false);
    const [page, setPage] = useState(0);
    const [pageCount, setPageCount] = useState(1);

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
        let active = true;
        setUnavailable(false);
        setVisible(false);
        setPage(0);
        setPageCount(1);
        if (!source) return;
        try {
            ensureActFileExists(source);
            PdfUtil.getPageCount(source)
                .then((count) => {
                    if (!active) return;
                    if (!Number.isInteger(count) || count < 1) {
                        handleError();
                        return;
                    }
                    setPageCount(count);
                })
                .catch(() => {
                    if (active) handleError();
                });
        } catch {
            handleError();
        }
        return () => {
            active = false;
        };
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
                page={page}
                style={{ flex: 1 }}
                source={source}
                onError={handleError}
                resizeMode='contain'
            />
            <OverlayPdfViewer
                onError={handleError}
                page={page}
                setPage={setPage}
                pageCount={pageCount}
                visible={visible}
                onClose={() => setVisible(false)}
                source={source}
            />
        </Pressable>
    );
};
export default PdfViewer;

const styles = StyleSheet.create({
    root: { flex: 1 },
    pagination: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        backgroundColor: '#fff',
    },
    pageButton: { padding: 12, borderRadius: 8, backgroundColor: '#278cff' },
    pageButtonText: { color: '#fff', fontWeight: '600' },
    pageCount: { color: '#183153' },
    disabled: { opacity: 0.35 },
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
