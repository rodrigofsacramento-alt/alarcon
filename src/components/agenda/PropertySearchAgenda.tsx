import { useState } from "react";
import { MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchProperties, type Property } from "@/hooks/use-semantic-search";

interface PropertySearchAgendaProps {
  availableProperties: Property[];
  onPropertySelect: (property: Property) => void;
  placeholder?: string;
}

export function PropertySearchAgenda({ availableProperties, onPropertySelect, placeholder = "Buscar: código, nome ou localização..." }: PropertySearchAgendaProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Property[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      const results = searchProperties(value, availableProperties);
      setSearchResults(results);
      setIsOpen(true);
    } else {
      setSearchResults([]);
      setIsOpen(false);
    }
  };

  const handleSelectProperty = (property: Property) => {
    onPropertySelect(property);
    setSearchQuery(property.title);
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
          {searchResults.map((prop) => (
            <button
              key={prop.id}
              onClick={() => handleSelectProperty(prop)}
              className="w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b border-border last:border-b-0"
            >
              <div className="font-medium text-foreground">{prop.title}</div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {prop.location}
              </div>
              <div className="text-sm text-accent font-medium">{prop.price}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
