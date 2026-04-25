import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, Image,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { useLocation } from '@/lib/useLocation';
import { Colors } from '@/constants/colors';

export default function ReportScreen() {
  const { session } = useAuthStore();
  const { coords, loading: locLoading, getCurrentLocation } = useLocation();
  const [catCount, setCatCount] = useState(1);
  const [notes, setNotes] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handlePickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  }

  async function uploadPhoto(userId: string): Promise<string | null> {
    if (!photoUri) return null;
    const ext = photoUri.split('.').pop() ?? 'jpg';
    const path = `${userId}/${Date.now()}.${ext}`;

    const response = await fetch(photoUri);
    const blob = await response.blob();

    const { error } = await supabase.storage
      .from('cat-photos')
      .upload(path, blob, { contentType: `image/${ext}` });

    if (error) return null;

    const { data } = supabase.storage.from('cat-photos').getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleSubmit() {
    if (!coords) {
      Alert.alert('Konum Gerekli', 'Önce konumunu al.');
      return;
    }
    if (!session?.user) return;

    setSubmitting(true);
    const photoUrl = await uploadPhoto(session.user.id);

    const { error } = await supabase.from('sightings').insert({
      reporter_id: session.user.id,
      lat: coords.lat,
      lng: coords.lng,
      neighborhood: neighborhood || null,
      cat_count: catCount,
      notes: notes || null,
      photo_url: photoUrl,
    });

    setSubmitting(false);

    if (error) {
      Alert.alert('Hata', 'Bildirim gönderilemedi. Tekrar dene.');
    } else {
      Alert.alert('Teşekkürler! 🐱', 'Kedi bildirimin haritada göründü.');
      router.back();
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Konum */}
      <Text style={styles.sectionLabel}>Konum</Text>
      <TouchableOpacity
        style={[styles.locationBtn, coords && styles.locationBtnActive]}
        onPress={getCurrentLocation}
        disabled={locLoading}
      >
        {locLoading
          ? <ActivityIndicator color={Colors.primary} />
          : coords
          ? <Text style={styles.locationBtnText}>✓ Konum alındı ({coords.lat.toFixed(4)}, {coords.lng.toFixed(4)})</Text>
          : <Text style={styles.locationBtnText}>📍 GPS Konumumu Al</Text>
        }
      </TouchableOpacity>

      {/* Mahalle (opsiyonel) */}
      <Text style={styles.sectionLabel}>Mahalle <Text style={styles.optional}>(opsiyonel)</Text></Text>
      <TextInput
        style={styles.input}
        placeholder="örn: Kadıköy, Moda"
        placeholderTextColor={Colors.textMuted}
        value={neighborhood}
        onChangeText={setNeighborhood}
      />

      {/* Kedi sayısı */}
      <Text style={styles.sectionLabel}>Kaç kedi gördün?</Text>
      <View style={styles.counterRow}>
        <TouchableOpacity
          style={styles.counterBtn}
          onPress={() => setCatCount(Math.max(1, catCount - 1))}
        >
          <Text style={styles.counterBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.counterValue}>{catCount}</Text>
        <TouchableOpacity
          style={styles.counterBtn}
          onPress={() => setCatCount(catCount + 1)}
        >
          <Text style={styles.counterBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Not */}
      <Text style={styles.sectionLabel}>Not <Text style={styles.optional}>(opsiyonel)</Text></Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Kediler hakkında not... (örn: mama kabı var, hasta görünüyor)"
        placeholderTextColor={Colors.textMuted}
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
      />

      {/* Fotoğraf */}
      <Text style={styles.sectionLabel}>Fotoğraf <Text style={styles.optional}>(opsiyonel)</Text></Text>
      <TouchableOpacity style={styles.photoBtn} onPress={handlePickPhoto}>
        {photoUri
          ? <Image source={{ uri: photoUri }} style={styles.photoPreview} />
          : <Text style={styles.photoBtnText}>📷 Fotoğraf Seç</Text>
        }
      </TouchableOpacity>

      {/* Gönder */}
      <TouchableOpacity
        style={[styles.submitBtn, (!coords || submitting) && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={!coords || submitting}
      >
        {submitting
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.submitBtnText}>Kediyi Bildir 🐱</Text>
        }
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 24, paddingBottom: 48 },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 8, marginTop: 16 },
  optional: { fontWeight: '400', color: Colors.textMuted },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: { height: 90, textAlignVertical: 'top', paddingTop: 12 },
  locationBtn: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  locationBtnActive: { borderColor: Colors.success },
  locationBtnText: { fontSize: 15, color: Colors.text, fontWeight: '500' },
  counterRow: { flexDirection: 'row', alignItems: 'center', gap: 24 },
  counterBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterBtnText: { fontSize: 24, color: '#fff', lineHeight: 28 },
  counterValue: { fontSize: 28, fontWeight: '700', color: Colors.text, minWidth: 40, textAlign: 'center' },
  photoBtn: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  photoBtnText: { fontSize: 15, color: Colors.textMuted },
  photoPreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
