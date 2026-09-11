import { create } from 'zustand';

interface GroupPanelState {
  isOpen: boolean;
  activeView: 'summary' | 'members';
  groupId: string | null;
  
  // Actions
  openPanel: (groupId?: string) => void;
  closePanel: () => void;
  togglePanel: (groupId?: string) => void;
  setView: (view: 'summary' | 'members') => void;
  setGroupId: (id: string | null) => void;
}

export const useGroupPanelStore = create<GroupPanelState>((set, get) => ({
  isOpen: false,
  activeView: 'summary',
  groupId: null,
  
  openPanel: (id) => set({ 
    isOpen: true, 
    ...(id !== undefined ? { groupId: id } : {})
  }),
  
  closePanel: () => set({ isOpen: false }),
  
  togglePanel: (id) => set((state) => {
    const willOpen = !state.isOpen;
    return {
      isOpen: willOpen,
      ...(id !== undefined && willOpen ? { groupId: id } : {})
    };
  }),
  
  setView: (view) => set({ activeView: view }),
  
  setGroupId: (groupId) => set({ groupId }),
}));

// Expor para testes locais via console
if (typeof window !== 'undefined') {
  (window as any).openGroupPanel = useGroupPanelStore.getState().openPanel;
}
