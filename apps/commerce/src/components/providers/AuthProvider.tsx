'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  signInWithGoogle: (redirectTo?: string) => Promise<{ error: string | null }>;
  signInWithKakao: (redirectTo?: string) => Promise<{ error: string | null }>;
  signInWithNaver: (redirectTo?: string) => Promise<{ error: string | null }>;
  signInWithTwitter: (redirectTo?: string) => Promise<{ error: string | null }>;
  resetPassword: (email: string, locale: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
  }, []);

  const signInWithGoogle = useCallback(async (redirectTo?: string) => {
    const supabase = createClient();
    const next = redirectTo ?? '/';
    const callbackUrl = `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackUrl },
    });
    return { error: error?.message ?? null };
  }, []);

  const signInWithKakao = useCallback(async (redirectTo?: string) => {
    const supabase = createClient();
    const next = redirectTo ?? '/';
    const callbackUrl = `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: { redirectTo: callbackUrl },
    });
    return { error: error?.message ?? null };
  }, []);

  const signInWithNaver = useCallback(async (redirectTo?: string) => {
    const next = redirectTo ?? '/';
    // Naver is not a native Supabase provider — use custom OAuth flow
    window.location.href = `/api/auth/naver/connect?next=${encodeURIComponent(next)}`;
    return { error: null };
  }, []);

  const signInWithTwitter = useCallback(async (redirectTo?: string) => {
    const supabase = createClient();
    const next = redirectTo ?? '/';
    const callbackUrl = `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'twitter',
      options: { redirectTo: callbackUrl },
    });
    return { error: error?.message ?? null };
  }, []);

  const resetPassword = useCallback(async (email: string, locale: string) => {
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/api/auth/callback?next=/${locale}/auth/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    return { error: error?.message ?? null };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
        signInWithKakao,
        signInWithNaver,
        signInWithTwitter,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
