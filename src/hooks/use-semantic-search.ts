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

// Contato de Atendimiento: cliente de uma conversación (profiles), vinculado por
// conversation.client_id → profiles.id. Se busca por full_name ou phone.
export interface Contact {
  id: string; // profiles.id (client_id da conversación) — usado como contact_id
  conversationId: string; // id da conversación de onde proviene
  name: string;
  phone: string;
  email: string | null;
  avatarUrl: string | null;
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

// Búsqueda parcial sobre contatos de atendimiento (conversations → client.full_name / phone).
export const searchContacts = (query: string, contacts: Contact[]): Contact[] => {
  if (!query.trim()) return [];

  const q = query.toLowerCase();
  return contacts.filter((contact) =>
    contact.name.toLowerCase().includes(q) ||
    contact.phone.toLowerCase().includes(q) ||
    contact.email?.toLowerCase().includes(q) ||
    contact.id.toLowerCase().includes(q)
  );
};