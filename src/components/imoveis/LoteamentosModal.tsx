import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Map, Plus, Pencil, Trash2, Loader2, X, ExternalLink, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  useLoteamentos, useLoteadores, useCreateLoteamento, useUpdateLoteamento, useDeleteLoteamento, useLoteamentoImoveis,
  type Loteamento, type LoteamentoInput,
} from "@/hooks/use-loteadores";

interface LoteamentosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emptyForm: LoteamentoInput = { nome: "", cidade: "", estado: "", disponibilidade: true, valor_minimo: null, valor_maximo: null, loteador_id: null };

const fmtValor = (v?: number | null) =>
  v == null ? "—" : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export function LoteamentosModal({ open, onOpenChange }: LoteamentosModalProps) {
  const navigate = useNavigate();
  const { data: loteamentos = [], isLoading } = useLoteamentos();
  const { data: loteadores = [] } = useLoteadores();
  const createMut = useCreateLoteamento();
  const updateMut = useUpdateLoteamento();
  const deleteMut = useDeleteLoteamento();

  const [form, setForm] = useState<LoteamentoInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [ficha, setFicha] = useState<Loteamento | null>(null);

  const { data: imoveisVinc = [], isLoading: isLoadingImoveis } = useLoteamentoImoveis(ficha?.id);

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setFormOpen(true); };
  const openEdit = (lt: Loteamento) => {
    setForm({
      nome: lt.nome, cidade: lt.cidade || "", estado: lt.estado || "",
      disponibilidade: lt.disponibilidade,
      valor_minimo: lt.valor_minimo ?? null, valor_maximo: lt.valor_maximo ?? null,
      loteador_id: lt.loteador_id || null,
    });
    setEditingId(lt.id);
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.nome.trim()) {
      toast({ title: "Nome obrigatório", description: "Informe o nome do loteamento.", variant: "destructive" });
      return;
    }
    try {
      if (editingId) {
        await updateMut.mutateAsync({ id: editingId, ...form });
        toast({ title: "Atualizado", description: `Loteamento ${form.nome} atualizado.` });
      } else {
        await createMut.mutateAsync(form);
        toast({ title: "Cadastrado", description: `Loteamento ${form.nome} criado com sucesso.` });
      }
      setFormOpen(false);
      setForm(emptyForm);
      setEditingId(null);
    } catch (err: any) {
      toast({ title: "Erro ao salvar", description: err?.message || "Tente novamente.", variant: "destructive" });
    }
  };

  const handleDelete = async (lt: Loteamento) => {
    try {
      await deleteMut.mutateAsync(lt.id);
      if (ficha?.id === lt.id) setFicha(null);
      toast({ title: "Excluído", description: `Loteamento ${lt.nome} removido.` });
    } catch (err: any) {
      toast({ title: "Erro ao excluir", description: err?.message || "Tente novamente.", variant: "destructive" });
    }
  };

  const setField = (k: keyof LoteamentoInput, v: any) => setForm((p) => ({ ...p, [k]: v }));
  const num = (s: string) => (s === "" ? null : parseFloat(s.replace(/\./g, "").replace(",", ".")) || null);

  const abrirImovel = (propertyId: string) => {
    onOpenChange(false);
    navigate(`/imoveis?property=${propertyId}`);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setFicha(null); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-5 flex items-center justify-between">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Map className="h-5 w-5 text-accent" />
              </div>
              <div>
                <span>Loteamentos</span>
                <p className="text-sm font-normal text-muted-foreground mt-0.5">
                  {ficha ? `Ficha: ${ficha.nome}` : "Cidade, estado, disponibilidade e valores"}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
          {!ficha && (
            <Button variant="cta" size="sm" className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" /> Novo
            </Button>
          )}
          {ficha && (
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setFicha(null)}>
              <X className="h-4 w-4" /> Voltar
            </Button>
          )}
        </div>

        {/* ---------- FICHA do loteamento (deeplink) ---------- */}
        {ficha && (
          <div className="px-6 py-4 space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div><p className="text-xs text-muted-foreground">Cidade</p><p className="font-medium">{ficha.cidade || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground">Estado</p><p className="font-medium">{ficha.estado || "—"}</p></div>
              <div>
                <p className="text-xs text-muted-foreground">Disponibilidade</p>
                {ficha.disponibilidade
                  ? <Badge className="bg-accent text-accent-foreground mt-1">Disponível</Badge>
                  : <Badge className="bg-muted text-muted-foreground mt-1">Indisponível</Badge>}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Loteador/Proprietário</p>
                <p className="font-medium">{ficha.loteador?.nome || loteadores.find((l) => l.id === ficha.loteador_id)?.nome || "—"}</p>
              </div>
              <div><p className="text-xs text-muted-foreground">Valor mínimo</p><p className="font-medium">{fmtValor(ficha.valor_minimo)}</p></div>
              <div><p className="text-xs text-muted-foreground">Valor máximo</p><p className="font-medium">{fmtValor(ficha.valor_maximo)}</p></div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Imóveis vinculados (terrenos e lotes)</p>
              {isLoadingImoveis && <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-accent" /></div>}
              {!isLoadingImoveis && imoveisVinc.length === 0 && (
                <p className="text-sm text-muted-foreground py-2">Nenhum terreno/lote vinculado a este loteamento.</p>
              )}
              <div className="space-y-2">
                {imoveisVinc.map((im) => (
                  <div key={im.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{im.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {im.code ? `${im.code} · ` : ""}{im.type === "land" ? "Terreno" : "Lote"} · {(im.amount ?? im.price).toLocaleString("pt-BR")} {im.currency || "USD"}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={() => abrirImovel(im.id)}>
                      <ExternalLink className="h-4 w-4" /> Abrir imóvel
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ---------- LISTA ---------- */}
        {!ficha && formOpen && (
          <div className="px-6 py-4 border-b border-border bg-muted/20 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{editingId ? "Editar loteamento" : "Novo Loteamento"}</span>
              <Button variant="ghost" size="icon" onClick={() => { setFormOpen(false); setEditingId(null); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do Loteamento *</Label>
                <Input placeholder="Ex: Loteamento Bela Vista" value={form.nome} onChange={(e) => setField("nome", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Loteador / Proprietário</Label>
                <Select
                  value={form.loteador_id || "none"}
                  onValueChange={(v) => setField("loteador_id", v === "none" ? null : v)}
                >
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {loteadores.map((l) => (
                      <SelectItem key={l.id} value={l.id}>{l.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Cidade</Label>
                <Input placeholder="Ex: Ciudad del Este" value={form.cidade} onChange={(e) => setField("cidade", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Input placeholder="Ex: Alto Paraná" value={form.estado} onChange={(e) => setField("estado", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Disponibilidade</Label>
                <Select value={String(form.disponibilidade)} onValueChange={(v) => setField("disponibilidade", v === "true")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Sim — disponível</SelectItem>
                    <SelectItem value="false">Não — indisponível</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor mínimo</Label>
                  <Input type="number" placeholder="0" value={form.valor_minimo ?? ""} onChange={(e) => setField("valor_minimo", num(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label>Valor máximo</Label>
                  <Input type="number" placeholder="0" value={form.valor_maximo ?? ""} onChange={(e) => setField("valor_maximo", num(e.target.value))} />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setFormOpen(false); setEditingId(null); }}>Cancelar</Button>
              <Button variant="cta" onClick={handleSubmit} disabled={createMut.isPending || updateMut.isPending}>
                {(createMut.isPending || updateMut.isPending) ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId ? "Salvar Alterações" : "Cadastrar"}
              </Button>
            </div>
          </div>
        )}

        {!ficha && (
          <div className="px-6 py-4">
            {isLoading && <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>}
            {!isLoading && loteamentos.length === 0 && !formOpen && (
              <div className="text-center py-10">
                <p className="text-muted-foreground mb-3">Nenhum loteamento cadastrado.</p>
                <Button variant="cta" className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" /> Cadastrar Primeiro</Button>
              </div>
            )}
            <div className="space-y-2">
              {loteamentos.map((lt) => (
                <div key={lt.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
                  <button className="min-w-0 text-left flex-1" onClick={() => setFicha(lt)}>
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{lt.nome}</p>
                      {lt.disponibilidade
                        ? <Badge className="bg-accent text-accent-foreground gap-1"><CheckCircle2 className="h-3 w-3" /> Disponível</Badge>
                        : <Badge className="bg-muted text-muted-foreground gap-1"><XCircle className="h-3 w-3" /> Indisponível</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {[lt.cidade, lt.estado].filter(Boolean).join(" / ") || "—"}
                      {" · "}{fmtValor(lt.valor_minimo)} – {fmtValor(lt.valor_maximo)}
                      {lt.loteador?.nome ? ` · ${lt.loteador.nome}` : ""}
                    </p>
                  </button>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => setFicha(lt)}>Ficha</Button>
                    <Button variant="outline" size="icon" onClick={() => openEdit(lt)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(lt)} disabled={deleteMut.isPending}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}