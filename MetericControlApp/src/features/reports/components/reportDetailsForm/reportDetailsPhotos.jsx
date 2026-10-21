import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import Image from '@/shared/components/media/authenticatedImage';
import ImagePreview from '@/shared/components/media/imagePreview';
import { REPORT_PHOTO_CONFIGS } from '@/features/reports/constants/reportPhotoConfigs';
import { groupReportPhotos } from '@/features/reports/lib/groupReportPhotos';
import {
    ReportFieldTarget,
    Section,
} from '@/features/reports/components/reportDetailsForm/reportDetailsLayout';

const ReportDetailsPhotos = ({
    images,
    onError,
    highlightedField,
    fillPositions,
}) => {
    const [previewUri, setPreviewUri] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const photoGroups = groupReportPhotos(images);
    return (
        <>
            <Section title='Фотографии' icon='images-outline'>
                {photoGroups.length === 0 ? (
                    <Text style={styles.emptyText}>
                        Фотографии не добавлены.
                    </Text>
                ) : (
                    photoGroups.map((group) => (
                        <ReportFieldTarget
                            key={group.kind}
                            name={group.field}
                            highlightedField={highlightedField}
                            fillPositions={fillPositions}>
                            <View style={styles.photoGroup}>
                                <View style={styles.photoHeading}>
                                    <Text style={styles.photoTitle}>
                                        {group.title}
                                    </Text>
                                    <Text style={styles.photoCount}>
                                        {group.photos.length}
                                    </Text>
                                </View>
                                <View style={styles.photoGrid}>
                                    {group.photos.map((photo, index) => (
                                        <Pressable
                                            key={photo.client_image_id ?? index}
                                            accessibilityRole='button'
                                            accessibilityLabel={`${group.title}, фото ${index + 1}`}
                                            disabled={!photo.url}
                                            onPress={() => {
                                                setPreviewUri(photo.url);
                                                setModalVisible(true);
                                            }}
                                            style={({ pressed }) => [
                                                styles.photoTile,
                                                pressed && styles.pressed,
                                            ]}>
                                            <Image
                                                source={photo.url}
                                                style={styles.image}
                                                contentFit='cover'
                                            />
                                            <View style={styles.expandIcon}>
                                                <Ionicons
                                                    name='expand-outline'
                                                    size={16}
                                                    color='#fff'
                                                />
                                            </View>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>
                        </ReportFieldTarget>
                    ))
                )}
                {highlightedField?.startsWith('photos.') &&
                    !photoGroups.some(
                        (group) => group.field === highlightedField
                    ) && (
                        <ReportFieldTarget
                            name={highlightedField}
                            highlightedField={highlightedField}
                            fillPositions={fillPositions}>
                            <Text style={styles.emptyText}>
                                {
                                    REPORT_PHOTO_CONFIGS.find(
                                        ({ name }) =>
                                            `photos.${name}` ===
                                            highlightedField
                                    )?.title
                                }
                                : фотографии не добавлены.
                            </Text>
                        </ReportFieldTarget>
                    )}
            </Section>
            <ImagePreview
                onError={onError}
                uri={previewUri}
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                editable={false}
            />
        </>
    );
};

export default ReportDetailsPhotos;

const styles = StyleSheet.create({
    emptyText: {
        fontSize: 14,
        lineHeight: 21,
        color: '#64748b',
        paddingVertical: 8,
    },
    photoGroup: { marginTop: 12 },
    photoHeading: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    photoTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#475569',
        flexShrink: 1,
    },
    photoCount: {
        fontSize: 12,
        color: '#64748b',
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: 8,
    },
    photoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: 10,
    },
    photoTile: {
        width: '48%',
        aspectRatio: 4 / 3,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#f1f5f9',
    },
    image: { width: '100%', height: '100%' },
    expandIcon: {
        position: 'absolute',
        right: 8,
        bottom: 8,
        padding: 5,
        borderRadius: 8,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
    },
    pressed: { opacity: 0.75 },
});
