import { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Sighting } from '@/lib/supabase';
import { Colors } from '@/constants/colors';
import { MapViewHandle } from './MapView.types';

// Native harita buraya gelecek (MapLibre React Native)
// Şu an web versiyonu aktif, native build eklendiğinde bu dosya güncellenir

type Props = {
  sightings: Sighting[];
  onMarkerPress: (sighting: Sighting) => void;
};

const MapView = forwardRef<MapViewHandle, Props>(function MapView(_props, _ref) {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.text}>🗺️ Native harita</Text>
      <Text style={styles.sub}>npx expo run:ios ile çalışır</Text>
    </View>
  );
});

export default MapView;

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  text: { fontSize: 24, marginBottom: 8 },
  sub: { fontSize: 14, color: Colors.textMuted },
});
