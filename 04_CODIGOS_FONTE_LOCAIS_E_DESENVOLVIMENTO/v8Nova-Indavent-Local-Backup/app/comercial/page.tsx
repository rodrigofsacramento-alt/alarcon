'use client';

import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import Link from 'next/link';
import { 
  Store,
  MessageSquare,
  Calculator,
  FileText,
  Briefcase,
  UserPlus,
  UserCircle,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const commercialModules = [
  {
    name: 'WhatsApp',
    description: 'Gestão de mensagens e atendimento via WhatsApp.',
    icon: MessageSquare,
    href: '/comercial/whatsapp',
    color: 'bg-emerald-50 text-emerald-600',
    borderColor: 'border-emerald-200'
  },
  {
    name: 'Orçamentos',
    description: 'Criação e gestão de orçamentos para clientes.',
    icon: Calculator,
    href: '/budgets',
    color: 'bg-blue-50 text-blue-600',
    borderColor: 'border-blue-200'
  },
  {
    name: 'Gestão de Propostas',
    description: 'Acompanhamento e envio de propostas comerciais.',
    icon: FileText,
    href: '/proposals',
    color: 'bg-amber-50 text-amber-600',
    borderColor: 'border-amber-200'
  },
  {
    name: 'Oportunidades',
    description: 'Pipeline de oportunidades de negócio e negócios em andamento.',
    icon: Briefcase,
    href: '/opportunities',
    color: 'bg-purple-50 text-purple-600',
    borderColor: 'border-purple-200'
  },
  {
    name: 'Leads',
    description: 'Gestão da base de leads e prospecção ativa.',
    icon: UserPlus,
    href: '/leads',
    color: 'bg-indigo-50 text-indigo-600',
    borderColor: 'border-indigo-200'
  },
  {
    name: 'Contatos',
    description: 'Catálogo de contatos, clientes e parceiros.',
    icon: UserCircle,
    href: '/contacts',
    color: 'bg-rose-50 text-rose-600',
    borderColor: 'border-rose-200'
  }
];

export default function ComercialPage() {
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden sidebar-offset">
        <TopBar title="Setor Comercial" />
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20">
                  <Store size={24} />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Setor Comercial</h2>
                  <p className="text-slate-500 font-medium mt-1 uppercase text-[10px] tracking-widest">Painel de controle e acesso aos módulos</p>
                </div>
              </div>
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {commercialModules.map((module) => (
                <Link 
                  key={module.name} 
                  href={module.href}
                  target={module.href.startsWith('http') ? '_blank' : undefined}
                  rel={module.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className={cn(
                    "group bg-white border rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col",
                    module.borderColor
                  )}
                >
                  <div className={cn("size-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", module.color)}>
                    <module.icon size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{module.name}</h3>
                  <p className="text-sm text-slate-500 mb-6 flex-1">
                    {module.description}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                    <span className="text-sm font-bold text-slate-400 group-hover:text-slate-600 transition-colors">Acessar módulo</span>
                    <div className="size-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
