// Hook para busca semântica em leads e imóveis

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  score: number;
  stage: string;
  location?: string;
  propertyCode?: string;
}

export interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
}

// Função de busca semântica simples (sem acesso a IA, usa matching local)
export const searchProperties = (query: string, properties: Property[]): Property[] => {
  if (!query.trim()) return [];
  
  const q = query.toLowerCase();
  return properties.filter((prop) =>
    prop.title.toLowerCase().includes(q) ||
    prop.location.toLowerCase().includes(q) ||
    prop.id.toLowerCase().includes(q)
  );
};

export const searchLeads = (query: string, leads: Lead[]): Lead[] => {
  if (!query.trim()) return [];
  
  const q = query.toLowerCase();
  return leads.filter((lead) =>
    lead.name.toLowerCase().includes(q) ||
    lead.email.toLowerCase().includes(q) ||
    lead.phone?.includes(q) ||
    lead.id.toLowerCase().includes(q)
  );
};
