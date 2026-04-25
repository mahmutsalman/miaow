import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { supabase, Sighting } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { Colors } from '@/constants/colors';

export default function ProfileScreen() {
  const { profile, session, signOut, fetchProfile } = useAuthStore();
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!session?.user) return;
    loadData();
  }, [session?.user?.id]);

  async function loadData() {
    if (!session?.user) return;
    setLoadingData(true);
    const { data } = await supabase
      .from('sightings')
      .select('*')
      .eq('reporter_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    setSightings(data ?? []);
    setLoadingData(false);
  }

  async function handleRoleSwitch() {
    if (!session?.user || !profile) return;
    const newRole = profile.role === 'reporter' ? 'feeder' : 'reporter';
    await supabase.from('profiles').update({ role: newRole }).eq('id', session.user.id);
    await fetchProfile(session.user.id);
  }

  async function handleSignOut() {
    await signOut();
    router.replace('/(auth)/login');
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.nickname}>{profile?.nickname ?? 'Kullanıcı'}</Text>
        <Text style={styles.email}>{session?.user?.email}</Text>
        <View style={[styles.rolePill, { backgroundColor: profile?.role === 'reporter' ? Colors.reporter : Colors.feeder }]}>
          <Text style={styles.rolePillText}>
            {profile?.role === 'reporter' ? '📍 Kedi Bildiren' : '🍽️ Mama Bırakan'}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.switchBtn} onPress={handleRoleSwitch}>
        <Text style={styles.switchBtnText}>
          Rol Değiştir → {profile?.role === 'reporter' ? 'Mama Bırakan' : 'Kedi Bildiren'}
        </Text>
      </TouchableOpacity>

      {profile?.role === 'reporter' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bildirimlerim ({sightings.length})</Text>
          {loadingData
            ? <ActivityIndicator color={Colors.primary} />
            : sightings.length === 0
            ? <Text style={styles.empty}>Henüz bildirim yok. Haritadan + ile kedi ekle!</Text>
            : sightings.map((s) => (
              <View key={s.id} style={styles.sightingRow}>
                <Text style={styles.sightingText}>
                  🐱 {s.cat_count} kedi {s.neighborhood ? `— ${s.neighborhood}` : ''}
                </Text>
                <Text style={styles.sightingTime}>{new Date(s.created_at).toLocaleDateString('tr-TR')}</Text>
              </View>
            ))
          }
        </View>
      )}

      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 24 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  nickname: { fontSize: 22, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  email: { fontSize: 14, color: Colors.textMuted, marginBottom: 12 },
  rolePill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  rolePillText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  switchBtn: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  switchBtnText: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  empty: { color: Colors.textMuted, fontSize: 14, textAlign: 'center', paddingVertical: 16 },
  sightingRow: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sightingText: { fontSize: 14, color: Colors.text, flex: 1 },
  sightingTime: { fontSize: 12, color: Colors.textMuted },
  signOutBtn: {
    backgroundColor: Colors.error,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  signOutText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
