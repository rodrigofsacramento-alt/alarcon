import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, ImageIcon, Send, Facebook, Instagram, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useMarketingPosts, useCreateMarketingPost, useDeleteMarketingPost } from "@/hooks/use-marketing-posts";
import { useMarketingAssets } from "@/hooks/use-marketing-assets";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusLabels: Record<string, { label: string; color: string }> = {
  published: { label: "Publicado", color: "bg-green-500 hover:bg-green-600" },
  scheduled: { label: "Agendado", color: "bg-amber-500 hover:bg-amber-600" },
  draft: { label: "Rascunho", color: "bg-slate-500 hover:bg-slate-600" },
};

export default function MarketingPosts() {
  const [isDrafting, setIsDrafting] = useState(false);
  const [content, setContent] = useState("");
  const [platform, setPlatform] = useState<"instagram" | "facebook">("instagram");
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data: posts = [], isLoading } = useMarketingPosts();
  const { data: assets = [] } = useMarketingAssets();
  const createMutation = useCreateMarketingPost();
  const deleteMutation = useDeleteMarketingPost();

  const handlePublish = () => {
    if (!content.trim()) return toast.error("Escreva uma legenda para publicar.");
    createMutation.mutate(
      {
        content,
        platform,
        status: "published",
        asset_id: selectedAssetId,
        published_at: new Date().toISOString(),
      },
      {
        onSuccess: () => {
          toast.success("Postagem publicada com sucesso!");
          setIsDrafting(false);
          setContent("");
          setSelectedAssetId(null);
        },
      }
    );
  };

  const handleSchedule = () => {
    if (!content.trim()) return toast.error("Escreva uma legenda para agendar.");
    createMutation.mutate(
      {
        content,
        platform,
        status: "scheduled",
        asset_id: selectedAssetId,
      },
      {
        onSuccess: () => {
          toast.success("Postagem agendada com sucesso!");
          setIsDrafting(false);
          setContent("");
          setSelectedAssetId(null);
        },
      }
    );
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget, {
      onSuccess: () => {
        toast.success("Postagem removida.");
        setDeleteTarget(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Postagens</h3>
          <p className="text-sm text-muted-foreground">Crie e gerencie as publicações nas redes sociais.</p>
        </div>
        <Button variant="cta" onClick={() => setIsDrafting(!isDrafting)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Postagem
        </Button>
      </div>

      {isDrafting && (
        <Card className="border-primary/50 shadow-md">
          <CardHeader>
            <CardTitle className="text-base">Criar Nova Publicação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea 
              placeholder="Escreva a legenda atrativa do seu imóvel..." 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px]"
            />
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Selecionar Mídia</p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {assets.map((asset) => (
                  <button
                    key={asset.id}
                    onClick={() => setSelectedAssetId(asset.id === selectedAssetId ? null : asset.id)}
                    className={`relative shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      asset.id === selectedAssetId ? "border-accent ring-2 ring-accent/20" : "border-border"
                    }`}
                  >
                    {asset.file_type === "image" ? (
                      <img src={asset.publicUrl || ""} alt="" className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center text-[10px]">Vídeo</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <span className="text-sm font-medium">Publicar em:</span>
              <div className="flex gap-2">
                <Badge 
                  variant={platform === "instagram" ? "default" : "outline"} 
                  className="cursor-pointer flex items-center gap-1"
                  onClick={() => setPlatform("instagram")}
                >
                  <Instagram className="h-3 w-3" /> Instagram
                </Badge>
                <Badge 
                  variant={platform === "facebook" ? "default" : "outline"} 
                  className="cursor-pointer flex items-center gap-1"
                  onClick={() => setPlatform("facebook")}
                >
                  <Facebook className="h-3 w-3" /> Facebook
                </Badge>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsDrafting(false)}>Cancelar</Button>
              <Button variant="outline" onClick={handleSchedule} disabled={createMutation.isPending}>
                <Calendar className="mr-2 h-4 w-4" />
                Agendar
              </Button>
              <Button variant="cta" onClick={handlePublish} disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Publicar Agora
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista real de posts */}
      <div className="space-y-4">
        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
          Histórico Recente ({posts.length})
        </h4>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Nenhuma postagem ainda</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Crie sua primeira postagem para aparecer aqui.
            </p>
          </div>
        ) : (
          posts.map((post) => {
            const status = statusLabels[post.status] || statusLabels.draft;
            const isInstagram = post.platform === "instagram";
            return (
              <Card key={post.id}>
                <CardContent className="p-4 flex items-start gap-4">
                  {post.asset?.file_type === "image" ? (
                    <div className="h-20 w-20 bg-muted rounded-md shrink-0 flex items-center justify-center overflow-hidden">
                      <img src={post.asset.publicUrl || ""} alt="" className="object-cover w-full h-full" />
                    </div>
                  ) : (
                    <div className="h-20 w-20 bg-muted rounded-md shrink-0 flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex gap-2">
                        <Badge className={status.color}>{status.label}</Badge>
                        <Badge variant="outline" className={isInstagram ? "text-pink-600 border-pink-200 bg-pink-50" : "text-blue-600 border-blue-200 bg-blue-50"}>
                          {isInstagram ? <Instagram className="h-3 w-3 mr-1" /> : <Facebook className="h-3 w-3 mr-1" />}
                          {isInstagram ? "Instagram" : "Facebook"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {post.created_at ? format(new Date(post.created_at), "dd/MM/yy HH:mm", { locale: ptBR }) : "—"}
                        </span>
                        <button
                          onClick={() => setDeleteTarget(post.id)}
                          className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm line-clamp-2 mt-2">{post.content}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>👁 {post.metrics_reach || 0} alcance</span>
                      <span>❤️ {post.metrics_engagement || 0} engajamento</span>
                      <span>� {post.metrics_clicks || 0} cliques</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Remover postagem"
        description="Tem certeza que deseja remover esta postagem? Esta ação não pode ser desfeita."
        confirmLabel="Remover"
        cancelLabel="Cancelar"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
