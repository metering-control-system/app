import { useSyncQueriesExternal } from 'react-query-external-sync';
import * as ExpoDevice from 'expo-device';
import { Platform } from 'react-native';

import { queryClient } from '@/shared/api/queryClient';
import Constants from 'expo-constants';

const hostIP =
    Constants.expoGoConfig?.debuggerHost?.split(`:`)[0] ||
    Constants.expoConfig?.hostUri?.split(`:`)[0];

export default function TanstackQueryDevTools({ children }) {
    useSyncQueriesExternal({
        queryClient,
        socketURL: `http://${hostIP}:42831`,
        deviceName: Platform?.OS || 'web',
        platform: Platform?.OS || 'web',
        deviceId: `${Platform.OS}-${ExpoDevice.modelName || 'unknown'}`,
        isDevice: ExpoDevice.isDevice,
        extraDeviceInfo: { appVersion: '0.0.0' },
        enableLogs: false,
        envVariables: { NODE_ENV: process.env.NODE_ENV },
    });
    return children;
}
