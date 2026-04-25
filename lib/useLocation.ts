import { useState, useCallback } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

export type Coords = {
  lat: number;
  lng: number;
};

export function useLocation() {
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState<Coords | null>(null);

  const getCurrentLocation = useCallback(async (): Promise<Coords | null> => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Konum İzni Gerekli',
          'Kedi konumunu bildirmek için konum iznine ihtiyacımız var. Ayarlardan izin verebilirsin.',
        );
        return null;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const result: Coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      setCoords(result);
      return result;
    } catch {
      Alert.alert('Konum Alınamadı', 'Lütfen tekrar dene.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { coords, loading, getCurrentLocation };
}
