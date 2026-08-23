'use client';

import React from 'react';
import Image from 'next/image';
import { Search, Bell, Settings, HelpCircle, Menu, X } from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { useMobileMenu } from '@/context/MobileMenuContext';
import { NotificationPermissionButton } from './NotificationPermissionButton';

import { useAuth } from '@/hooks/useAuth';

export function TopBar({ title }: { title?: string }) {
  const { profile, logout } = useAuth();
  const { toggle, isOpen } = useMobileMenu();
  
  return (
    <>
      <NotificationPermissionButton />
      <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button 
          onClick={toggle}
          className="lg:hidden p-2 text-slate-400 hover:bg-slate-900 rounded-lg transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <h2 className="text-sm sm:text-lg font-black text-slate-100 uppercase tracking-widest truncate">{title || 'Dashboard'}</h2>
      </div>

      <div className="flex items-center gap-4">
        <NotificationBell />
        <div className="h-6 w-px bg-slate-800 mx-2"></div>
        <button 
          onClick={() => {
            console.log('Trocar Login clicado');
            logout();
          }}
          className="flex items-center gap-3 hover:bg-slate-900 p-2 rounded-xl transition-all duration-200 group border border-transparent hover:border-slate-800 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
          title="Trocar Login"
        >
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold leading-none group-hover:text-blue-400 transition-colors">{profile?.name || 'Usuário'}</p>
            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">Trocar Login</p>
          </div>
          <div className="size-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-sm uppercase ring-2 ring-slate-800 relative group-hover:ring-blue-600 transition-all duration-200">
            {profile?.name?.[0] || profile?.username?.[0] || '?'}
          </div>
        </button>
      </div>
    </header>
    </>
  );
}
