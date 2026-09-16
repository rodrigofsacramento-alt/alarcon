import { useState } from "react";
import { Tag, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUserTags, useCreateUserTag, useDeleteUserTag } from "@/hooks/use-user-tags";

interface TagsManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PRESET_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

export function TagsManager({ open, onOpenChange }: TagsManagerProps) {
  const { data: tags = [], isLoading } = useUserTags();
  const createTag = useCreateUserTag();
  const deleteTag = useDeleteUserTag();

  const [label, setLabel] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);

  const canCreate = label.trim().length > 0 && !createTag.isPending;

  const handleCreate = async () => {
    if (!canCreate) return;
    try {
      await createTag.mutateAsync({ label: label.trim(), color });
      setLabel("");
      setColor(PRESET_COLORS[0]);
    } catch {
      // erro propagado pelo mutation
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTag.mutateAsync(id);
    } catch {
      // erro propagado pelo mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-5">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Tag className="h-5 w-5 text-accent" />
              </div>
              <div>
                <span>Suas Tags</span>
                <p className="text-sm font-normal text-muted-foreground mt-0.5">
                  Catálogo de tags personalizadas
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Criar tag */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Plus className="h-4 w-4 text-accent" />
              <span>Criar nova tag</span>
            </div>
            <div className="bg-muted/30 rounded-xl p-4 space-y-4 border border-border/50">
              <div className="space-y-2">
                <Label htmlFor="tagLabel">Nome da tag</Label>
                <Input
                  id="tagLabel"
                  placeholder="Ex.: Cliente VIP"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleCreate();
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="flex flex-wrap items-center gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`h-7 w-7 rounded-full border-2 transition-all ${
                        color === c ? "border-foreground scale-110" : "border-transparent"
                      }`}
                      style={{ backgroundColor: c }}
                      title={c}
                      aria-label={`Cor ${c}`}
                    />
                  ))}
                  <label className="relative h-7 w-7 overflow-hidden rounded-full border-2 border-dashed border-border cursor-pointer">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    />
                    <span className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                      +
                    </span>
                  </label>
                </div>
              </div>
              <Button variant="cta" onClick={handleCreate} disabled={!canCreate} className="w-full">
                {createTag.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Adicionar tag
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Lista */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Tag className="h-4 w-4 text-accent" />
              <span>Tags do catálogo ({tags.length})</span>
            </div>
            <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Carregando...
                </div>
              ) : tags.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground italic">
                  Nenhuma tag criada ainda.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      className="h-6 gap-1.5 pr-1 text-[11px] font-medium border"
                      style={{ backgroundColor: `${tag.color}1a`, color: tag.color, borderColor: `${tag.color}55` }}
                    >
                      {tag.label}
                      <button
                        type="button"
                        onClick={() => void handleDelete(tag.id)}
                        disabled={deleteTag.isPending}
                        className="rounded-full p-0.5 transition-colors hover:bg-foreground/10 disabled:opacity-40"
                        title="Excluir tag"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}