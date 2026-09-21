const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

const getUniqueIdentifier = () => {
    if (IS_DEV) {
        return "com.pr1de.MetericControlApp.dev";
    }

    if (IS_PREVIEW) {
        return 'com.pr1de.MetericControlApp.preview';
    }

    return "com.pr1de.MetericControlApp";
};

const getAppName = () => {
    if (IS_DEV) {
        return 'MetericControlApp (Dev)';
    }

    if (IS_PREVIEW) {
        return 'MetericControlApp (Preview)';
    }

    return 'MetericControlApp';
};

export default ({ config }) => ({
    ...config,
    name: getAppName(),
    ios: {
        ...config.ios,
        bundleIdentifier: getUniqueIdentifier(),
    },
    android: {
        ...config.android,
        package: getUniqueIdentifier(),
    },
    plugins: [
        ...(config.plugins ?? []),
        [
            'expo-build-properties',
            {
                android: {
                    usesCleartextTraffic: !IS_PREVIEW || IS_DEV,
                },
            },
        ],
    ],
});
