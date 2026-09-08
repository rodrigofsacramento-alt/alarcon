import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables, TablesInsert, TablesUpdate } from '@/types/database';

export type Proposal = Tables<'proposals'> & {
  property?: Tables<'properties'> | null;
  agent?: Tables<'profiles'> | null;
  lead?: Tables<'leads'> | null;
  documents?: Tables<'proposal_documents'>[];
  history?: Tables<'proposal_history'>[];
};

export function useProposals(filters?: { status?: string }) {
  const { user, profile } = useAuth();
  const isAgent = profile?.role === 'agent';

  return useQuery({
    queryKey: ['proposals', filters, user?.id, isAgent],
    queryFn: async () => {
      let query = supabase
        .from('proposals')
        .select(`
          *,
          property:properties!proposals_property_id_fkey(*),
          agent:profiles!proposals_agent_id_fkey(*),
          lead:leads!proposals_lead_id_fkey(*)
        `)
        .order('created_at', { ascending: false });

      // Corretores só veem suas próprias propostas
      if (isAgent && user?.id) {
        query = query.eq('agent_id', user.id);
      }

      if (filters?.status && filters.status !== 'Todos') {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Proposal[];
    },
  });
}

export function useProposal(id: string | null) {
  return useQuery({
    queryKey: ['proposal', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          property:properties!proposals_property_id_fkey(*),
          agent:profiles!proposals_agent_id_fkey(*),
          lead:leads!proposals_lead_id_fkey(*)
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Proposal;
    },
    enabled: !!id,
  });
}

export function useProposalDocuments(proposalId: string | null) {
  return useQuery({
    queryKey: ['proposal-documents', proposalId],
    queryFn: async () => {
      if (!proposalId) return [];
      const { data, error } = await supabase
        .from('proposal_documents')
        .select('*')
        .eq('proposal_id', proposalId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!proposalId,
  });
}

export function useProposalHistory(proposalId: string | null) {
  return useQuery({
    queryKey: ['proposal-history', proposalId],
    queryFn: async () => {
      if (!proposalId) return [];
      const { data, error } = await supabase
        .from('proposal_history')
        .select('*')
        .eq('proposal_id', proposalId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!proposalId,
  });
}

export function useCreateProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (proposal: TablesInsert<'proposals'>) => {
      const { data, error } = await supabase
        .from('proposals')
        .insert(proposal)
        .select()
        .single();
      if (error) throw error;

      await supabase.from('proposal_history').insert({
        proposal_id: data.id,
        action: 'Proposta criada',
        user_id: proposal.created_by,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useUpdateProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'proposals'> & { id: string }) => {
      const { data, error } = await supabase
        .from('proposals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;

      await supabase.from('proposal_history').insert({
        proposal_id: id,
        action: `Status alterado para ${updates.status || 'atualizado'}`,
      });

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['proposal', data.id] });
      queryClient.invalidateQueries({ queryKey: ['proposal-history', data.id] });
    },
  });
}

export function useCreateProposalDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (doc: {
      proposal_id: string;
      name: string;
      file_url: string | null;
      status?: string;
      comment?: string;
      uploaded_by?: string;
      checklist_item_id?: string;
    }) => {
      const { data, error } = await supabase
        .from('proposal_documents')
        .insert({
          proposal_id: doc.proposal_id,
          name: doc.name,
          file_url: doc.file_url,
          status: doc.status || 'pending',
          comment: doc.comment || null,
          uploaded_by: doc.uploaded_by || null,
          checklist_item_id: doc.checklist_item_id || null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['proposal-documents', data.proposal_id] });
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    },
  });
}

export function useUpdateProposalDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, proposal_id, ...updates }: {
      id: string;
      proposal_id: string;
      name?: string;
      file_url?: string | null;
      status?: string;
      comment?: string | null;
    }) => {
      const { data, error } = await supabase
        .from('proposal_documents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return { ...data, proposal_id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['proposal-documents', data.proposal_id] });
    },
  });
}

export function useDeleteProposalDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, proposal_id }: { id: string; proposal_id: string }) => {
      const { error } = await supabase
        .from('proposal_documents')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { proposal_id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['proposal-documents', data.proposal_id] });
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    },
  });
}
