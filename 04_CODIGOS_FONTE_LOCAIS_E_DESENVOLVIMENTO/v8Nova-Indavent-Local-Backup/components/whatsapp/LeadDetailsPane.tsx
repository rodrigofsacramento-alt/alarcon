import React, { useEffect, useState } from 'react';
import { Conversation } from '@/hooks/use-messages';
import { supabase } from '@/lib/supabase';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Package, 
  Search, 
  FileText, 
  Edit3, 
  Trash2,
  X 
} from 'lucide-react';

interface LeadDetailsPaneProps {
  activeConv: Conversation;
  onClose?: () => void;
}

export function LeadDetailsPane({ activeConv, onClose }: LeadDetailsPaneProps) {
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLead() {
      if (!activeConv?.phone_number) return;
      setLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .eq('phone', activeConv.phone_number)
          .limit(1)
          .maybeSingle();
          
        if (error) throw error;
        setLead(data);
      } catch (err) {
        console.error("Erro ao buscar lead:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchLead();
  }, [activeConv]);

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-white dark:bg-slate-900 border-l">
        <span className="text-slate-500">Carregando detalhes...</span>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-white dark:bg-slate-900 border-l p-6 text-center">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Lead não encontrado</h3>
        <p className="text-sm text-slate-500">
          Não encontramos um lead cadastrado com o número {activeConv.phone_number}. 
          Se este for um contato novo, adicione-o pelo módulo de Leads.
        </p>
      </div>
    );
  }

  const initials = lead.name ? lead.name.substring(0, 2).toUpperCase() : 'LD';

  return (
    <div className="h-full w-full bg-white dark:bg-slate-900 border-l flex flex-col overflow-y-auto">
      {/* HEADER */}
      <div className="p-6 border-b flex justify-between items-start">
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
            {initials}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase">
              {lead.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Lead Ativo
              </span>
            </div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-md">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* QUICK INFO (Stage, Budget, Salesperson) */}
      <div className="p-6 border-b bg-slate-50 dark:bg-slate-800/50">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Estágio</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{lead.stage || 'Cadastrado'}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Orçamento</p>
            <p className="text-sm font-bold text-blue-600 dark:text-blue-400">R$ {lead.budget_amount || '0,00'}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Vendedor</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{lead.salesperson || 'Não definido'}</p>
          </div>
        </div>
      </div>

      {/* DETALHES GERAIS */}
      <div className="p-6 space-y-8 flex-1">
        
        {/* Informações de Contato */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Informações de Contato</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Telefone Principal</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{lead.phone}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">CNPJ</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{lead.cnpj || 'Não informado'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">E-mail</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{lead.email || 'Não informado'}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Localização</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{lead.city || 'Não informada'} {lead.state ? `- ${lead.state}` : ''}</p>
                <p className="text-xs text-slate-500">{lead.address || 'Endereço não informado'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Produto e Origem */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Produto de Interesse</h3>
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border">
              <Package className="w-4 h-4 text-slate-400" />
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{lead.product || 'Não definido'}</p>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Origem do Lead</h3>
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border">
              <Search className="w-4 h-4 text-slate-400" />
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{lead.source_details || 'WhatsApp'}</p>
            </div>
          </div>
        </div>

        {/* Documentos e Observacoes */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Documentos e Propostas</h3>
          <p className="text-sm italic text-slate-400">Nenhuma proposta ou orçamento anexado</p>
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Observações</h3>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-xl border border-yellow-100 dark:border-yellow-900/50 text-sm">
            {lead.notes || <span className="italic opacity-70">Nenhuma observação registrada para este lead.</span>}
          </div>
        </div>

      </div>
    </div>
  );
}
