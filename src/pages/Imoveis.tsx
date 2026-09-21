import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { useProperties, useCreateProperty, useDeleteProperty } from "@/hooks/use-properties";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { PropertyDetailModal } from "@/components/imoveis/PropertyDetailModal";
import { CreatePropertyModal, type PropertyFormData } from "@/components/imoveis/CreatePropertyModal";
import { PropertyPortalsModal } from "@/components/imoveis/PropertyPortalsModal";
import { downloadXmlFeed } from "@/lib/xml-feed";
import {
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  MapPin,
  Bed,
  Bath,
  Square,
  Car,
  Heart,
  MoreVertical,
  Loader2,
  Pencil,
  Trash2,
  Eye,
  AlertTriangle,
  Globe,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Property } from "@/hooks/use-properties";

const formatPrice = (price: number, type?: string | null): string => {
  return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
};

const formatPricingValue = (amount: number|null, currency?: string | null, priceType?: string | null): string => {
  const moeda = currency || 'USD';
  const val = (amount ?? 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 });
  switch (priceType) {
    case 'MONTHLY': return `A partir de ${val} ${moeda} mensais`;
    case 'DOWN_PAYMENT': return `Entrada de ${val} ${moeda}`;
    case 'FINAL':
    default: return `Valor Final ${val} ${moeda}`;
  }
};

const defaultImages: Record<string, string> = {
  residential: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop",
  commercial: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop",
  land: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop",
};

const tabs = ["Todos", "Residencial", "Comercial", "Terrenos"];

