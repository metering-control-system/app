import { ActivityIndicator } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { OverlayButton } from '@/shared/components/button/overlayButton';

const GeolocationDeterminant = ({ onPress, isLocating }) => {
    return (
        <OverlayButton
            onPress={onPress}
            absolute={false}
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

export default GeolocationDeterminant;
