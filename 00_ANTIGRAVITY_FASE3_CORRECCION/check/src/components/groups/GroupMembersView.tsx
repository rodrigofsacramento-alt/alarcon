import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, UserPlus, ShieldAlert, Settings2, MessageCircle, Loader2 } from 'lucide-react';
import { useGroupPanelStore } from '../../store/useGroupPanelStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useConversations } from '@/hooks/use-messages';
interface Participant {
  participation_id: string;
  group_id: string;
  group_role: string | null;
  profile_id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  lead_id: string | null;
  stage: string | null;
}
export function GroupMembersView() {
  const {
    groupId,
    setView,
    closePanel
  } = useGroupPanelStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    user,
    profile
  } = useAuth();
  const {
    data: conversations
  } = useConversations(user?.id, profile?.role);
  const conversation = conversations?.find(c => c.id === groupId);
  useEffect(() => {
    async function fetchParticipants() {
      if (!conversation?.client?.id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const {
          data,
          error
        } = await supabase.from('vw_group_participants').select('*').eq('group_id', conversation.client.id);
        if (data) {
          setParticipants(data);
        }
      } catch (err) {
        console.error('Error fetching participants:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchParticipants();
  }, [conversation?.client?.id]);
  const filteredMembers = participants.filter(m => m.full_name && m.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || m.phone && m.phone.includes(searchTerm));
  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };
  const getStatusText = (member: Participant) => {
    if (member.stage) return `Estágio: ${member.stage}`;
    if (member.email) return member.email;
    return 'Participante';
  };
  const handleOpenPrivateChat = (member: Participant) => {
    const event = new CustomEvent('openPrivateChat', {
      detail: {
        profileId: member.profile_id,
        phone: member.phone,
        name: member.full_name || 'Desconhecido'
      }
    });
    window.dispatchEvent(event);
    closePanel();
  };
  return <div className="flex flex-col h-full bg-background border-l border-border shadow-xl w-full sm:w-[400px]">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setView('summary')} className="rounded-full text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Membros</h2>
            <p className="text-xs text-muted-foreground">
              {loading ? 'Carregando...' : `${participants.length} participantes`}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-border space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9 bg-accent border-none h-10 w-full" placeholder="Buscar participante..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between px-2">
          <button className="flex items-center gap-3 text-primary hover:bg-accent p-2 rounded-lg transition-colors flex-1">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-semibold">Add membro</span>
          </button>
          
          <button className="flex items-center gap-3 text-muted-foreground hover:bg-accent p-2 rounded-lg transition-colors">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Settings2 className="w-4 h-4" />
            </div>
          </button>
        </div>
      </div>

      {/* Members List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {loading ? <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mb-2" />
              <p className="text-sm">Buscando membros do grupo...</p>
            </div> : <>
              {filteredMembers.map(member => <div key={member.participation_id} className="flex items-center justify-between p-3 hover:bg-accent rounded-xl transition-colors group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 border-2 border-transparent group-hover:border-primary/20 transition-colors">
                      {member.avatar_url && <AvatarImage src={member.avatar_url} />}
                      <AvatarFallback>{getInitials(member.full_name)}</AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">
                          {member.full_name || member.phone || 'Usuário Desconhecido'}
                        </p>
                        {member.group_role === 'admin' && <span className="text-[10px] uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm font-bold">
                            Admin
                          </span>}
                        {member.full_name?.toLowerCase().includes('angel') && <span className="text-[10px] uppercase tracking-wider bg-brand-orange/10 text-brand-orange px-1.5 py-0.5 rounded-sm font-bold flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" /> IA
                          </span>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{getStatusText(member)}</p>
                    </div>
                  </div>

                  {/* Chat action (invisible by default, appears on hover) */}
                  <button onClick={() => handleOpenPrivateChat(member)} className="opacity-0 group-hover:opacity-100 p-2 text-primary hover:bg-primary/10 rounded-full transition-all" title="Abrir chat direto">
                    <MessageCircle className="w-5 h-5" />
                  </button>
                </div>)}

              {filteredMembers.length === 0 && <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Search className="w-8 h-8 text-muted-foreground/50 mb-3" />
                  <p className="text-sm font-medium text-foreground">Nenhum membro encontrado</p>
                  <p className="text-xs text-muted-foreground mt-1">Verifique o nome pesquisado.</p>
                </div>}
            </>}
        </div>
      </ScrollArea>
    </div>;
}