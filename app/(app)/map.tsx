import { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { supabase, Sighting } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { SightingSheet } from '@/components/SightingSheet';
import { Colors } from '@/constants/colors';
import { MOCK_SIGHTINGS } from '@/lib/mockData';
import { MapViewHandle } from '@/components/MapView.types';

// Platform'a göre doğru MapView yüklenir:
//   web  → components/MapView.web.tsx  (react-map-gl)
//   native → components/MapView.tsx    (MapLibre React Native)
import MapView from '@/components/MapView';

const IS_MOCK = !process.env.EXPO_PUBLIC_SUPABASE_URL;

export default function MapScreen() {
  const { profile } = useAuthStore();
  const [sightings, setSightings] = useState<Sighting[]>(IS_MOCK ? MOCK_SIGHTINGS : []);
  const [selected, setSelected] = useState<Sighting | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const mapViewRef = useRef<MapViewHandle>(null);

  useEffect(() => {
    if (IS_MOCK) return;
    fetchSightings();
    subscribeToSightings();
    return () => { channelRef.current?.unsubscribe(); };
  }, []);

  async function fetchSightings() {
    const { data } = await supabase
      .from('sightings')
      .select(`*, profiles (nickname), feeding_count:feedings(count)`)
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (data) {
      setSightings(data.map((s: any) => ({
        ...s,
        feeding_count: s.feeding_count?.[0]?.count ?? 0,
      })));
    }
  }

  function subscribeToSightings() {
    channelRef.current = supabase
      .channel('sightings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sightings' }, fetchSightings)
      .subscribe();
  }

  const displayRole = profile?.role ?? 'feeder';

  return (
    <View style={styles.container}>
      <MapView ref={mapViewRef} sightings={sightings} onMarkerPress={setSelected} />

      {/* Üst bar */}
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>🐱 Miaow</Text>
        <View style={styles.topRight}>
          {IS_MOCK && (
            <View style={styles.mockBadge}>
              <Text style={styles.mockBadgeText}>DEMO</Text>
            </View>
          )}
          <View style={[styles.roleBadge, { backgroundColor: displayRole === 'reporter' ? Colors.reporter : Colors.feeder }]}>
            <Text style={styles.roleBadgeText}>
              {displayRole === 'reporter' ? '📍 Bildiren' : '🍽️ Mama Bırakan'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(app)/profile')} style={styles.profileBtn}>
            <Text>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {displayRole === 'reporter' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/(app)/report')}
          activeOpacity={0.85}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.countBadge}
        onPress={() => mapViewRef.current?.flyToSightings()}
        activeOpacity={0.75}
      >
        <Text style={styles.countText}>🐱 {sightings.length} aktif nokta</Text>
      </TouchableOpacity>

      {selected && (
        <SightingSheet
          sighting={selected}
          onClose={() => setSelected(null)}
          onFed={fetchSightings}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 40,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  topTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mockBadge: { backgroundColor: '#FFD700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  mockBadgeText: { fontSize: 10, fontWeight: '700', color: '#333' },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  roleBadgeText: { fontSize: 12, color: '#fff', fontWeight: '600' },
  profileBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.background,
    justifyContent: 'center', alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 40, right: 24,
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  fabText: { fontSize: 32, color: '#fff', lineHeight: 36 },
  countBadge: {
    position: 'absolute',
    bottom: 40, left: 24,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  countText: { fontSize: 13, color: Colors.text, fontWeight: '600' },
});
