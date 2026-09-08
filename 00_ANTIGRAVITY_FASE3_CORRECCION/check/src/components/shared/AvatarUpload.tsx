import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";
interface AvatarUploadProps {
  profileId: string;
  currentAvatarUrl: string | null;
  fullName: string;
  size?: "sm" | "md" | "lg";
  onUploaded?: (url: string) => void;
}
const sizeClasses = {
  sm: "h-12 w-12",
  md: "h-16 w-16",
  lg: "h-20 w-20"
};
const iconSizes = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5"
};
const badgeSizes = {
  sm: "h-6 w-6 -bottom-0.5 -right-0.5",
  md: "h-7 w-7 -bottom-0.5 -right-0.5",
  lg: "h-8 w-8 -bottom-1 -right-1"
};
export function AvatarUpload({
  profileId,
  currentAvatarUrl,
  fullName,
  size = "md",
  onUploaded
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initials = fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "Máximo 5MB para fotos de perfil.",
        variant: "destructive"
      });
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Formato inválido",
        description: "Selecione uma imagem (JPG, PNG, WebP).",
        variant: "destructive"
      });
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${profileId}/${Date.now()}.${ext}`;
      const {
        error: uploadErr
      } = await supabase.storage.from("avatars").upload(path, file, {
        upsert: true
      });
      if (uploadErr) throw uploadErr;
      const {
        data: urlData
      } = supabase.storage.from("avatars").getPublicUrl(path);
      const newUrl = urlData.publicUrl;

      // Update the profile
      const {
        error: updateErr
      } = await supabase.from("profiles").update({
        avatar_url: newUrl
      }).eq("id", profileId);
      if (updateErr) throw updateErr;
      setAvatarUrl(newUrl);
      onUploaded?.(newUrl);
      toast({
        title: "Foto atualizada!",
        description: "Sua foto de perfil foi salva com sucesso."
      });
    } catch (err: any) {
      toast({
        title: "Erro ao enviar foto",
        description: err?.message || "Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };
  return <div className="relative inline-block">
      <input ref={fileInputRef} type="file" className="hidden" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleUpload} />
      <Avatar className={sizeClasses[size]}>
        {avatarUrl ? <img src={avatarUrl} alt={fullName} className="h-full w-full object-cover rounded-full" /> : <AvatarFallback className="bg-primary text-primary-foreground text-xl">{initials}</AvatarFallback>}
      </Avatar>
      <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className={`absolute ${badgeSizes[size]} rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-md hover:bg-accent/90 transition-colors border-2 border-card`} title="Alterar foto">
        {uploading ? <Loader2 className={`${iconSizes[size]} animate-spin`} /> : <Camera className={iconSizes[size]} />}
      </button>
    </div>;
}