import { useState } from "react";
import { Users, Plus, Pencil, Trash2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  useLoteadores, useCreateLoteador, useUpdateLoteador, useDeleteLoteador,
  type Loteador, type LoteadorInput,
} from "@/hooks/use-loteadores";

interface LoteadoresModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emptyForm: LoteadorInput = { nome: "", tipo: "pessoa", telefone: "", whatsapp: "", documento: "", observacoes: "" };

export function LoteadoresModal({ open, onOpenChange }: LoteadoresModalProps) {
  const { data: loteadores = [], isLoading } = useLoteadores();
  const createMut = useCreateLoteador();
  const updateMut = useUpdateLoteador();
  const deleteMut = useDeleteLoteador();

  const [form, setForm] = useState<LoteadorInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setFormOpen(true); };
  const openEdit = (l: Loteador) => {
    setForm({ nome: l.nome, tipo: l.tipo || "pessoa", telefone: l.telefone || "", whatsapp: l.whatsapp || "", documento: l.documento || "", observacoes: l.observacoes || "" });
    setEditingId(l.id);
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.nome.trim()) {
      toast({ title: "Nome obrigatório", description: "Informe o nome do loteador/proprietário.", variant: "destructive" });
      return;
    }
    try {
      if (editingId) {
        await updateMut.mutateAsync({ id: editingId, ...form });
        toast({ title: "Atualizado", description: `${form.nome} atualizado com sucesso.` });
      } else {
        await createMut.mutateAsync(form);
        toast({ title: "Cadastrado", description: `${form.nome} cadastrado com sucesso.` });
      }
      setFormOpen(false);
      setForm(emptyForm);
      setEditingId(null);
    } catch (err: any) {
      toast({ title: "Erro ao salvar", description: err?.message || "Tente novamente.", variant: "destructive" });
    }
  };

  const handleDelete = async (l: Loteador) => {
    try {
      await deleteMut.mutateAsync(l.id);
      toast({ title: "Excluído", description: `${l.nome} foi removido.` });
    } catch (err: any) {
      toast({ title: "Erro ao excluir", description: err?.message || "Tente novamente.", variant: "destructive" });
    }
  };

  const setField = (k: keyof LoteadorInput, v: string) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-5 flex items-center justify-between">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-accent" />
              </div>
              <div>
                <span>Loteadores / Proprietários</span>
                <p className="text-sm font-normal text-muted-foreground mt-0.5">Pessoas e empresas donas de lotes e terrenos</p>
              </div>
            </DialogTitle>
          </DialogHeader>
          <Button variant="cta" size="sm" className="gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Novo
          </Button>
        </div>

        {formOpen && (
          <div className="px-6 py-4 border-b border-border bg-muted/20 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{editingId ? "Editar cadastro" : "Novo Loteador/Proprietário"}</span>
              <Button variant="ghost" size="icon" onClick={() => { setFormOpen(false); setEditingId(null); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome / Razão Social *</Label>
                <Input placeholder="Ex: João Batista Imóveis LTDA" value={form.nome} onChange={(e) => setField("nome", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={form.tipo} onValueChange={(v) => setField("tipo", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pessoa">Pessoa Física</SelectItem>
                    <SelectItem value="empresa">Empresa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input placeholder="+595 981 000 000" value={form.telefone} onChange={(e) => setField("telefone", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp</Label>
                <Input placeholder="+595 981 000 000" value={form.whatsapp} onChange={(e) => setField("whatsapp", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Documento (CPF/CNPJ)</Label>
                <Input placeholder="000.000.000-00 / 00.000.000/0000-00" value={form.documento} onChange={(e) => setField("documento", e.target.value)} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Observações</Label>
                <Textarea placeholder="Observações sobre o proprietário/loteador…" value={form.observacoes} onChange={(e) => setField("observacoes", e.target.value)} />
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

        <div className="px-6 py-4">
          {isLoading && (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-accent" /></div>
          )}
          {!isLoading && loteadores.length === 0 && (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-3">Nenhum loteador/proprietário cadastrado.</p>
              <Button variant="cta" className="gap-2" onClick={openCreate}><Plus className="h-4 w-4" /> Cadastrar Primeiro</Button>
            </div>
          )}
          <div className="space-y-2">
            {loteadores.map((l) => (
              <div key={l.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
                <div className="min-w-0">
                  <p className="font-medium truncate">{l.nome}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {l.tipo === "empresa" ? "Empresa" : "Pessoa Física"}
                    {l.documento ? ` · ${l.documento}` : ""}
                    {(l.telefone || l.whatsapp) ? ` · ${l.whatsapp || l.telefone}` : ""}
                  </p>
                  {l.observacoes && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{l.observacoes}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="outline" size="icon" onClick={() => openEdit(l)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(l)} disabled={deleteMut.isPending}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}