import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';


interface SuperAdminContextType {
  user: User | null;
  session: Session | null;
  isSuperAdmin: boolean;
  loading: boolean;
  adminCheckLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<Session | null>;
}

const SuperAdminContext = createContext<SuperAdminContextType | undefined>(undefined);

export function SuperAdminProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminCheckLoading, setAdminCheckLoading] = useState(true);

  const checkSuperAdmin = useCallback(async (sess: Session | null) => {
    if (sess?.user) {
      const uid = sess.user.id;
      setAdminCheckLoading(true);
      try {
        const { data } = await supabase
          .from('super_admins')
          .select('id, is_active')
          .eq('user_id', uid)
          .eq('is_active', true)
          .single();
        setIsSuperAdmin(!!data);
      } catch {
        setIsSuperAdmin(false);
      } finally {
        setAdminCheckLoading(false);
      }
    } else {
      setIsSuperAdmin(false);
      setAdminCheckLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    // Carregar sessão inicial
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (ignore) return;
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setLoading(false);
      checkSuperAdmin(initialSession);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, sess) => {
        if (ignore) return;
        setSession(sess);
        setUser(sess?.user ?? null);
        setLoading(false);
        checkSuperAdmin(sess);
      }
    );

    // Refresh periódico do token a cada 10 min
    const interval = setInterval(async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession && currentSession.expires_at) {
        const expiresAt = currentSession.expires_at * 1000;
        const now = Date.now();
        if (expiresAt - now < 5 * 60 * 1000) { // menos de 5 min para expirar
          const { data, error } = await supabase.auth.refreshSession();
          if (!error && data.session) {
            setSession(data.session);
            setUser(data.session.user);
          }
        }
      }
    }, 60 * 1000); // verificar a cada minuto

    return () => {
      ignore = true;
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [checkSuperAdmin]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsSuperAdmin(false);
    setAdminCheckLoading(false);
  };

  const refreshSession = async () => {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    if (data.session) {
      setSession(data.session);
      setUser(data.session.user);
      await checkSuperAdmin(data.session);
    }
    return data.session;
  };

  return (
    <SuperAdminContext.Provider value={{ user, session, isSuperAdmin, loading, adminCheckLoading, signIn, signOut, refreshSession }}>
      {children}
    </SuperAdminContext.Provider>
  );
}

export function useSuperAdmin() {
  const context = useContext(SuperAdminContext);
  if (context === undefined) {
    throw new Error('useSuperAdmin must be used within a SuperAdminProvider');
  }
  return context;
}
