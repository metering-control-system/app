import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { SIGNATURE_ROLES } from '@/features/reports/constants/signatureRoles';
import PdfViewer from '@/features/reports/components/pdfViewer';
import ModalPicker from '@/shared/components/picker/modalPicker';
import FormButton from '@/shared/components/button/formButton';

const ActDocumentPanel = ({
    templates,
    template,
    onTemplateChange,
    actPdf,
    isBusy,
    isLoadingTemplates,
    isUpToDated,
    isGenerating,
    onRefreshTemplates,
    onGenerate,
    onShare,
    onSign,
}) => {
    const [pickerVisible, setPickerVisible] = useState(false);
    const selectedTemplate = templates.find((item) => item.id === template);
    const disabled = isBusy || actPdf.isRefused || !selectedTemplate;
    const fields = Array.from(
        (selectedTemplate?.html ?? '').matchAll(/\{\{\s*([^}]+?)\s*}}/g),
        (match) => match[1]
    );

    return (
        <View style={styles.container}>
            <View style={styles.section}>
                <View style={styles.headingRow}>
                    <Text style={styles.heading}>1. Шаблон акта</Text>
                    <Pressable
                        accessibilityRole='button'
                        onPress={onRefreshTemplates}
                        disabled={isBusy || isLoadingTemplates || isUpToDated}
                        style={({ pressed }) => [
                            styles.textButton,
                            (pressed || isLoadingTemplates || isUpToDated) &&
                                styles.dimmed,
                        ]}>
                        <Text style={styles.link}>
                            {isLoadingTemplates
                                ? 'Загрузка…'
                                : isUpToDated
                                  ? 'Обновлено'
                                  : 'Обновить список'}
                        </Text>
                    </Pressable>
                </View>
                <Pressable
                    accessibilityRole='button'
                    accessibilityLabel='Выбрать шаблон акта'
                    onPress={() => setPickerVisible(true)}
                    disabled={isBusy || !templates.length}
                    style={({ pressed }) => [
                        styles.template,
                        pressed && styles.dimmed,
                    ]}>
                    <FontAwesome name='file-text-o' size={20} color='#278cff' />
                    <Text style={styles.templateName}>
                        {selectedTemplate?.name ?? 'Выберите шаблон'}
                    </Text>
                    <FontAwesome
                        name='chevron-down'
                        size={12}
                        color='#62758f'
                    />
                </Pressable>
                {!templates.length && (
                    <Text style={styles.hint}>
                        Загрузите шаблоны, чтобы подготовить акт.
                    </Text>
                )}
            </View>
            {actPdf.isRefused ? (
                <Text style={styles.hint}>
                    Генерация акта пропущена. Выключите переключатель выше,
                    чтобы создать и подписать документ.
                </Text>
            ) : (
                <>
                    <View style={styles.section}>
                        <Text style={styles.heading}>2. Документ</Text>
                        <FormButton
                            message={
                                actPdf.uri
                                    ? 'Пересоздать акт'
                                    : 'Сгенерировать акт'
                            }
                            onPress={onGenerate}
                            isPending={isGenerating}
                            disabled={disabled}
                            style={styles.generateButton}
                        />
                        {actPdf.uri ? (
                            <>
                                <PdfViewer source={actPdf.uri} />
                                <View style={styles.headingRow}>
                                    <Text style={styles.previewHint}>
                                        Нажмите на акт, чтобы увеличить
                                    </Text>
                                    <Pressable
                                        accessibilityRole='button'
                                        onPress={onShare}
                                        disabled={isBusy}
                                        style={styles.textButton}>
                                        <Text style={styles.link}>
                                            Поделиться
                                        </Text>
                                    </Pressable>
                                </View>
                            </>
                        ) : (
                            <Text style={styles.hint}>
                                Создайте акт и проверьте данные перед
                                подписанием.
                            </Text>
                        )}
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.heading}>3. Подписи</Text>
                        <Text style={styles.hint}>
                            Выберите участника. После сохранения подписи акт
                            обновится автоматически.
                        </Text>
                        <View style={styles.signatures}>
                            {Object.entries(SIGNATURE_ROLES).map(
                                ([role, { label, placeholders }]) => {
                                    const supported = placeholders.some(
                                        (field) => fields.includes(field)
                                    );
                                    const signed = actPdf.signatures?.[
                                        role
                                    ]?.some((stroke) => stroke.length);
                                    return (
                                        <Pressable
                                            key={role}
                                            accessibilityRole='button'
                                            accessibilityLabel={`${label}. ${signed ? 'Подпись сохранена. Подписать заново' : 'Добавить подпись'}`}
                                            disabled={
                                                disabled ||
                                                !supported ||
                                                !actPdf.uri
                                            }
                                            onPress={() => onSign(role)}
                                            style={({ pressed }) => [
                                                styles.signatureRow,
                                                (pressed ||
                                                    disabled ||
                                                    !supported ||
                                                    !actPdf.uri) &&
                                                    styles.dimmed,
                                            ]}>
                                            <FontAwesome
                                                name={
                                                    signed
                                                        ? 'check-circle'
                                                        : 'pencil'
                                                }
                                                size={20}
                                                color={
                                                    signed
                                                        ? '#2b8655'
                                                        : '#62758f'
                                                }
                                            />
                                            <View style={styles.signatureText}>
                                                <Text
                                                    style={
                                                        styles.signatureLabel
                                                    }>
                                                    {label}
                                                </Text>
                                                <Text style={styles.hint}>
                                                    {!supported
                                                        ? 'Не предусмотрено шаблоном'
                                                        : signed
                                                          ? 'Сохранена · нажмите, чтобы подписать заново'
                                                          : role ===
                                                              'utilityRepresentative'
                                                            ? 'При участии представителя'
                                                            : 'Не добавлена'}
                                                </Text>
                                            </View>
                                            <FontAwesome
                                                name='chevron-right'
                                                size={12}
                                                color='#62758f'
                                            />
                                        </Pressable>
                                    );
                                }
                            )}
                        </View>
                    </View>
                </>
            )}
            <ModalPicker
                variants={templates.map((item) => [item.id, item.name])}
                state={template}
                setState={onTemplateChange}
                label='Выберите шаблон'
                visible={pickerVisible}
                onClose={() => setPickerVisible(false)}
            />
        </View>
    );
};

export default ActDocumentPanel;

const styles = StyleSheet.create({
    container: { gap: 24 },
    section: { gap: 12 },
    headingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        flexWrap: 'wrap',
    },
    heading: { fontSize: 16, fontWeight: '600', color: '#183153' },
    hint: { fontSize: 12, lineHeight: 18, color: '#62758f' },
    previewHint: { flex: 1, fontSize: 12, lineHeight: 18, color: '#62758f' },
    textButton: {
        minHeight: 44,
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    link: { fontSize: 13, fontWeight: '600', color: '#1a5eb0' },
    template: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: '#d5deea',
        borderRadius: 12,
        backgroundColor: '#fff',
    },
    templateName: { flex: 1, fontSize: 14, color: '#183153' },
    generateButton: { paddingVertical: 14 },
    signatures: {
        borderWidth: 1,
        borderColor: '#d5deea',
        borderRadius: 12,
        backgroundColor: '#fff',
        overflow: 'hidden',
    },
    signatureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 14,
    },
    signatureText: { flex: 1, gap: 4 },
    signatureLabel: { fontSize: 14, fontWeight: '500', color: '#183153' },
    dimmed: { opacity: 0.5 },
});
