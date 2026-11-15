import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import SvgCanvas from '@/features/acts/components/svgCanvas';
import { SIGNATURE_ROLES } from '@/features/acts/constants/signatureRoles';
import { validateAct } from '@/features/acts/lib/validateAct';
import { generateActPdf } from '@/features/acts/lib/generateActPdf';
import useActStore from '@/features/acts/store/useActStore';
import FormButton from '@/shared/components/button/formButton';
import ScreenLayout from '@/shared/components/screen/screenLayout';

const ActSignatureCapture = ({ onError, onSaved }) => {
    const router = useRouter();
    const [session, setSession] = useState(
        () => useActStore.getState().session
    );
    const completeSession = useActStore((state) => state.completeSession);
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

    const saveSignature = async (strokes, { clear = false } = {}) => {
        if (savingRef.current) return false;
        if (!clear && !strokes.some((stroke) => stroke.length)) {
            onError(
                'Подпись отсутствует',
                'Нарисуйте подпись перед сохранением.'
            );
            return false;
        }
        savingRef.current = true;
        setIsSaving(true);
        try {
            await validateAct({
                taskId: session.taskId,
                actPdf: session.values.actPdf,
                fields: session.fields,
            });
            const signatures = { ...session.values.actPdf?.signatures };
            if (clear) delete signatures[session.role];
            else signatures[session.role] = strokes;
            const actPdf = {
                ...session.values.actPdf,
                isRefused: false,
                signatures,
            };
            const generatedAct = await generateActPdf({
                template: session.template,
                fields: session.fields,
                actPdf,
            });
            if (!mountedRef.current) return false;
            await validateAct({
                taskId: session.taskId,
                actPdf: session.values.actPdf,
                fields: session.fields,
            });
            if (!mountedRef.current) return false;
            if (
                !completeSession(generatedAct, {
                    keepSession: clear,
                    expectedSession: session,
                })
            )
                throw new Error(
                    'Акт изменился. Вернитесь в отчёт и пересоздайте его.'
                );
            onSaved({
                taskId: session.taskId,
                values: session.values,
                actPdf: generatedAct,
            });
            if (clear) {
                setSession(useActStore.getState().session);
            } else {
                closingRef.current = true;
                router.back();
            }
            return true;
        } catch {
            if (mountedRef.current)
                onError(
                    'Не удалось обновить акт',
                    'Попробуйте ещё раз. Если ошибка повторится, вернитесь в отчёт и пересоздайте акт.'
                );
            return false;
        } finally {
            if (!closingRef.current) {
                savingRef.current = false;
                if (mountedRef.current) setIsSaving(false);
            }
        }
    };

    const clearSignature = () => {
        if (!session.values.actPdf?.signatures?.[session.role]?.length)
            return true;
        return saveSignature([], { clear: true });
    };

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
                            initialStrokes={
                                session.values.actPdf?.signatures?.[
                                    session.role
                                ]
                            }
                            onSave={saveSignature}
                            onClear={clearSignature}
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

export default ActSignatureCapture;

const styles = StyleSheet.create({
    container: { flex: 1 },
    screen: { gap: 16 },
    title: { fontSize: 22, fontWeight: '600', color: '#172b4d' },
    hint: { fontSize: 14, color: '#62758f' },
});
