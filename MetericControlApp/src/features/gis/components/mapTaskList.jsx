import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useEffect } from 'react';

export const MapTaskList = ({
    title,
    selectedTasks,
    goToTask,
    tilePressed,
}) => {
    const listAnim = useSharedValue(0);

    const listAnimatedStyle = useAnimatedStyle(() => ({
        opacity: listAnim.value,
    }));

    useEffect(() => {
        if (title) {
            listAnim.value = withTiming(1, { duration: 200 });
        } else {
            listAnim.value = withTiming(0, { duration: 200 });
        }
    }, [title, listAnim]);

    const createTitle = () => {
        if (!tilePressed) {
            return title;
        } else {
            const districts = [
                ...new Set(selectedTasks?.map((t) => t.address.district) ?? []),
            ];
            return districts.join('/');
        }
    };

    return (
        <Animated.View
            style={[{ position: 'absolute' }, styles.list, listAnimatedStyle]}>
            <View style={styles.listHeader}>
                <Text style={styles.listHeaderText}>{createTitle()}</Text>
                <Text style={styles.listHeaderCount}>
                    {selectedTasks.length}
                </Text>
            </View>
            <FlatList
                data={selectedTasks}
                keyExtractor={(task) => String(task.id)}
                renderItem={({ item }) => (
                    <Pressable
                        style={({ pressed }) => [
                            styles.listItem,
                            pressed && {
                                backgroundColor: 'rgba(185,185,185,0.5)',
                            },
                        ]}
                        onPress={() => {
                            if (title) {
                                goToTask(item.id);
                            }
                        }}>
                        <Text
                            numberOfLines={2}
                            ellipsizeMode='tail'
                            style={styles.listItemAddress}>
                            {item.address?.display_address}
                        </Text>
                        {!item.tileAddress && !tilePressed && (
                            <Text
                                style={[
                                    styles.listItemConsumer,
                                    { fontWeight: 'bold' },
                                ]}>
                                Координаты не определены
                            </Text>
                        )}
                        <Text
                            numberOfLines={1}
                            ellipsizeMode='tail'
                            style={styles.listItemConsumer}>
                            {item.consumer?.full_name}
                        </Text>
                    </Pressable>
                )}
                ListEmptyComponent={
                    <Text style={styles.listEmpty}>
                        В этом районе нет задач
                    </Text>
                }
            />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    list: {
        backgroundColor: '#fff',
        borderRadius: 12,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        overflow: 'hidden',
        zIndex: 1000,
    },
    listHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#f5f5f5',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    listHeaderText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#333',
        flexShrink: 1,
    },
    listHeaderCount: { fontSize: 12, color: '#999' },
    listItem: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    listItemAddress: { fontSize: 12, fontWeight: '600', color: '#333' },
    listItemConsumer: { fontSize: 11, color: '#999', marginTop: 2 },
    listEmpty: {
        padding: 14,
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
    },
});
