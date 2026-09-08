import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Phone, Loader2, UserPlus, Tag, MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Conversation } from "@/hooks/use-messages";
interface GroupDetailsPanelProps {
  conversation: Conversation;
  onSelectParticipant?: (profileId: string, phone: string, name: string) => void;
}
interface Participant {
  participation_id: string;
  profile_id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  lead_id: string | null;
  stage: string | null;
  group_role: string | null;
}
export function GroupDetailsPanel({
  conversation,
  onSelectParticipant
}: GroupDetailsPanelProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch participants (This depends on the new group_participants table)
  useEffect(() => {
    const fetchParticipants = async () => {
      setIsLoading(true);
      if (!conversation.client?.id) return;
      try {
        // Tenta buscar da view vw_group_participants (se ela existir)
        const {
          data,
          error
        } = await supabase.from('vw_group_participants').select('*').eq('group_id', conversation.client.id);
        if (data) {
          setParticipants(data);
        } else {
          // Se der erro (view não existe), logamos o erro silenciosamente
          console.log('Group participants table/view not ready yet');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchParticipants();
  }, [conversation.client?.id]);
  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'GP';
    return name.substring(0, 2).toUpperCase();
  };
  return <div className="p-6 h-full flex flex-col">
      {/* Group Header */}
      <div className="text-center mb-6">
        <Avatar className="h-20 w-20 mx-auto mb-3">
          {conversation.client?.avatar_url ? <AvatarImage src={conversation.client.avatar_url} alt={conversation.client?.full_name || 'Grupo'} className="object-cover" /> : null}
          <AvatarFallback className="text-2xl bg-indigo-500 text-white">
            {getInitials(conversation.client?.full_name)}
          </AvatarFallback>
        </Avatar>
        <h3 className="font-semibold text-lg text-foreground">{conversation.client?.full_name || 'Grupo Sem Nome'}</h3>
        <p className="text-sm text-muted-foreground">Grupo de WhatsApp</p>
        
        <div className="flex items-center justify-center gap-2 mt-3">
          <Badge variant="outline" className="text-[10px] bg-indigo-50 text-indigo-600 border-indigo-200">
            {participants.length} Participantes
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            {conversation.status === 'open' ? 'Atendimento Ativo' : 'Atendimento Encerrado'}
          </Badge>
        </div>
        
        <div className="flex items-center justify-center gap-3 mt-4">
          <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => window.open(`https://wa.me/${conversation.client?.phone?.replace(/\D/g, '')}`, '_blank')}>
            <Phone className="h-3 w-3" /> Abrir WhatsApp
          </Button>
        </div>
      </div>

      {/* Participants Info */}
      <div className="rounded-lg border bg-muted/30 flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b bg-muted/50 flex items-center justify-between">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Users className="h-3.5 w-3.5" /> Participantes do Grupo
          </h4>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <UserPlus className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </div>
        
        <div className="p-3 overflow-y-auto flex-1 space-y-3">
          {isLoading ? <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div> : participants.length > 0 ? participants.map(p => <div key={p.participation_id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    {p.avatar_url && <AvatarImage src={p.avatar_url} />}
                    <AvatarFallback className="text-[10px]">{getInitials(p.full_name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-foreground max-w-[100px] truncate">
                      {p.full_name || p.phone || 'Sem Nome'}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {p.group_role === 'admin' ? 'Administrador' : 'Membro'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {p.lead_id ? <Badge variant="outline" className="text-[9px] bg-green-50 text-green-700 border-green-200 shrink-0">
                      Lead
                    </Badge> : <Badge variant="outline" className="text-[9px] text-muted-foreground shrink-0">
                      Contato
                    </Badge>}
                  {onSelectParticipant && p.phone && <Button variant="ghost" size="icon" className="h-7 w-7 text-accent hover:text-accent hover:bg-accent/10 rounded-full shrink-0" onClick={() => onSelectParticipant(p.profile_id, p.phone!, p.full_name || '')} title="Conversa Privada">
                      <MessageSquare className="h-3.5 w-3.5" />
                    </Button>}
                </div>
              </div>) : <div className="text-center py-6 text-sm text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p>Nenhum participante mapeado</p>
              <p className="text-xs mt-1">O banco de dados de participantes ainda não foi populado.</p>
            </div>}
        </div>
      </div>
    </div>;
}