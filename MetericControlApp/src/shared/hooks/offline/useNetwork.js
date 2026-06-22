import { useNetInfo } from '@react-native-community/netinfo';

const useNetwork = () => {
    const networkState = useNetInfo();

    const isChecked =
        typeof networkState.isConnected === 'boolean' &&
        typeof networkState.isInternetReachable === 'boolean';

    const isOnline =
        isChecked &&
        networkState.isConnected &&
        networkState.isInternetReachable;

    return { networkState, isChecked, isOnline };
};

export default useNetwork;
