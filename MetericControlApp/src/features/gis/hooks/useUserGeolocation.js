import { useCallback, useState } from 'react';
import * as Location from 'expo-location';
import polygon from '@/features/gis/constants/tiles.json';
import { findContainingTile } from '@/features/gis/lib/arrangeTasksByDistrict';
import { projectToTileUnits } from '@/features/gis/lib/projectToTileUnits';

const useUserGeolocation = () => {
    const [userTile, setUserTile] = useState(null);
    const [error, setError] = useState(null);
    const [isLocating, setIsLocating] = useState(false);

    const [, requestPermission] = Location.useForegroundPermissions();

    const locate = useCallback(async () => {
        setIsLocating(true);
        setError(null);

        try {
            const servicesEnabled = await Location.hasServicesEnabledAsync();
            if (!servicesEnabled) {
                setError('Геолокация отключена в настройках устройства.');
                return null;
            }

            const permission = await requestPermission();
            if (!permission.granted) {
                setError('Нет доступа к геолокации.');
                return null;
            }

            const { coords } = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            const point = projectToTileUnits(coords);
            const tile = point
                ? findContainingTile(
                      polygon.coordinates,
                      point.x,
                      point.y,
                      polygon.size
                  )
                : null;

            if (!tile) {
                setError('Вы находитесь вне границ города.');
                return null;
            }

            setUserTile(tile);
            return tile;
        } catch (locationError) {
            console.error(locationError.message);
            setError('Не удалось определить местоположение.');
            return null;
        } finally {
            setIsLocating(false);
        }
    }, [requestPermission]);

    const dismissError = useCallback(() => {
        setError(null);
    }, []);

    return { userTile, error, isLocating, locate, dismissError };
};

export default useUserGeolocation;
