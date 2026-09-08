import { useState, useRef } from "react";
import { Upload, X, Loader2, ImagePlus, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useImageUpload } from "@/hooks/use-image-upload";
import { toast } from "@/hooks/use-toast";
interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  propertyId?: string;
}
export function ImageUploader({
  images,
  onImagesChange,
  maxImages = 10,
  propertyId
}: ImageUploaderProps) {
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    uploadMultipleImages,
    uploading,
    progress
  } = useImageUpload();
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const remaining = maxImages - images.length;
    if (remaining <= 0) {
      toast({
        title: "Limite atingido",
        description: `Máximo de ${maxImages} imagens.`,
        variant: "destructive"
      });
      return;
    }
    const selectedFiles = Array.from(files).slice(0, remaining);

    // Validate file sizes (max 10MB each)
    const oversized = selectedFiles.filter(f => f.size > 10 * 1024 * 1024);
    if (oversized.length > 0) {
      toast({
        title: "Arquivo muito grande",
        description: "Cada imagem deve ter no máximo 10MB.",
        variant: "destructive"
      });
      return;
    }
    try {
      const urls = await uploadMultipleImages(selectedFiles, propertyId);
      onImagesChange([...images, ...urls]);
      toast({
        title: "Upload concluído",
        description: `${urls.length} imagem(ns) enviada(s).`
      });
    } catch (err: any) {
      toast({
        title: "Erro no upload",
        description: err?.message || "Tente novamente.",
        variant: "destructive"
      });
    }

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const handleAddUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    if (images.length >= maxImages) {
      toast({
        title: "Limite atingido",
        description: `Máximo de ${maxImages} imagens.`,
        variant: "destructive"
      });
      return;
    }
    onImagesChange([...images, url]);
    setUrlInput("");
    setShowUrlInput(false);
  };
  const handleRemoveImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };
  return <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Imagens do Imóvel</Label>
        <span className="text-xs text-muted-foreground">{images.length}/{maxImages}</span>
      </div>

      {/* Image Grid */}
      {images.length > 0 && <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((img, i) => <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
              <img src={img} alt={`Imagem ${i + 1}`} className="w-full h-full object-cover" />
              <button type="button" onClick={() => handleRemoveImage(i)} className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="h-3.5 w-3.5" />
              </button>
              {i === 0 && <span className="absolute bottom-1 left-1 text-[10px] bg-accent text-accent-foreground px-1.5 py-0.5 rounded font-medium">
                  Principal
                </span>}
            </div>)}
        </div>}

      {/* Upload Area */}
      {images.length < maxImages && <div onClick={() => !uploading && fileInputRef.current?.click()} className={cn("border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors", uploading ? "border-accent/50 bg-accent/5" : "border-border hover:border-accent/50 hover:bg-accent/5")}>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="hidden" onChange={handleFileSelect} />
          {uploading ? <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 text-accent animate-spin" />
              <p className="text-sm text-muted-foreground">Enviando... {progress}%</p>
              <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full transition-all" style={{
            width: `${progress}%`
          }} />
              </div>
            </div> : <div className="flex flex-col items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Upload className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Clique para enviar imagens</p>
                <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG, WebP ou GIF (máx. 10MB cada)</p>
              </div>
            </div>}
        </div>}

      {/* URL Input Toggle */}
      <div className="flex gap-2">
        {!showUrlInput ? <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => setShowUrlInput(true)}>
            <Link2 className="h-3.5 w-3.5" />
            Adicionar por URL
          </Button> : <div className="flex gap-2 w-full">
            <Input placeholder="https://..." value={urlInput} onChange={e => setUrlInput(e.target.value)} onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleAddUrl();
          }
        }} className="flex-1" />
            <Button type="button" variant="cta" size="sm" onClick={handleAddUrl} disabled={!urlInput.trim()}>
              <ImagePlus className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => {
          setShowUrlInput(false);
          setUrlInput("");
        }}>
              <X className="h-4 w-4" />
            </Button>
          </div>}
      </div>
    </div>;
}