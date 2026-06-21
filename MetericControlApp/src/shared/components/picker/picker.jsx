import {
    Animated,
    FlatList,
    Keyboard,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';

const Picker = ({
    variants,
    state,
    setState,
    multiSelect,
    label,
    canBeOpened,
    setCanBeOpened,
    icon,
}) => {
    const [opened, setOpened] = useState(false);
    const animValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (opened && canBeOpened) {
            Animated.timing(animValue, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start();
        } else {
            animValue.setValue(0);
        }
    }, [opened, canBeOpened, animValue]);

    const selectedCount = multiSelect && state instanceof Set ? state.size : 0;

    return (
        <View style={styles.picker}>
            <TouchableOpacity
                style={styles.select}
                onPress={() => {
                    if (canBeOpened) {
                        setOpened(true);
                    } else {
                        setCanBeOpened(true);
                        Keyboard.dismiss();
                    }
                }}
                activeOpacity={0.7}>
                {canBeOpened ? (
                    <Text
                        style={styles.selectText}
                        numberOfLines={1}
                        ellipsizeMode='clip'>
                        {label}
                        {selectedCount > 0 && ` (${selectedCount})`}
                    </Text>
                ) : (
                    <FontAwesome5 name={icon} size={20} color='#727272' />
                )}
                <Ionicons name='chevron-down' size={14} color='#999' />
            </TouchableOpacity>
            {opened && (
                <>
                    <Pressable
                        style={StyleSheet.absoluteFill}
                        onPress={() => setOpened(false)}
                    />
                    <Animated.View
                        style={[
                            styles.selectionZone,
                            {
                                opacity: animValue,
                                transform: [
                                    {
                                        translateY: animValue.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [-8, 0],
                                        }),
                                    },
                                ],
                            },
                        ]}>
                        <FlatList
                            data={variants}
                            keyExtractor={(variant) => variant[0]}
                            renderItem={({ item }) => (
                                <Pressable
                                    style={styles.option}
                                    onPress={(event) => {
                                        event.stopPropagation();

                                        if (!multiSelect) {
                                            setOpened(false);
                                            setState((prev) =>
                                                prev === item[0]
                                                    ? null
                                                    : item[0]
                                            );
                                        } else {
                                            const newSet = new Set(state);
                                            state.has(item[0])
                                                ? newSet.delete(item[0])
                                                : newSet.add(item[0]);
                                            setState(newSet);
                                        }
                                    }}>
                                    <Ionicons
                                        name={
                                            multiSelect && state.has(item[0])
                                                ? 'checkmark-circle'
                                                : !multiSelect &&
                                                    state === item[0]
                                                  ? 'checkmark-circle'
                                                  : null
                                        }
                                        size={15}
                                        color={'blue'}
                                    />
                                    <Text style={styles.optionText}>
                                        {item[1]}
                                    </Text>
                                </Pressable>
                            )}
                        />
                    </Animated.View>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    picker: { maxWidth: '50%', flexDirection: 'column', position: 'relative' },
    select: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    selectText: { fontSize: 13, color: '#333', flexShrink: 1 },
    selectionZone: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        zIndex: 10,
        backgroundColor: 'white',
        borderRadius: 8,
        elevation: 6,
        maxHeight: 200,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    optionText: { fontSize: 14, color: '#333' },
});

export default Picker;
