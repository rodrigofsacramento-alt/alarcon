import { useEffect, useRef, useState } from "react";
import { Search, ChevronsUpDown, Loader2, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface LookupItem {
  id: string;
  [key: string]: any;
}

export interface AsyncComboboxProps {
  placeholder?: string;
  /** Nome da tabela no Supabase (ex.: "leads", "profiles", "properties") */
  table: string;
  /** Campos para busca ILIKE (OR) */
  searchFields: string[];
  /** Campos a retornar (ex.: "id,name,phone") */
  selectFields: string;
  /** Campo a exibir como label principal */
  labelField: string;
  /** Campo secundário opcional (phone, email, loteamento) */
  subtitleField?: string;
  /** Campo a usar na ordenação alfabética dos resultados (default: labelField) */
  orderBy?: string;
  /** UUID selecionado */
  value: string;
  /** Callback recebe o item completo (enviar item.id ao guardar) */
  onChange: (item: LookupItem | null) => void;
  icon?: React.ReactNode;
  disabled?: boolean;
}

/**
 * AsyncCombobox genérico para FK lookups (leads, profiles, properties).
 * Busca no Supabase com debounce de 300ms + dropdown glassmorphism dark ADA.
 * Envia o UUID (item.id) no onChange — nunca texto solto.
 */
export function AsyncCombobox({
  placeholder = "Buscar...",
  table,
  searchFields,
  selectFields,
  labelField,
  subtitleField,
  orderBy,
  value,
  onChange,
  icon,
  disabled,
}: AsyncComboboxProps) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<LookupItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<LookupItem | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // Load label do item pré-selecionado (ex.: corretor logado como default)
  useEffect(() => {
    if (!value) {
      setSelected(null);
      return;
    }
    let active = true;
    (supabase as any)
      .from(table)
      .select(selectFields)
      .eq("id", value)
      .maybeSingle()
      .then(({ data }: { data: any }) => {
        if (active && data) setSelected(data as LookupItem);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [value, table, selectFields]);

  const runSearch = async (q: string) => {
    setLoading(true);
    try {
      let db = (supabase as any).from(table).select(selectFields);
      if (q.trim()) {
        const or = searchFields.map((f) => `${f}.ilike.%${q}%`).join(",");
        db = db.or(or);
      }
      // Ordenação alfabética estável (default: labelField) — navegação previsível
      db = db.order(orderBy || labelField, { ascending: true });
      const { data } = await db.limit(10);
      setItems((data as LookupItem[]) || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce 300ms
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => runSearch(query), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, open, table, selectFields]);

  // Fecha ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (item: LookupItem) => {
    setSelected(item);
    setOpen(false);
    onChange(item);
  };

  return (
    <div ref={rootRef}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "flex h-10 w-full items-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 text-left text-sm transition-colors",
              "hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-0",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            <span className="shrink-0 text-white/40">{icon || <Search className="h-4 w-4" />}</span>
            <span className="min-w-0 flex-1 truncate">
              {selected ? (
                <span className="text-white">{selected[labelField]}</span>
              ) : (
                <span className="text-white/40">{placeholder}</span>
              )}
            </span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 text-white/40" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={6}
          className="w-[var(--radix-popover-trigger-width)] !bg-[#0a0a0a]/95 !border-white/10 p-0 text-white backdrop-blur-3xl shadow-2xl"
        >
          <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
            <Search className="h-4 w-4 shrink-0 text-white/40" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar..."
              className="h-10 w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
            />
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {loading && (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-white/50">
                <Loader2 className="h-4 w-4 animate-spin" /> Buscando...
              </div>
            )}
            {!loading && items.length === 0 && (
              <p className="py-6 text-center text-sm text-white/50">Nenhum resultado.</p>
            )}
            {!loading &&
              items.map((item) => {
                const isSelected = item.id === value;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
                      "hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                      isSelected && "bg-accent/20 text-white",
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block truncate">{item[labelField]}</span>
                      {subtitleField && item[subtitleField] && (
                        <span className="block truncate text-xs text-white/45">{item[subtitleField]}</span>
                      )}
                    </span>
                    {isSelected && <Check className="h-4 w-4 shrink-0 text-accent" />}
                  </button>
                );
              })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}