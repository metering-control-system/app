import { Keyboard, Pressable } from 'react-native';

export const DismissKeyboardWrapper = ({ children, style }) => (
    <Pressable style={style} onPress={Keyboard.dismiss} accessible={false}>
        {children}
    </Pressable>
);
