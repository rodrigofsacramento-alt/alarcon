import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  usePropertyPortalSyncs,
  useSyncPropertyToPortal,
  useUnpublishFromPortal,
  portalLabels,
  portalStatusLabels,
} from "@/hooks/use-property-portal-sync";
import type { PortalType } from "@/hooks/use-property-portal-sync";
import type { Property } from "@/hooks/use-properties";
import { generatePropertyXml, downloadXmlFeed } from "@/lib/xml-feed";
import { Globe, Download, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const allPortals: PortalType[] = ['viva_real', 'zap_imoveis', 'olx', 'facebook_marketplace'];

interface PropertyPortalsModalProps {
  property: Property | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PropertyPortalsModal({ property, open, onOpenChange }: PropertyPortalsModalProps) {
  const { data: syncs = [], isLoading } = usePropertyPortalSyncs(property?.id);
  const syncMutation = useSyncPropertyToPortal();
  const unpublishMutation = useUnpublishFromPortal();
  const [showXml, setShowXml] = useState(false);

  const getSyncStatus = (portal: PortalType) => {
    return syncs.find(s => s.portal === portal);
  };

  const handleToggle = (portal: PortalType, checked: boolean) => {
    if (!property) return;
    if (checked) {
      syncMutation.mutate({ propertyId: property.id, portal });
    } else {
      unpublishMutation.mutate({ propertyId: property.id, portal });
    }
  };

  const handleDownloadXml = () => {
    if (!property) return;
    downloadXmlFeed([property], `imovel-${property.code || property.id}.xml`);
    toast.success("XML do imóvel baixado");
  };

  const handleCopyXml = () => {
    if (!property) return;
    const xml = generatePropertyXml(property);
    navigator.clipboard.writeText(xml).then(() => {
      toast.success("XML copiado para a área de transferência");
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-accent" />
            Publicar em Portais
          </DialogTitle>
          <DialogDescription>
            {property?.title || 'Selecione os portais para publicar este imóvel.'}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Portals list */}
            {allPortals.map((portal) => {
              const sync = getSyncStatus(portal);
              const isChecked = sync?.status === 'published' || sync?.status === 'pending';
              const status = sync ? portalStatusLabels[sync.status] : null;

              return (
                <div key={portal} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Globe className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{portalLabels[portal]}</p>
                      {status && (
                        <Badge variant="outline" className={`text-[10px] h-5 mt-0.5 ${status.color}`}>
                          {status.label}
                        </Badge>
                      )}
                      {!sync && (
                        <span className="text-xs text-muted-foreground">Não publicado</span>
                      )}
                    </div>
                  </div>
                  <Switch
                    checked={isChecked}
                    onCheckedChange={(checked) => handleToggle(portal, checked)}
                    disabled={syncMutation.isPending || unpublishMutation.isPending}
                  />
                </div>
              );
            })}

            {/* XML Actions */}
            <div className="pt-4 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                XML Feed Manual
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2 flex-1" onClick={handleDownloadXml}>
                  <Download className="h-4 w-4" />
                  Baixar XML
                </Button>
                <Button variant="outline" size="sm" className="gap-2 flex-1" onClick={() => setShowXml(!showXml)}>
                  <FileText className="h-4 w-4" />
                  {showXml ? 'Ocultar XML' : 'Ver XML'}
                </Button>
              </div>

              {showXml && property && (
                <div className="mt-3">
                  <pre className="bg-muted rounded-lg p-3 text-[10px] overflow-x-auto max-h-48 custom-scrollbar">
                    <code>{generatePropertyXml(property)}</code>
                  </pre>
                  <Button variant="ghost" size="sm" className="mt-2 gap-1 text-xs" onClick={handleCopyXml}>
                    <CheckCircle2 className="h-3 w-3" /> Copiar XML
                  </Button>
                </div>
              )}
            </div>

            {/* Note */}
            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>
                Para publicação automática via API, entre em contato com cada portal para obter credenciais de parceiro.
                O XML Feed pode ser enviado manualmente ao suporte do portal.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
