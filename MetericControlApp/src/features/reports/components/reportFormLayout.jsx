import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const STEP_LABELS = [
    'До работ',
    'Монтаж',
    'Фото',
    'Допуск',
    'Контакты',
    'Реквизиты',
    'Акт',
];

export const ReportFormSection = ({
    title,
    icon = 'document-text-outline',
    description,
    children,
}) => (
    <View style={styles.section}>
        <View style={styles.sectionHeading}>
            <View style={styles.sectionIcon}>
                <Ionicons name={icon} size={20} color='#2469c9' />
            </View>
            <View style={styles.headingText}>
                <Text style={styles.sectionTitle}>{title}</Text>
                {description ? (
                    <Text style={styles.description}>{description}</Text>
                ) : null}
            </View>
        </View>
        {children}
    </View>
);

export const ReportFieldLayout = ({ name, fillPositions, children }) => (
    <View
        ref={(node) => fillPositions({ name, node })}
        collapsable={false}
        onLayout={() => fillPositions({ name })}>
        {children}
    </View>
);

export const ReportFormSteps = ({ steps, activeIndex, onChange, disabled }) => {
    const scrollRef = useRef(null);
    const positionsRef = useRef({});
    useEffect(() => {
        scrollRef.current?.scrollTo({
            x: positionsRef.current[activeIndex] ?? 0,
            animated: true,
        });
    }, [activeIndex]);
    return (
        <View style={styles.steps}>
            <View style={styles.progressHeading}>
                <Text style={styles.stepCounter}>
                    ШАГ {activeIndex + 1} ИЗ {steps.length}
                </Text>
                <Text style={styles.progressHint}>
                    Можно перейти к любому шагу
                </Text>
            </View>
            <ScrollView
                ref={scrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tabs}>
                {steps.map((step, index) => (
                    <Pressable
                        key={step.key}
                        accessibilityRole='tab'
                        accessibilityLabel={`Шаг ${index + 1}: ${step.title}`}
                        accessibilityState={{
                            selected: index === activeIndex,
                            disabled,
                        }}
                        disabled={disabled}
                        onPress={() => onChange(index)}
                        onLayout={(e) => {
                            positionsRef.current[index] =
                                e.nativeEvent.layout.x;
                            if (index === activeIndex)
                                scrollRef.current?.scrollTo({
                                    x: e.nativeEvent.layout.x,
                                    animated: false,
                                });
                        }}
                        style={[
                            styles.tab,
                            index === activeIndex && styles.tabActive,
                        ]}>
                        <Text
                            style={[
                                styles.tabNumber,
                                index === activeIndex && styles.tabTextActive,
                            ]}>
                            {index + 1}
                        </Text>
                        <Text
                            style={[
                                styles.tabText,
                                index === activeIndex && styles.tabTextActive,
                            ]}>
                            {STEP_LABELS[index]}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>
            <Text style={styles.currentTitle}>{steps[activeIndex].title}</Text>
            <View style={styles.progressTrack}>
                {steps.map((step, index) => (
                    <View
                        key={step.key}
                        style={[
                            styles.progressSegment,
                            index === activeIndex && styles.progressActive,
                        ]}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e4eaf2',
        borderRadius: 18,
        padding: 16,
        gap: 2,
    },
    sectionHeading: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 18,
    },
    sectionIcon: {
        width: 38,
        height: 38,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#edf4fe',
    },
    headingText: { flex: 1, gap: 4 },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#1d314c',
        lineHeight: 23,
    },
    description: { fontSize: 13, lineHeight: 19, color: '#758399' },
    steps: { gap: 16, paddingVertical: 18 },
    progressHeading: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 6,
    },
    stepCounter: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
        color: '#2469c9',
    },
    progressHint: { fontSize: 11, color: '#758399' },
    tabs: { gap: 8, paddingRight: 8 },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 14,
        minHeight: 46,
        borderRadius: 13,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e7f0',
    },
    tabActive: { backgroundColor: '#2469c9', borderColor: '#2469c9' },
    tabNumber: { color: '#758399', fontSize: 12, fontWeight: '700' },
    tabText: { fontSize: 14, color: '#52627a', fontWeight: '600' },
    tabTextActive: { color: '#fff' },
    currentTitle: {
        fontSize: 23,
        lineHeight: 30,
        fontWeight: '700',
        color: '#1d314c',
    },
    progressTrack: { flexDirection: 'row', gap: 5 },
    progressSegment: {
        height: 4,
        borderRadius: 2,
        flex: 1,
        backgroundColor: '#dde5ef',
    },
    progressActive: { backgroundColor: '#2469c9' },
});
