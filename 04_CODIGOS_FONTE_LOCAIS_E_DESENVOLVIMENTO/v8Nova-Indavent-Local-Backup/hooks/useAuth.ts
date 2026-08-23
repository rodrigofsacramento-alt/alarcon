'use client';

import { useEffect, useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import { supabase } from '@/lib/supabase';

export type UserRole = 'admin' | 'vendedor' | 'cto';

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
}

const SESSION_KEY = 'auth_session_v3';
const USER_KEY = 'user_data_v3';

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Carrega a sessão inicial dos cookies
  const initializeAuth = useCallback(() => {
    const session = Cookies.get(SESSION_KEY);
    const userData = Cookies.get(USER_KEY);

    if (session === 'true' && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Erro ao ler sessão:', e);
        Cookies.remove(SESSION_KEY);
        Cookies.remove(USER_KEY);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async (username: string, password: string) => {
    if (!supabase) return { success: false, error: 'Supabase não conectado.' };

    try {
      // 1. Validar contra a tabela internal_users
      const { data, error } = await supabase
        .from('internal_users')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single();

      if (error || !data) {
        return { success: false, error: 'Usuário ou senha incorretos.' };
      }

      // 2. Setar estado e cookies (sem data de expiração = sessão do navegador)
      const profile: UserProfile = {
        id: data.id,
        username: data.username,
        name: data.name,
        role: data.role as UserRole,
        avatar_url: data.avatar_url
      };

      setUser(profile);
      Cookies.set(SESSION_KEY, 'true', { path: '/' });
      Cookies.set(USER_KEY, JSON.stringify(profile), { path: '/' });

      return { success: true };
    } catch (err: any) {
      console.error('Erro no login:', err);
      return { success: false, error: 'Ocorreu um erro no servidor.' };
    }
  };

  const logout = () => {
    setUser(null);
    Cookies.remove(SESSION_KEY, { path: '/' });
    Cookies.remove(USER_KEY, { path: '/' });
    
    // Limpeza profunda
    localStorage.clear();
    sessionStorage.clear();
    
    // Redirecionamento forçado para garantir limpeza de cache/estado
    window.location.href = '/';
  };

  const refreshProfile = async () => {
    if (!supabase || !user) return;
    
    const { data, error } = await supabase
      .from('internal_users')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (data && !error) {
      const profile: UserProfile = {
        id: data.id,
        username: data.username,
        name: data.name,
        role: data.role as UserRole,
        avatar_url: data.avatar_url
      };
      setUser(profile);
      Cookies.set(USER_KEY, JSON.stringify(profile), { path: '/' });
    }
  };

  return {
    user,
    profile: user, // Alias para compatibilidade
    loading,
    isAdmin: user?.role === 'admin' || user?.role === 'cto',
    isCto: user?.role === 'cto',
    login,
    logout,
    refreshProfile
  };
}
