import React, { useEffect } from 'react';
import { useGroupPanelStore } from '../../store/useGroupPanelStore';
import { GroupSummaryView } from './GroupSummaryView';
import { GroupMembersView } from './GroupMembersView';
export function GroupSidePanel() {
  const {
    isOpen,
    activeView,
    closePanel
  } = useGroupPanelStore();

  // Fechar o painel ao apertar ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closePanel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closePanel]);
  if (!isOpen) return null;
  return <>
      {/* Overlay invisível para fechar ao clicar fora (opcional, pode ser ajustado para não bloquear o uso do CRM) */}
      <div className="fixed inset-0 bg-background/5 z-40 sm:hidden" onClick={closePanel} />
      
      {/* Container Principal do Painel */}
      <div className={`fixed inset-y-0 right-0 z-50 transform transition-transform duration-300 ease-in-out flex ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {activeView === 'summary' ? <GroupSummaryView /> : <GroupMembersView />}
      </div>
    </>;
}