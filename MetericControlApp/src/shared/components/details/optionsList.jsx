import { FlatList, Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const OptionList = ({
    variants,
    state,
    multiSelect,
    onSelect,
    optionStyle,
    textStyle,
}) => {
    return (
        <FlatList
            data={variants}
            keyExtractor={(variant) => variant[0]}
            nestedScrollEnabled
            renderItem={({ item }) => (
                <Pressable
                    style={[styles.option, optionStyle]}
                    onPress={(event) => {
                        event.stopPropagation();
                        onSelect(item);
                    }}>
                    <Ionicons
                        name={
                            multiSelect && state.has(item[0])
                                ? 'checkmark-circle'
                                : !multiSelect && state === item[0]
                                  ? 'checkmark-circle'
                                  : null
                        }
                        size={15}
                        color='#6ca4ff'
                    />
                    <Text style={[styles.optionText, textStyle]}>
                        {item[1]}
                    </Text>
                </Pressable>
            )}
        />
    );
};
const styles = StyleSheet.create({
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    optionText: { fontSize: 14, color: '#333' },
});

export default OptionList;