export default function Imoveis() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Todos");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPortalsOpen, setIsPortalsOpen] = useState(false);
  const [portalsProperty, setPortalsProperty] = useState<Property | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null);

  const { user } = useAuth();
  const location = useLocation();
  const { data: properties = [], isLoading } = useProperties({ type: activeTab });
  const createPropertyMutation = useCreateProperty();
  const deletePropertyMutation = useDeleteProperty();

  // Deeplink: autoabre el inmueble al llegar /imoveis?property={id} o state.selectedPropertyId
  useEffect(() => {
    if (isLoading) return;
    const qs = new URLSearchParams(location.search);
    const fromQuery = qs.get("property");
    const state = location.state as { selectedPropertyId?: string } | null;
    const targetId = fromQuery || state?.selectedPropertyId;
    if (targetId) {
      const prop = properties.find((p) => p.id === targetId);
      if (prop) {
        setSelectedProperty(prop);
        setIsDetailOpen(true);
      }
      // limpa a query para nao reabrir a cada navigate
      if (fromQuery) {
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, [location.search, location.state, properties, isLoading]);

  const handleRequestDelete = (property: Property, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTarget(property);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePropertyMutation.mutateAsync(deleteTarget.id);
      toast({ title: "Imóvel excluído", description: `${deleteTarget.title} foi removido com sucesso.` });
    } catch (err: any) {
      toast({ title: "Erro ao excluir", description: err?.message || "Tente novamente.", variant: "destructive" });
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleOpenDetail = (property: Property) => {
    setSelectedProperty(property);
    setIsDetailOpen(true);
  };

  const handleCreateProperty = (formData: PropertyFormData) => {
    const autoCode = formData.code?.trim() || `IMV-${Date.now().toString(36).toUpperCase()}`;
    createPropertyMutation.mutate(
      {
        title: formData.title,
        code: autoCode,
        type: formData.type,
        status: formData.status,
        price: parseFloat(String(formData.price).replace(/\./g,"").replace(",",".")) || 0,
        price_type: (formData.price_type || "FINAL").toUpperCase(),
        currency: formData.currency || "USD",
        amount: formData.amount ? parseFloat(String(formData.amount).replace(/\./g,"").replace(",",".")) : (parseFloat(String(formData.price).replace(/\./g,"").replace(",",".")) || 0),
        maps_link: formData.maps_link || null,
        address: formData.address || null,
        location: formData.location || '',
        description: formData.description || null,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        parking: formData.parking ? parseInt(formData.parking) : null,
        area: formData.area || null,
        rooms: formData.rooms ? parseInt(formData.rooms) : null,
        owner_name: formData.owner_name || null,
        owner_phone: formData.owner_phone || null,
        image_url: formData.image_url || (formData.images?.[0]) || null,
        images: formData.images?.length ? formData.images : null,
        created_by: user?.id,
      },
      {
        onSuccess: () => {
          toast({ title: "Imóvel Cadastrado", description: `${formData.title} (${autoCode}) cadastrado com sucesso.` });
        },
        onError: (err: any) => {
          toast({ title: "Erro ao cadastrar imóvel", description: err?.message || "Verifique os dados e tente novamente.", variant: "destructive" });
        },
      }
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-accent text-accent-foreground">DISPONÍVEL</Badge>;
      case "reserved":
        return <Badge className="bg-primary text-primary-foreground">RESERVADO</Badge>;
      case "sold":
        return <Badge className="bg-muted text-muted-foreground">VENDIDO</Badge>;
      case "rented":
        return <Badge className="bg-success text-success-foreground">ALUGADO</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        activeModule="imoveis"
        onModuleChange={() => {}}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />
      <MobileSidebar
        activeModule="imoveis"
        onModuleChange={() => {}}
        open={mobileOpen}
        onOpenChange={setMobileOpen}
      />

      <div
        className={cn(
          "transition-all duration-300",
          sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-64"
        )}
      >
        <Header
          title="Gestão de Imóveis"
          subtitle="Catálogo completo de propriedades disponíveis"
          actionButton={
            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-2" onClick={() => downloadXmlFeed(properties)}>
                <FileText className="h-4 w-4" />
                XML Feed
              </Button>
              <Button variant="cta" className="gap-2" onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4" />
                Novo Imóvel
              </Button>
            </div>
          }
          onMobileMenuClick={() => setMobileOpen(true)}
        />

        <main className="p-4 lg:p-6">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              {tabs.map((tab) => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab(tab)}
                  className={activeTab === tab ? "bg-foreground text-background" : ""}
                >
                  {tab}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtros Avançados
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                Ordenar: Mais Recentes
              </Button>
              <div className="flex border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-2 transition-colors",
                    viewMode === "grid" ? "bg-muted" : "hover:bg-muted/50"
                  )}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-2 transition-colors",
                    viewMode === "list" ? "bg-muted" : "hover:bg-muted/50"
                  )}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Properties Grid */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
            </div>
          )}
          {!isLoading && properties.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-3">Nenhum imóvel cadastrado.</p>
              <Button variant="cta" className="gap-2" onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4" /> Cadastrar Primeiro Imóvel
              </Button>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map((property) => (
              <div
                key={property.id}
                className="bg-card rounded-xl shadow-sm overflow-hidden group hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleOpenDetail(property)}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={property.image_url || defaultImages[property.type] || defaultImages.residential}
                    alt={property.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    {getStatusBadge(property.status)}
                  </div>
                  {/* Actions Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="absolute top-3 right-3 p-2 rounded-full bg-card/80 hover:bg-card transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4 text-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleOpenDetail(property); }}>
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleOpenDetail(property); }}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setPortalsProperty(property);
                          setIsPortalsOpen(true);
                        }}
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        Publicar em Portais
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={(e) => handleRequestDelete(property, e)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {/* Price */}
                  <div className="absolute bottom-3 left-3">
                    <span className="text-lg font-bold text-white drop-shadow-lg">
                      {formatPricingValue(property.amount ?? property.price, property.currency, property.price_type)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-foreground truncate">{property.title}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {property.address || property.location}
                  </p>

                  {/* Description */}
                  {property.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-3 leading-relaxed">
                      {property.description}
                    </p>
                  )}

                  {/* Specs */}
                  <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                    {property.bedrooms != null && property.bedrooms > 0 && (
                      <div className="flex items-center gap-1">
                        <Bed className="h-4 w-4" />
                        <span>{property.bedrooms}</span>
                        <span className="text-xs">Quartos</span>
                      </div>
                    )}
                    {property.rooms != null && property.rooms > 0 && (
                      <div className="flex items-center gap-1">
                        <Square className="h-4 w-4" />
                        <span>{property.rooms}</span>
                        <span className="text-xs">Salas</span>
                      </div>
                    )}
                    {property.bathrooms != null && property.bathrooms > 0 && (
                      <div className="flex items-center gap-1">
                        <Bath className="h-4 w-4" />
                        <span>{property.bathrooms}</span>
                        <span className="text-xs">Banheiros</span>
                      </div>
                    )}
                    {property.parking != null && property.parking > 0 && (
                      <div className="flex items-center gap-1">
                        <Car className="h-4 w-4" />
                        <span>{property.parking}</span>
                        <span className="text-xs">Vagas</span>
                      </div>
                    )}
                    {property.area && (
                      <div className="flex items-center gap-1">
                        <Square className="h-4 w-4" />
                        <span>{property.area}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={(e) => { e.stopPropagation(); handleOpenDetail(property); }}>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
                    <Button variant="outline" size="icon" onClick={(e) => { e.stopPropagation(); handleOpenDetail(property); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="text-destructive hover:bg-destructive/10" onClick={(e) => handleRequestDelete(property, e)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Property Detail Modal */}
      <PropertyDetailModal
        property={selectedProperty}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />

      {/* Create Property Modal */}
      <CreatePropertyModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onConfirm={handleCreateProperty}
      />

      {/* Portals Modal */}
      <PropertyPortalsModal
        property={portalsProperty}
        open={isPortalsOpen}
        onOpenChange={setIsPortalsOpen}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-center">Excluir Imóvel</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Tem certeza que deseja excluir <strong className="text-foreground">"{deleteTarget?.title}"</strong>?
              <br />
              <span className="text-xs text-muted-foreground mt-1 block">Esta ação não pode ser desfeita. Todas as informações do imóvel serão removidas permanentemente.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-3 sm:justify-center">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
              onClick={handleConfirmDelete}
              disabled={deletePropertyMutation.isPending}
            >
              {deletePropertyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Excluir Imóvel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
