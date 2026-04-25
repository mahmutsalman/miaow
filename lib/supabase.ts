import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Web'de localStorage, native'de AsyncStorage kullan
const authStorage = Platform.OS === 'web' ? undefined : AsyncStorage;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: authStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Profile = {
  id: string;
  role: 'reporter' | 'feeder';
  nickname: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type Sighting = {
  id: string;
  reporter_id: string;
  lat: number;
  lng: number;
  neighborhood: string | null;
  cat_count: number;
  notes: string | null;
  photo_url: string | null;
  active: boolean;
  created_at: string;
  profiles?: Pick<Profile, 'nickname'>;
  feeding_count?: number;
};

export type Feeding = {
  id: string;
  sighting_id: string;
  feeder_id: string;
  note: string | null;
  fed_at: string;
};
