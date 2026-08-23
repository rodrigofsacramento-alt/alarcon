export const isInternal = (role: string | undefined | null): boolean => {
  if (!role) return false;
  const lowerRole = role.toLowerCase();
  return lowerRole !== 'client' && lowerRole !== 'paciente' && lowerRole !== 'lead';
};

export const getAgentLabel = (name: string, department?: string): string => {
  const displayName = name || 'Atendente não atribuído';
  if (displayName === 'Atendente não atribuído') return displayName;
  return department ? `${displayName} - ${department}` : displayName;
};
