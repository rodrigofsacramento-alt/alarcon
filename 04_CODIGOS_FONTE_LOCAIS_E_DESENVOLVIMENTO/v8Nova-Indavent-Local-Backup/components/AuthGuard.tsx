'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import { useAuth } from '@/hooks/useAuth';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const authSession = Cookies.get('auth_session_v3');

    // Se estiver carregando, não faz nada
    if (loading) return;

    // Se não houver sessão e não for a página de login (/), redireciona para /
    if (!authSession && pathname !== '/') {
      window.location.href = '/';
    }
  }, [pathname, loading]);

  return <>{children}</>;
}
