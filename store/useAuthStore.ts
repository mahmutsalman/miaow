import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { Profile, supabase } from '@/lib/supabase';
import { MOCK_PROFILE } from '@/lib/mockData';

const IS_MOCK = !process.env.EXPO_PUBLIC_SUPABASE_URL;

type AuthState = {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  fetchProfile: (userId: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  profile: IS_MOCK ? MOCK_PROFILE : null,
  loading: !IS_MOCK,

  setSession: (session) => set({ session, loading: false }),
  setProfile: (profile) => set({ profile }),

  fetchProfile: async (userId: string) => {
    if (IS_MOCK) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    set({ profile: data ?? null });
  },

  signOut: async () => {
    if (!IS_MOCK) await supabase.auth.signOut();
    set({ session: null, profile: null });
  },
}));
