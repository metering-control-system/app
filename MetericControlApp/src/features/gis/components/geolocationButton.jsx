import { ActivityIndicator } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { OverlayButton } from '@/shared/components/button/overlayButton';

const GeolocationButton = ({ onPress, isLocating }) => {
    return (
        <OverlayButton
            onPress={onPress}
            disabled={isLocating}
            icon={
                isLocating ? (
                    <ActivityIndicator color='white' />
                ) : (
                    <Entypo name='location-pin' size={20} color='white' />
                )
            }
        />
    );
};

export default GeolocationButton;
