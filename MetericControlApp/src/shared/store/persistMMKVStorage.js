import { createMMKV } from 'react-native-mmkv';

const mmkvStorage = (id) => createMMKV({ id, compareBeforeSet: true });

export default mmkvStorage;
