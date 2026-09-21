import { useState } from "react";
import { Tag, Plus, Trash2, Loader2, FolderTree, X } from "lucide-react";
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
import {
  useUserTags,
  useCreateUserTag,
  useDeleteUserTag,
  useUserTagCategories,
  useCreateUserTagCategory,
  useDeleteUserTagCategory,
  groupTagsByCategory,
  type UserTagCategory,
} from "@/hooks/use-user-tags";

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
  const { data: categories = [], isLoading: isLoadingCats } = useUserTagCategories();
  const createTag = useCreateUserTag();
  const deleteTag = useDeleteUserTag();
  const createCategory = useCreateUserTagCategory();
  const deleteCategory = useDeleteUserTagCategory();

  // states para crear CATEGORÍA
  const [catName, setCatName] = useState("");
  const [catColor, setCatColor] = useState(PRESET_COLORS[0]);

  // states para crear TAG (con categoria opcional)
  const [label, setLabel] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [categoryId, setCategoryId] = useState<string>("");

  const canCreateCategory = catName.trim().length > 0 && !createCategory.isPending;
  const canCreateTag = label.trim().length > 0 && !createTag.isPending;

  const handleCreateCategory = async () => {
    if (!canCreateCategory) return;
    try {
      await createCategory.mutateAsync({ name: catName.trim(), color: catColor });
      setCatName("");
      setCatColor(PRESET_COLORS[0]);
    } catch {
      // erro propagado pelo mutation
    }
  };

  const handleCreateTag = async () => {
    if (!canCreateTag) return;
    try {
      await createTag.mutateAsync({
        label: label.trim(),
        color,
        category_id: categoryId || null,
      });
      setLabel("");
      setColor(PRESET_COLORS[0]);
      setCategoryId("");
    } catch {
      // erro propagado pelo mutation
    }
  };

  const handleDeleteTag = async (id: string) => {
    try {
      await deleteTag.mutateAsync(id);
    } catch {
      // erro propagado pelo mutation
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory.mutateAsync(id); // ON DELETE CASCADE borra las tags
    } catch {
      // erro propagado pelo mutation
    }
  };

  const grouped = groupTagsByCategory(tags, categories);

  const ColorPicker = ({ value, onChange }: { value: string; onChange: (c: string) => void }) => (
    <div className="flex flex-wrap items-center gap-2">
      {PRESET_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={`h-7 w-7 rounded-full border-2 transition-all ${
            value === c ? "border-foreground scale-110" : "border-transparent"
          }`}
          style={{ backgroundColor: c }}
          title={c}
          aria-label={`Cor ${c}`}
        />
      ))}
      <label className="relative h-7 w-7 overflow-hidden rounded-full border-2 border-dashed border-border cursor-pointer">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        <span className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">+</span>
      </label>
    </div>
  );

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
                  Categorias e tags personalizadas (por usuário)
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Criar CATEGORIA */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <FolderTree className="h-4 w-4 text-accent" />
              <span>Nova categoria</span>
            </div>
            <div className="bg-muted/30 rounded-xl p-4 space-y-4 border border-border/50">
              <div className="space-y-2">
                <Label htmlFor="catName">Nome da categoria</Label>
                <Input
                  id="catName"
                  placeholder="Ex.: Prioridade, Tipo de cliente, Fase"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleCreateCategory();
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Cor</Label>
                <ColorPicker value={catColor} onChange={setCatColor} />
              </div>
              <Button variant="cta" onClick={handleCreateCategory} disabled={!canCreateCategory} className="w-full">
                {createCategory.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Criar categoria
                  </>
                )}
              </Button>
            </div>
          </div>

          <hr className="border-border opacity-50" />

          {/* Criar TAG (dentro de categoria opcional) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Plus className="h-4 w-4 text-accent" />
              <span>Nova tag</span>
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
                    if (e.key === "Enter") void handleCreateTag();
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Cor</Label>
                <ColorPicker value={color} onChange={setColor} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tagCategory">Categoria (opcional)</Label>
                <select
                  id="tagCategory"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="">— Sem categoria —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button variant="cta" onClick={handleCreateTag} disabled={!canCreateTag} className="w-full">
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

          {/* Lista agrupada por categoria */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Tag className="h-4 w-4 text-accent" />
              <span>Seu catálogo ({tags.length} tags)</span>
            </div>
            {isLoading || isLoadingCats ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando...
              </div>
            ) : tags.length === 0 && categories.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground italic">
                Nenhuma tag criada ainda.
              </p>
            ) : (
              <div className="space-y-4">
                {grouped.map(({ category, tags: groupTags }) => (
                  <div key={category?.id ?? "uncategorized"} className="bg-muted/30 rounded-xl p-4 border border-border/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block h-3 w-3 rounded-full"
                          style={{ backgroundColor: category?.color ?? "#94a3b8" }}
                        />
                        <span className="text-sm font-semibold">
                          {category?.name ?? "Sem categoria"}
                        </span>
                        <span className="text-xs text-muted-foreground">({groupTags.length})</span>
                      </div>
                      {category && (
                        <button
                          type="button"
                          onClick={() => void handleDeleteCategory(category.id)}
                          disabled={deleteCategory.isPending}
                          className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-destructive disabled:opacity-40"
                          title="Excluir categoria (e suas tags)"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {groupTags.map((tag) => (
                        <Badge
                          key={tag.id}
                          className="h-6 gap-1.5 pr-1 text-[11px] font-medium border"
                          style={{ backgroundColor: `${tag.color}1a`, color: tag.color, borderColor: `${tag.color}55` }}
                        >
                          {tag.label}
                          <button
                            type="button"
                            onClick={() => void handleDeleteTag(tag.id)}
                            disabled={deleteTag.isPending}
                            className="rounded-full p-0.5 transition-colors hover:bg-foreground/10 disabled:opacity-40"
                            title="Excluir tag"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}