import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export const HighlightWrap = ({ isActive, children }) => {
    const opacity = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        if (isActive) {
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: false,
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: false,
                }),
            ]).start();
        }
    }, [isActive]);
    const bgColor = opacity.interpolate({
        inputRange: [0, 1],
        outputRange: ['transparent', 'rgba(0, 148, 207, 0.2)'],
    });
    return (
        <Animated.View style={{ backgroundColor: bgColor, borderRadius: 8 }}>
            {children}
        </Animated.View>
    );
};
