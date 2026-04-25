import { Stack } from 'expo-router';
import { Colors } from '@/constants/colors';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.text,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="map" options={{ headerShown: false }} />
      <Stack.Screen name="report" options={{ title: 'Kedi Bildir', presentation: 'modal' }} />
      <Stack.Screen name="profile" options={{ title: 'Profilim' }} />
    </Stack>
  );
}
