import { Pressable, Text, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

const Task = ({ task }) => {
    const router = useRouter();

    return (
        <Pressable
            onPress={() => {
                router.push(`taskDetails/${task.id}`);
            }}
            style={({ pressed }) => [
                styles.card,
                pressed ? styles.btnPressed : undefined,
            ]}>
            <View>
                <Text style={styles.cardTitle}>{task.address}</Text>
                <View style={{ paddingVertical: 15, columnGap: 15 }}>
                    <Text style={styles.cardText}>{task.consumer_contact}</Text>
                    <Text style={styles.cardText}>
                        Создано: {task.created_at}
                    </Text>
                </View>
                <View
                    style={{
                        paddingVertical: 15,
                        borderTopWidth: 1,
                        borderColor: '#ddd',
                        columnGap: 15,
                    }}>
                    <Text style={styles.cardText}>{task.personalAccount}</Text>
                </View>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    card: {
        width: '100%',
        flexDirection: 'column',
        borderRadius: 12,
        rowGap: 5,
        minHeight: 100,
        boxSizing: 'border-box',
        shadowColor: '#000',
        shadowOffset: { width: 10, height: 50 },
        shadowOpacity: 1,
        shadowRadius: 10,
        paddingHorizontal: 5,
        paddingVertical: 5,
        backgroundColor: 'white',
        marginBottom: 15,
    },
    cardTitle: { fontSize: 16, fontWeight: 'bold' },
    cardText: { fontSize: 14, fontWeight: 'normal' },
    btnPressed: { opacity: 0.75 },
});

export default Task;
