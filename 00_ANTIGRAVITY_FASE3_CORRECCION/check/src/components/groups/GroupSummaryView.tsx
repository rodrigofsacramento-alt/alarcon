import React from 'react';
import { X, BellOff, Search, Users, ChevronRight, Bell, Lock, Headset, Camera } from 'lucide-react';
import { useGroupPanelStore } from '../../store/useGroupPanelStore';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useConversations } from '@/hooks/use-messages';
import { supabase } from '@/lib/supabase';
export function GroupSummaryView() {
  const {
    groupId,
    closePanel,
    setView
  } = useGroupPanelStore();
  const {
    user,
    profile
  } = useAuth();
  const {
    data: conversations
  } = useConversations(user?.id, profile?.role);
  const conversation = conversations?.find(c => c.id === groupId);
  const groupName = conversation?.client?.full_name || 'Nome do Grupo';
  const [participantsCount, setParticipantsCount] = React.useState<number | null>(null);
  React.useEffect(() => {
    async function fetchCount() {
      if (!conversation?.client?.id) return;
      const {
        count,
        error
      } = await supabase.from('vw_group_participants').select('*', {
        count: 'exact',
        head: true
      }).eq('group_id', conversation.client.id);
      if (!error && count !== null) {
        setParticipantsCount(count);
      }
    }
    fetchCount();
  }, [conversation?.client?.id]);
  const displayCount = participantsCount !== null ? participantsCount : conversation?.whatsapp_contact?.length || 0;
  return <div className="flex flex-col h-full bg-background border-l border-border shadow-xl w-full sm:w-[400px]">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={closePanel} className="rounded-full text-muted-foreground hover:bg-accent">
            <X className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-semibold text-foreground">Dados do Grupo</h2>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {/* Avatar & Main Info */}
        <div className="flex flex-col items-center pt-8 pb-4 px-6 text-center">
          <div className="relative group cursor-pointer mb-4">
            <Avatar className="w-40 h-40 border-4 border-background shadow-lg">
              <AvatarImage src="https://ui-avatars.com/api/?name=Grupo&background=e67e22&color=fff&size=160" />
              <AvatarFallback className="bg-primary/20 text-4xl">G</AvatarFallback>
            </Avatar>
            <div className="absolute bottom-1 right-3 bg-primary p-2 rounded-full text-primary-foreground shadow-md border-2 border-background hover:scale-110 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-1">{groupName}</h1>
          <p className="text-base text-muted-foreground">Grupo · {displayCount} participantes</p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-4 px-6 py-4">
          <button className="flex flex-col items-center justify-center p-4 bg-card border border-border rounded-xl hover:bg-accent transition-all active:scale-95 group">
            <BellOff className="w-6 h-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-semibold text-foreground">Mute</span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 bg-card border border-border rounded-xl hover:bg-accent transition-all active:scale-95 group">
            <Search className="w-6 h-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-semibold text-foreground">Search</span>
          </button>
        </div>

        {/* Description Section */}
        <div className="px-6 py-4 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
              Resumo dos Dados do Grupo
            </h3>
            <button className="text-primary hover:underline text-xs font-medium">Edit</button>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Este grupo é dedicado à sincronização enterprise entre fluxos de trabalho CRM e canais de atendimento WhatsApp. Focado em performance, agilidade e automação de leads qualificados.
          </p>
          <div className="mt-2 flex items-center">
            <span className="w-2 h-2 bg-brand-orange rounded-full mr-2 animate-pulse" />
            <span className="text-xs font-medium text-primary">Sincronização Ativa</span>
          </div>
        </div>

        {/* Members Section Card */}
        <div className="px-6 py-4">
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <button onClick={() => setView('members')} className="w-full flex items-center justify-between p-4 hover:bg-accent transition-colors text-left group">
              <div className="flex items-center gap-4">
                <Users className="w-6 h-6 text-muted-foreground" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Visualizar membros</p>
                  <p className="text-sm text-muted-foreground">Ver todos os participantes</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Settings Toggles */}
        <div className="px-6 py-4 border-t border-border space-y-4">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Configurações</h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="text-base text-foreground">Ocultar notificações</span>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Lock className="w-5 h-5 text-muted-foreground" />
              <span className="text-base text-foreground">Apenas ADMs postam</span>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Headset className="w-5 h-5 text-muted-foreground" />
              <span className="text-base text-foreground">Agente Responsável</span>
            </div>
            <span className="text-sm font-semibold text-primary">Angel</span>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="px-6 py-6 space-y-2">
          <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10">
            Sair do grupo
          </Button>
          <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10">
            Denunciar grupo
          </Button>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-center items-center">
          <span className="text-xs text-muted-foreground opacity-60">CRM Nexus Enterprise Platform</span>
        </div>
      </ScrollArea>
    </div>;
}