import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import SvgCanvas from '@/features/reports/components/svgCanvas';
import { SIGNATURE_ROLES } from '@/features/reports/constants/signatureRoles';
import { validateReportAct } from '@/features/reports/lib/validateReportAct';
import { generateActPdf } from '@/features/reports/lib/generateActPdf';
import useReportActStore from '@/features/reports/store/useReportActStore';
import FormButton from '@/shared/components/button/formButton';
import ScreenLayout from '@/shared/components/screen/screenLayout';

const ReportSignatureCapture = ({ onError }) => {
    const router = useRouter();
    const [session] = useState(() => useReportActStore.getState().session);
    const completeSession = useReportActStore((state) => state.completeSession);
    const [isSaving, setIsSaving] = useState(false);
    const savingRef = useRef(false);
    const closingRef = useRef(false);
    const mountedRef = useRef(true);
    const isValidSession = Boolean(session && SIGNATURE_ROLES[session.role]);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    return (
        <GestureHandlerRootView style={styles.container}>
            <ScreenLayout safe style={styles.screen}>
                <Text style={styles.title}>
                    {isValidSession
                        ? SIGNATURE_ROLES[session.role].label
                        : 'Подпись'}
                </Text>
                {isValidSession ? (
                    <>
                        <Text style={styles.hint}>
                            Нарисуйте подпись и сохраните её для обновления
                            акта.
                        </Text>
                        <SvgCanvas
                            isSaving={isSaving}
                            onSave={async (strokes) => {
                                if (savingRef.current) return;
                                if (!strokes.some((stroke) => stroke.length)) {
                                    onError(
                                        'Подпись отсутствует',
                                        'Нарисуйте подпись перед сохранением.'
                                    );
                                    return;
                                }
                                savingRef.current = true;
                                setIsSaving(true);
                                try {
                                    await validateReportAct({
                                        taskId: session.taskId,
                                        values: session.values,
                                    });
                                    const actPdf = {
                                        ...session.values.actPdf,
                                        isRefused: false,
                                        signatures: {
                                            ...session.values.actPdf
                                                ?.signatures,
                                            [session.role]: strokes,
                                        },
                                    };
                                    const generatedAct = await generateActPdf({
                                        template: session.template,
                                        values: { ...session.values, actPdf },
                                    });
                                    if (mountedRef.current) {
                                        await validateReportAct({
                                            taskId: session.taskId,
                                            values: session.values,
                                        });
                                        if (!mountedRef.current) return;
                                        if (!completeSession(generatedAct))
                                            throw new Error(
                                                'Акт изменился. Вернитесь в отчёт и пересоздайте его.'
                                            );
                                        closingRef.current = true;
                                        router.back();
                                    }
                                } catch {
                                    if (mountedRef.current)
                                        onError(
                                            'Не удалось обновить акт',
                                            'Попробуйте сохранить подпись ещё раз. Если ошибка повторится, вернитесь в отчёт и пересоздайте акт.'
                                        );
                                } finally {
                                    if (!closingRef.current) {
                                        savingRef.current = false;
                                        if (mountedRef.current)
                                            setIsSaving(false);
                                    }
                                }
                            }}
                        />
                    </>
                ) : (
                    <Text style={styles.hint}>
                        Откройте подпись со страницы акта.
                    </Text>
                )}
                <FormButton
                    message='Назад'
                    onPress={() => router.back()}
                    disabled={isSaving}
                />
            </ScreenLayout>
        </GestureHandlerRootView>
    );
};

export default ReportSignatureCapture;

const styles = StyleSheet.create({
    container: { flex: 1 },
    screen: { gap: 16 },
    title: { fontSize: 22, fontWeight: '600', color: '#172b4d' },
    hint: { fontSize: 14, color: '#62758f' },
});
