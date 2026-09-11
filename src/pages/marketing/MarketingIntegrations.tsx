import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Facebook, Instagram, MessageCircle, AlertCircle, CheckCircle2, Loader2, Trash2, ArrowRight } from "lucide-react";
import { useWhatsAppSession } from "@/hooks/use-whatsapp";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useSocialIntegrations, useCreateSocialIntegration, useDeleteSocialIntegration } from "@/hooks/use-social-integrations";
import { toast } from "sonner";

export default function MarketingIntegrations() {
  const navigate = useNavigate();
  const { data: integrations = [], isLoading } = useSocialIntegrations();
  const { data: waSession, isLoading: waLoading } = useWhatsAppSession();
  const createMutation = useCreateSocialIntegration();
  const deleteMutation = useDeleteSocialIntegration();

  const [platform, setPlatform] = useState<"facebook" | "instagram">("facebook");
  const [accessToken, setAccessToken] = useState("");
  const [accountName, setAccountName] = useState("");
  const [pageId, setPageId] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const fbIntegration = integrations.find(i => i.platform === "facebook");
  const instaIntegration = integrations.find(i => i.platform === "instagram");

  const handleConnect = () => {
    if (!accessToken.trim()) return toast.error("Token de acesso é obrigatório.");
    createMutation.mutate(
      {
        platform,
        access_token: accessToken,
        account_name: accountName || null,
        page_id: pageId || null,
        status: "active",
      },
      {
        onSuccess: () => {
          toast.success(`${platform === "facebook" ? "Facebook" : "Instagram"} conectado com sucesso!`);
          setAccessToken("");
          setAccountName("");
          setPageId("");
        },
      }
    );
  };

  const handleDisconnect = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget, {
      onSuccess: () => {
        toast.success("Integração removida.");
        setDeleteTarget(null);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Configuração Necessária</AlertTitle>
        <AlertDescription>
          Para publicar automaticamente, conecte suas contas usando um Token de Acesso da Meta.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6">
        {/* Facebook */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Facebook className="h-8 w-8 text-blue-600" />
            <div>
              <CardTitle>Página do Facebook</CardTitle>
              <CardDescription>Publique diretamente na página da sua imobiliária.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {fbIntegration ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-600 font-medium">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>{fbIntegration.account_name || "Página Conectada"}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(fbIntegration.id)}>
                  <Trash2 className="h-4 w-4 mr-1" /> Desconectar
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input placeholder="Nome da conta/página" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
                  <Input placeholder="Page ID (opcional)" value={pageId} onChange={(e) => setPageId(e.target.value)} />
                </div>
                <div className="flex items-center gap-4">
                  <Input
                    type="password"
                    placeholder="Cole seu User Access Token aqui"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                  />
                  <Button onClick={() => { setPlatform("facebook"); handleConnect(); }} disabled={createMutation.isPending || !accessToken}>
                    {createMutation.isPending && platform === "facebook" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Conectar"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instagram */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Instagram className="h-8 w-8 text-pink-600" />
            <div>
              <CardTitle>Instagram Profissional</CardTitle>
              <CardDescription>Agende postagens e acompanhe o engajamento.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {instaIntegration ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-600 font-medium">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>{instaIntegration.account_name || "Conta Conectada"}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(instaIntegration.id)}>
                  <Trash2 className="h-4 w-4 mr-1" /> Desconectar
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input placeholder="Nome da conta" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
                  <Input placeholder="Page ID (opcional)" value={pageId} onChange={(e) => setPageId(e.target.value)} />
                </div>
                <div className="flex items-center gap-4">
                  <Input
                    type="password"
                    placeholder="Cole seu User Access Token aqui"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                  />
                  <Button onClick={() => { setPlatform("instagram"); handleConnect(); }} disabled={createMutation.isPending || !accessToken}>
                    {createMutation.isPending && platform === "instagram" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Conectar"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* WhatsApp */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <MessageCircle className="h-8 w-8 text-emerald-500" />
            <div>
              <CardTitle>WhatsApp Business</CardTitle>
              <CardDescription>Atenda clientes via WhatsApp diretamente no sistema.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {waLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Verificando status...
              </div>
            ) : waSession?.status === 'connected' ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-600 font-medium">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>{waSession.phone_number || "Conectado"}</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/atendimento')}>
                  Abrir Atendimento <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertCircle className="h-5 w-5" />
                  <span>Desconectado</span>
                </div>
                <Button size="sm" onClick={() => navigate('/atendimento')}>
                  Conectar WhatsApp <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Desconectar integração"
        description="Tem certeza que deseja desconectar esta integração? Você precisará reconectar para publicar novamente."
        confirmLabel="Desconectar"
        cancelLabel="Cancelar"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDisconnect}
      />
    </div>
  );
}
