import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, Image as ImageIcon, Video, Trash2, MoreHorizontal, Download, Edit2, Share2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useMarketingAssets, useUploadMarketingAsset, useDeleteMarketingAsset, useUpdateMarketingAsset, MarketingAsset } from "@/hooks/use-marketing-assets";

const CATEGORIES = ["Institucional", "Imóvel", "Redes Sociais", "Outro"];

export default function MarketingAssets() {
  const { data: assets = [], isLoading } = useMarketingAssets();
  const uploadMutation = useUploadMarketingAsset();
  const deleteMutation = useDeleteMarketingAsset();
  const updateMutation = useUpdateMarketingAsset();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Forms state
  const [fileName, setFileName] = useState("");
  const [fileCategory, setFileCategory] = useState("Redes Sociais");
  const [editingAsset, setEditingAsset] = useState<MarketingAsset | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MarketingAsset | null>(null);

  // --- Upload Flow ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
      setIsUploadModalOpen(true);
    }
    // Reset the input so the same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleConfirmUpload = () => {
    if (!selectedFile) return;
    
    uploadMutation.mutate(
      { file: selectedFile, name: fileName, category: fileCategory },
      {
        onSuccess: () => {
          setIsUploadModalOpen(false);
          setSelectedFile(null);
        }
      }
    );
  };

  // --- Edit Flow ---
  const openEditModal = (asset: MarketingAsset) => {
    setEditingAsset(asset);
    setFileName(asset.file_name);
    setFileCategory(asset.category || "Outro");
    setIsEditModalOpen(true);
  };

  const handleConfirmEdit = () => {
    if (!editingAsset) return;
    updateMutation.mutate(
      { id: editingAsset.id, name: fileName, category: fileCategory },
      {
        onSuccess: () => setIsEditModalOpen(false)
      }
    );
  };

  // --- Actions ---
  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget, {
      onSuccess: () => {
        toast.success("Mídia removida.");
        setDeleteTarget(null);
      },
    });
  };

  const handleDownload = async (asset: MarketingAsset) => {
    try {
      const response = await fetch(asset.publicUrl || '');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = asset.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      toast.error("Erro ao baixar o arquivo.");
    }
  };

  const getCategoryColor = (cat: string) => {
    switch(cat) {
      case 'Institucional': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Imóvel': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Redes Sociais': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Biblioteca de Mídias</h3>
          <p className="text-sm text-muted-foreground">Gerencie imagens e vídeos para suas postagens.</p>
        </div>
        <div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*,video/*"
            onChange={handleFileSelect}
          />
          <Button variant="cta" onClick={() => fileInputRef.current?.click()}>
            <UploadCloud className="mr-2 h-4 w-4" />
            Fazer Upload
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-accent mb-4" />
          <p className="text-muted-foreground text-sm">Carregando mídias...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {assets.map((asset) => (
              <Card key={asset.id} className="overflow-hidden group flex flex-col">
                <CardContent className="p-0 relative flex-1">
                  <div className="aspect-square bg-muted flex items-center justify-center w-full">
                    {asset.file_type === "image" ? (
                      <img src={asset.publicUrl || ''} alt={asset.file_name} className="object-cover w-full h-full" />
                    ) : (
                      <div className="flex flex-col items-center text-muted-foreground">
                        <Video className="h-8 w-8 mb-2" />
                        <span className="text-xs">Vídeo</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="absolute top-2 left-2">
                    <Badge variant="outline" className={`text-[10px] uppercase shadow-sm ${getCategoryColor(asset.category)}`}>
                      {asset.category || "Outro"}
                    </Badge>
                  </div>

                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="h-8 w-8 shadow-sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => handleDownload(asset)}>
                          <Download className="mr-2 h-4 w-4" />
                          <span>Baixar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          navigator.clipboard.writeText(asset.publicUrl || '');
                          toast.success("Link copiado!");
                        }}>
                          <Share2 className="mr-2 h-4 w-4" />
                          <span>Copiar Link</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditModal(asset)}>
                          <Edit2 className="mr-2 h-4 w-4" />
                          <span>Editar Informações</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteTarget(asset)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Apagar Mídia</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
                <div className="p-3 border-t bg-card">
                  <p className="truncate text-sm font-medium" title={asset.file_name}>
                    {asset.file_name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {(asset.file_size / 1024 / 1024).toFixed(2)} MB • {new Date(asset.created_at).toLocaleDateString()}
                  </p>
                </div>
              </Card>
            ))}
          </div>
          
          {assets.length === 0 && (
            <div className="text-center py-16 border-2 border-dashed rounded-lg bg-card/50">
              <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Nenhuma mídia encontrada</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                Faça upload de imagens ou vídeos institucionais, de imóveis ou para suas redes sociais.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => fileInputRef.current?.click()}>
                Selecionar Arquivo
              </Button>
            </div>
          )}
        </>
      )}

      {/* Modal de Upload */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Detalhes da Mídia</DialogTitle>
            <DialogDescription>
              Confirme o nome e selecione a categoria correta para organizar sua biblioteca.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="filename">Nome do Arquivo</Label>
              <Input
                id="filename"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={fileCategory} onValueChange={setFileCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadModalOpen(false)} disabled={uploadMutation.isPending}>
              Cancelar
            </Button>
            <Button variant="cta" onClick={handleConfirmUpload} disabled={uploadMutation.isPending || !fileName}>
              {uploadMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
              ) : (
                "Concluir Upload"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Informações</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-filename">Nome do Arquivo</Label>
              <Input
                id="edit-filename"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Categoria</Label>
              <Select value={fileCategory} onValueChange={setFileCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={updateMutation.isPending}>
              Cancelar
            </Button>
            <Button variant="cta" onClick={handleConfirmEdit} disabled={updateMutation.isPending || !fileName}>
              {updateMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Atualizando...</>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Apagar mídia"
        description={deleteTarget ? `Tem certeza que deseja apagar "${deleteTarget.file_name}"? Esta ação não pode ser desfeita.` : ''}
        confirmLabel="Apagar"
        cancelLabel="Cancelar"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
