import React, { createContext, useContext, useEffect, useState } from 'react';
import { notify } from '../shared/notify';
import { supabase } from '../supabaseClient';

interface User { email: string; name: string }

interface StoredUser { email: string; password: string; name: string; createdAt: number }

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signUp: (payload: any) => Promise<boolean>;
  signIn: (payload: { email: string; password: string }) => Promise<boolean>;
  signOut: () => Promise<void> | void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const USERS_KEY = 'smbinary_users';
const AUTH_KEY = 'smbinary_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If supabase is configured, listen to auth state; otherwise load localStorage
    if (supabase && supabase.auth) {
      supabase.auth.getSession().then(res => {
        if (res && (res as any).data && (res as any).data.session) {
          const s = (res as any).data.session;
          const email = s.user?.email || '';
          const name = s.user?.user_metadata?.full_name || s.user?.user_metadata?.name || email.split('@')[0];
          setUser({ email, name });
        }
      }).catch(() => {});
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session && (session as any).user) {
          const u = (session as any).user;
          const email = u.email || '';
          const name = u.user_metadata?.full_name || u.user_metadata?.name || email.split('@')[0];
          setUser({ email, name });
        } else {
          setUser(null);
        }
      });
      return () => { if (listener && (listener as any).subscription) (listener as any).subscription.unsubscribe(); };
    }

    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(AUTH_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as User;
        if (parsed && parsed.email) setUser(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  const readUsers = (): StoredUser[] => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem(USERS_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as StoredUser[];
    } catch {
      return [];
    }
  };

  const writeUsers = (users: StoredUser[]) => {
    if (typeof window === 'undefined') return;
    try { window.localStorage.setItem(USERS_KEY, JSON.stringify(users)); } catch {}
  };

  const signUp = async (payload: any) => {
    const { email: rawEmail, password, name, phone, referral, gender, birthdate } = payload || {};
    const email = (rawEmail || '').toLowerCase();
    setLoading(true);
    try {
      const e = email;
      if (supabase && supabase.auth) {
        const { data, error } = await supabase.auth.signUp({ email: e, password, options: { data: { name, phone, birthdate, gender } } });
        if (error) {
          notify.error(error.message || 'Signup failed');
          return false;
        }
        // attempt to create users table record via a secure server-side endpoint (recommended)
        try {
          const sessionRes = await supabase.auth.getSession();
          const accessToken = (sessionRes as any)?.data?.session?.access_token;
          const { data: userData } = await supabase.auth.getUser();
          const userId = (userData as any)?.data?.user?.id || null;
          const country = (typeof navigator !== 'undefined' && (navigator as any).language) ? (navigator as any).language : null;
          const device = (typeof navigator !== 'undefined') ? (navigator as any).userAgent : null;

          if (accessToken && userId) {
            await fetch('/api/create-user', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
              body: JSON.stringify({
                id: userId,
                email: e,
                full_name: name || e.split('@')[0],
                phone: phone || null,
                referral: referral || null,
                gender: gender || null,
                birthdate: birthdate || null,
                country,
                device,
              }),
            }).catch(() => {});
          }
        } catch (err) {
          // ignore create-user errors (server may not be configured)
        }
        notify.success('Signup successful. Please check your email to confirm (if enabled).');
        return true;
      }

      const users = readUsers();
      if (users.some(u => u.email === e)) {
        notify.error('Account already exists with this email');
        return false;
      }
      const newUser: StoredUser = { email: e, password, name: name || e.split('@')[0], createdAt: Date.now() };
      users.push(newUser);
      writeUsers(users);
      const authInfo = { email: newUser.email, name: newUser.name };
      try { window.localStorage.setItem(AUTH_KEY, JSON.stringify(authInfo)); } catch {}
      setUser(authInfo);
      notify.success('Account created and logged in');
      return true;
    } finally { setLoading(false); }
  };

  const signIn = async ({ email, password }: { email: string; password: string }) => {
    setLoading(true);
    try {
      const e = email.toLowerCase();
      if (supabase && supabase.auth) {
        const { data, error } = await supabase.auth.signInWithPassword({ email: e, password });
        if (error) {
          notify.error(error.message || 'Invalid email or password');
          return false;
        }
        const session = (data as any).session;
        const u = session?.user;
        const name = u?.user_metadata?.full_name || u?.user_metadata?.name || e.split('@')[0];
        const authInfo = { email: u?.email || e, name };
        setUser(authInfo);
        try { window.localStorage.setItem(AUTH_KEY, JSON.stringify(authInfo)); } catch {}
        notify.success('Welcome back');
        return true;
      }

      const users = readUsers();
      const existing = users.find(u => u.email === e && u.password === password);
      if (!existing) {
        notify.error('Invalid email or password');
        return false;
      }
      const authInfo = { email: existing.email, name: existing.name };
      try { window.localStorage.setItem(AUTH_KEY, JSON.stringify(authInfo)); } catch {}
      setUser(authInfo);
      notify.success('Welcome back');
      return true;
    } finally { setLoading(false); }
  };

  const signOut = async () => {
    if (supabase && supabase.auth) {
      try { await supabase.auth.signOut(); } catch {}
      setUser(null);
      notify.success('Signed out');
      return;
    }
    try { window.localStorage.removeItem(AUTH_KEY); } catch {}
    setUser(null);
    notify.success('Signed out');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
};

export default AuthProvider;
