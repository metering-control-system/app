import {
    Animated,
    Keyboard,
    LayoutAnimation,
    Pressable,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';

export const SearchInput = ({
    searchState,
    setSearchState,
    searched,
    setSearched,
}) => {
    const animOpacity = useRef(new Animated.Value(0)).current;

    const toggleSearch = () => {
        LayoutAnimation.configureNext({
            duration: 200,
            create: { type: 'linear', property: 'opacity' },
            update: { type: 'linear' },
            delete: { type: 'linear', property: 'opacity' },
        });
        setSearched(!searched);
        !searched && Keyboard.dismiss();
    };

    useEffect(() => {
        Animated.timing(animOpacity, {
            toValue: searched ? 0 : 1,
            duration: 150,
            useNativeDriver: true,
        }).start();
    }, [searched, animOpacity]);

    return (
        <View
            style={[
                styles.control,
                searched ? { flex: 0, width: 30 } : { flex: 1 },
            ]}>
            <Pressable onPress={toggleSearch} hitSlop={8}>
                <FontAwesome name='search' size={15} color='#727272' />
            </Pressable>
            <Animated.View
                style={{ opacity: animOpacity, flex: 1, overflow: 'hidden' }}>
                <TextInput
                    style={styles.input}
                    onChangeText={setSearchState}
                    value={searchState}
                />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    control: {
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 5,
        overflow: 'hidden',
    },
    input: { color: '#000', paddingHorizontal: 12 },
});
