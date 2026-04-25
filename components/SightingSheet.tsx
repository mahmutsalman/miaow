import { useRef, useCallback, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Sighting, supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { Colors } from '@/constants/colors';

type Props = {
  sighting: Sighting | null;
  onClose: () => void;
  onFed: () => void;
};

export function SightingSheet({ sighting, onClose, onFed }: Props) {
  const { session, profile } = useAuthStore();
  const sheetRef = useRef<BottomSheet>(null);
  const [feeding, setFeeding] = useState(false);
  const snapPoints = ['35%'];

  const handleClose = useCallback(() => {
    sheetRef.current?.close();
    onClose();
  }, [onClose]);

  async function handleFed() {
    if (!sighting || !session?.user) return;
    setFeeding(true);
    const { error } = await supabase.from('feedings').insert({
      sighting_id: sighting.id,
      feeder_id: session.user.id,
    });
    setFeeding(false);
    if (error) {
      Alert.alert('Hata', 'Kayıt yapılamadı, tekrar dene.');
    } else {
      Alert.alert('Teşekkürler! 🐱', 'Mama bıraktığın işaretlendi.');
      onFed();
      handleClose();
    }
  }

  if (!sighting) return null;

  const timeAgo = formatTimeAgo(sighting.created_at);

  return (
    <BottomSheet
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={styles.background}
      handleIndicatorStyle={styles.handle}
    >
      <BottomSheetView style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.title}>
            🐱 {sighting.cat_count} Kedi
          </Text>
          <Text style={styles.time}>{timeAgo}</Text>
        </View>

        {sighting.neighborhood && (
          <Text style={styles.neighborhood}>📍 {sighting.neighborhood}</Text>
        )}

        {sighting.notes && (
          <Text style={styles.notes}>{sighting.notes}</Text>
        )}

        <View style={styles.stats}>
          <Text style={styles.statText}>
            🍽️ {sighting.feeding_count ?? 0} kez mama bırakıldı
          </Text>
          {sighting.profiles?.nickname && (
            <Text style={styles.statText}>👤 {sighting.profiles.nickname}</Text>
          )}
        </View>

        {profile?.role === 'feeder' && (
          <TouchableOpacity
            style={styles.fedButton}
            onPress={handleFed}
            disabled={feeding}
          >
            {feeding
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.fedButtonText}>🍽️ Mama Bıraktım!</Text>
            }
          </TouchableOpacity>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'az önce';
  if (mins < 60) return `${mins} dakika önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} saat önce`;
  return `${Math.floor(hours / 24)} gün önce`;
}

const styles = StyleSheet.create({
  background: { backgroundColor: Colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  handle: { backgroundColor: Colors.border },
  content: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '700', color: Colors.text },
  time: { fontSize: 12, color: Colors.textMuted },
  neighborhood: { fontSize: 14, color: Colors.textMuted, marginBottom: 6 },
  notes: { fontSize: 15, color: Colors.text, marginBottom: 12, lineHeight: 22 },
  stats: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  statText: { fontSize: 13, color: Colors.textMuted },
  fedButton: {
    backgroundColor: Colors.success,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  fedButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
