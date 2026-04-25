import { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { Colors } from '@/constants/colors';

type Role = 'reporter' | 'feeder';

export default function RoleSelectScreen() {
  const { session, fetchProfile } = useAuthStore();
  const [selected, setSelected] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    if (!selected || !session?.user) return;
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ role: selected })
      .eq('id', session.user.id);
    if (error) {
      setLoading(false);
      Alert.alert('Hata', 'Rol kaydedilemedi, tekrar dene.');
      return;
    }
    await fetchProfile(session.user.id);
    setLoading(false);
    router.replace('/(app)/map');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nasıl yardım etmek istersin?</Text>
      <Text style={styles.subtitle}>İstediğin zaman profilinden değiştirebilirsin</Text>

      <TouchableOpacity
        style={[styles.card, selected === 'reporter' && styles.cardSelected]}
        onPress={() => setSelected('reporter')}
        activeOpacity={0.8}
      >
        <Text style={styles.cardEmoji}>📍</Text>
        <Text style={styles.cardTitle}>Kedi Bildiren</Text>
        <Text style={styles.cardDesc}>
          Sokakta gördüğün kedileri haritada işaretle. GPS ile konum bildir, opsiyonel fotoğraf ekle.
        </Text>
        {selected === 'reporter' && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.card, selected === 'feeder' && styles.cardSelected]}
        onPress={() => setSelected('feeder')}
        activeOpacity={0.8}
      >
        <Text style={styles.cardEmoji}>🍽️</Text>
        <Text style={styles.cardTitle}>Mama Bırakan</Text>
        <Text style={styles.cardDesc}>
          Haritadaki kedi noktalarını gör. O bölgeye git, mama bırak ve işaretle.
        </Text>
        {selected === 'feeder' && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, !selected && styles.buttonDisabled]}
        onPress={handleConfirm}
        disabled={!selected || loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Başla</Text>
        }
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  title: { fontSize: 24, fontWeight: '700', color: Colors.text, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', marginBottom: 32 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    position: 'relative',
  },
  cardSelected: { borderColor: Colors.primary, backgroundColor: '#FFF5F0' },
  cardEmoji: { fontSize: 32, marginBottom: 8 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 6 },
  cardDesc: { fontSize: 14, color: Colors.textMuted, lineHeight: 20 },
  checkmark: {
    position: 'absolute',
    top: 16,
    right: 20,
    fontSize: 20,
    color: Colors.primary,
    fontWeight: '700',
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
