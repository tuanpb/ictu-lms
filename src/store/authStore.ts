import { create } from 'zustand';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import type { User } from '../lib/types';
import { supabase } from '../lib/supabase';
import { mapAuthError } from '../lib/authUtils';

interface UserProfile {
  full_name?: string | null;
  coin?: number | null;
}

const mapSupabaseUser = (authUser: SupabaseUser, profile?: UserProfile | null): User => ({
  id: authUser.id,
  fullName:
    profile?.full_name ??
    (authUser.user_metadata?.full_name as string | undefined) ??
    (authUser.user_metadata?.name as string | undefined) ??
    authUser.email ??
    'Người dùng',
  email: authUser.email ?? '',
  coin: profile?.coin ?? 0,
  createdAt: authUser.created_at ?? new Date().toISOString(),
});

interface AuthState {
  currentUser: User | null;
  isAuthReady: boolean;
  initializeAuth: () => Promise<() => void>;
  login: (email: string, password: string) => Promise<string | null>;
  register: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<string | null>;
  refreshBalance: () => Promise<void>;
}

const syncSession = async (
  session: Session | null,
  set: (partial: Partial<AuthState>) => void
) => {
  if (session?.user) {
    // Fetch profile data for extra info like coins
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    set({
      currentUser: mapSupabaseUser(session.user, profile),
      isAuthReady: true,
    });
  } else {
    set({
      currentUser: null,
      isAuthReady: true,
    });
  }
};

export const useAuthStore = create<AuthState>()((set, get) => ({
  currentUser: null,
  isAuthReady: false,

  initializeAuth: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    await syncSession(session, set);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'INITIAL_SESSION') return;
      syncSession(nextSession, set);
    });

    return () => {
      subscription.unsubscribe();
    };
  },

  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return mapAuthError(error.message);
    }

    if (data.user) {
      set({ currentUser: mapSupabaseUser(data.user), isAuthReady: true });
    }

    return null;
  },

  register: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if (error) {
      return mapAuthError(error.message);
    }

    if (data.session?.user) {
      set({ currentUser: mapSupabaseUser(data.session.user), isAuthReady: true });
    }

    return null;
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return mapAuthError(error.message);
    }

    set({ currentUser: null, isAuthReady: true });
    return null;
  },

  refreshBalance: async () => {
    const { currentUser } = get();
    if (!currentUser) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('coin')
      .eq('id', currentUser.id)
      .single();

    if (profile) {
      set({
        currentUser: {
          ...currentUser,
          coin: profile.coin,
        },
      });
    }
  },
}));
