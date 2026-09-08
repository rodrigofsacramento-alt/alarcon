import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { searchLeads, type Lead } from "@/hooks/use-semantic-search";
interface LeadSearchProps {
  availableLeads: Lead[];
  onLeadSelect: (lead: Lead) => void;
  placeholder?: string;
  excludeLeadIds?: string[];
}
export function LeadSearch({
  availableLeads,
  onLeadSelect,
  placeholder = "Buscar: nome, email ou telefone...",
  excludeLeadIds = []
}: LeadSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Lead[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      let results = searchLeads(value, availableLeads);
      // Exclude specified leads if needed
      if (excludeLeadIds.length > 0) {
        results = results.filter(l => !excludeLeadIds.includes(l.id));
      }
      setSearchResults(results);
      setIsOpen(true);
    } else {
      setSearchResults([]);
      setIsOpen(false);
    }
  };
  const handleSelectLead = (lead: Lead) => {
    onLeadSelect(lead);
    setSearchQuery(lead.name);
    setIsOpen(false);
  };
  const getSDRColor = (sdr: number) => {
    if (sdr >= 8) return "text-success";
    if (sdr >= 5) return "text-warning";
    return "text-muted-foreground";
  };
  return <div className="relative">
      <div className="relative">
        <Input placeholder={placeholder} value={searchQuery} onChange={e => handleInputChange(e.target.value)} onFocus={() => searchQuery && setIsOpen(true)} className="pr-10" />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>

      {isOpen && searchResults.length > 0 && <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg">
          {searchResults.map(lead => <button key={lead.id} onClick={() => handleSelectLead(lead)} className="w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b border-border last:border-b-0 flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                  {lead.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground truncate">{lead.name}</div>
                <div className="text-sm text-muted-foreground truncate">{lead.email}</div>
              </div>
              <div className={`text-sm font-semibold ${getSDRColor(Math.ceil(lead.score / 10))}`}>
                SDR {Math.ceil(lead.score / 10)}
              </div>
            </button>)}
        </div>}
    </div>;
}