import ScreenLayout from '@/shared/components/screen/screenLayout';
import { ActivityIndicator } from 'react-native';

const ScreenLoader = () => {
    return (
        <ScreenLayout centered>
            <ActivityIndicator size='large' color='#ddd' />
        </ScreenLayout>
    );
};

export default ScreenLoader;
