import { useState } from "react";
import { Search, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { searchContacts, type Contact } from "@/hooks/use-semantic-search";
import { useAuth } from "@/contexts/AuthContext";

interface ContactSearchProps {
  availableContacts: Contact[];
  onContactSelect: (contact: Contact) => void;
  placeholder?: string;
  excludeContactIds?: string[];
}

// Espejo de LeadSearch pero busca en 'conversations' (client.full_name / client.phone).
// Muestra nombre + teléfono del contacto de atendimiento en el card.
export function ContactSearch({
  availableContacts,
  onContactSelect,
  placeholder = "Buscar contacto por nome ou telefone...",
  excludeContactIds = [],
}: ContactSearchProps) {
  const { isPhoneRestricted } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      let results = searchContacts(value, availableContacts);
      // Excluir contatos ya seleccionados si es necesario
      if (excludeContactIds.length > 0) {
        results = results.filter((c) => !excludeContactIds.includes(c.id));
      }
      setSearchResults(results);
      setIsOpen(true);
    } else {
      setSearchResults([]);
      setIsOpen(false);
    }
  };

  const handleSelectContact = (contact: Contact) => {
    onContactSelect(contact);
    setSearchQuery(contact.name);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => searchQuery && setIsOpen(true)}
          className="pr-10"
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>

      {isOpen && searchResults.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg">
          {searchResults.map((contact) => (
            <button
              key={contact.id}
              onClick={() => handleSelectContact(contact)}
              className="w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b border-border last:border-b-0 flex items-center gap-3"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                  {contact.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground truncate">{contact.name}</div>
                <div className="text-sm text-muted-foreground truncate flex items-center gap-1">
                  <Phone className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{isPhoneRestricted ? "[Oculto]" : contact.phone || "—"}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}