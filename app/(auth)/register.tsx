import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { Link, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/colors';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!email || !password || !nickname) {
      Alert.alert('Hata', 'Tüm alanları doldurman gerekiyor.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalı.');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setLoading(false);
      Alert.alert('Kayıt Hatası', error.message);
      return;
    }
    if (data.user) {
      // nickname'i session'a geçici olarak kaydet, rol seçiminden sonra profile yazılacak
      await supabase.from('profiles').upsert({
        id: data.user.id,
        nickname,
        role: null,
      });
    }
    setLoading(false);
    router.replace('/(auth)/role-select');
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <Text style={styles.logo}>🐱 Miaow</Text>
        <Text style={styles.subtitle}>Hesap oluştur</Text>

        <TextInput
          style={styles.input}
          placeholder="Takma ad (örn: KediSever42)"
          placeholderTextColor={Colors.textMuted}
          value={nickname}
          onChangeText={setNickname}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="E-posta"
          placeholderTextColor={Colors.textMuted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Şifre (en az 6 karakter)"
          placeholderTextColor={Colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Devam Et</Text>
          }
        </TouchableOpacity>

        <Link href="/(auth)/login" asChild>
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkText}>Zaten hesabın var mı? <Text style={styles.linkBold}>Giriş Yap</Text></Text>
          </TouchableOpacity>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  logo: { fontSize: 48, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: Colors.textMuted, textAlign: 'center', marginBottom: 40 },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  linkButton: { alignItems: 'center', paddingVertical: 8 },
  linkText: { color: Colors.textMuted, fontSize: 14 },
  linkBold: { color: Colors.primary, fontWeight: '600' },
});
