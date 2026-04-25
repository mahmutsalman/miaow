import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';
import { Colors } from '@/constants/colors';

const IS_MOCK = !process.env.EXPO_PUBLIC_SUPABASE_URL;

export default function Index() {
  const { session, profile, loading } = useAuthStore();

  // Supabase yokken direkt haritaya git (demo mod)
  if (IS_MOCK) return <Redirect href="/(app)/map" />;

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!session) return <Redirect href="/(auth)/login" />;
  if (!profile) return <Redirect href="/(auth)/role-select" />;
  return <Redirect href="/(app)/map" />;
}
