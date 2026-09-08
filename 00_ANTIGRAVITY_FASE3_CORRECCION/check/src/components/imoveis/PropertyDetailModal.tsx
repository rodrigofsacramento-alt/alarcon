import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Bed, Bath, Car, Square, ExternalLink, ChevronLeft, ChevronRight, Pencil, Trash2, Loader2, X, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUpdateProperty, useDeleteProperty } from "@/hooks/use-properties";
import { toast } from "@/hooks/use-toast";
import { ImageUploader } from "@/components/imoveis/ImageUploader";
import type { Property } from "@/hooks/use-properties";
const formatPrice = (price: number, type?: string | null): string => {
  return price.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0
  });
};
const defaultImages: Record<string, string> = {
  residential: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=500&fit=crop",
  commercial: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=500&fit=crop",
  land: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=500&fit=crop"
};
interface PropertyDetailModalProps {
  property: Property | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export function PropertyDetailModal({
  property,
  open,
  onOpenChange
}: PropertyDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const updateProperty = useUpdateProperty();
  const deleteProperty = useDeleteProperty();
  if (!property) return null;

  // Build images array from images column + image_url fallback
  const allImages: string[] = [];
  if (property.images && Array.isArray(property.images) && property.images.length > 0) {
    allImages.push(...(property.images as string[]));
  }
  if (property.image_url && !allImages.includes(property.image_url)) {
    allImages.unshift(property.image_url);
  }
  if (allImages.length === 0) {
    allImages.push(defaultImages[property.type] || defaultImages.residential);
  }
  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => prev === 0 ? allImages.length - 1 : prev - 1);
  };
  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => prev === allImages.length - 1 ? 0 : prev + 1);
  };
  const startEditing = () => {
    setEditForm({
      title: property.title,
      description: property.description || "",
      price: String(property.price),
      price_type: property.price_type || "sale",
      status: property.status,
      type: property.type,
      address: property.address || "",
      location: property.location || "",
      bedrooms: property.bedrooms != null ? String(property.bedrooms) : "",
      bathrooms: property.bathrooms != null ? String(property.bathrooms) : "",
      parking: property.parking != null ? String(property.parking) : "",
      area: property.area || "",
      rooms: property.rooms != null ? String(property.rooms) : "",
      owner_name: property.owner_name || "",
      owner_phone: property.owner_phone || "",
      image_url: property.image_url || "",
      images: property.images as string[] || []
    });
    setIsEditing(true);
  };
  const handleSaveEdit = async () => {
    try {
      await updateProperty.mutateAsync({
        id: property.id,
        title: editForm.title,
        description: editForm.description || null,
        price: parseFloat(editForm.price) || property.price,
        price_type: editForm.price_type || null,
        status: editForm.status,
        type: editForm.type,
        address: editForm.address || null,
        location: editForm.location || property.location,
        bedrooms: editForm.bedrooms ? parseInt(editForm.bedrooms) : null,
        bathrooms: editForm.bathrooms ? parseInt(editForm.bathrooms) : null,
        parking: editForm.parking ? parseInt(editForm.parking) : null,
        area: editForm.area || null,
        rooms: editForm.rooms ? parseInt(editForm.rooms) : null,
        owner_name: editForm.owner_name || null,
        owner_phone: editForm.owner_phone || null,
        image_url: editForm.image_url || editForm.images?.[0] || null,
        images: editForm.images?.length ? editForm.images : null
      });
      toast({
        title: "Imóvel atualizado!",
        description: `${editForm.title} foi salvo com sucesso.`
      });
      setIsEditing(false);
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: "Erro ao atualizar",
        description: err?.message || "Tente novamente.",
        variant: "destructive"
      });
    }
  };
  const handleDelete = async () => {
    try {
      await deleteProperty.mutateAsync(property.id);
      toast({
        title: "Imóvel excluído",
        description: `${property.title} foi removido.`
      });
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: "Erro ao excluir",
        description: err?.message || "Tente novamente.",
        variant: "destructive"
      });
    }
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
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "residential":
        return "Residencial";
      case "commercial":
        return "Comercial";
      case "land":
        return "Terreno";
      default:
        return type;
    }
  };
  const mapsUrl = property.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.address)}` : null;

  // ─── EDIT MODE ───
  if (isEditing) {
    return <Dialog open={open} onOpenChange={v => {
      if (!v) setIsEditing(false);
      onOpenChange(v);
    }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
          <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Pencil className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-semibold text-foreground">Editar Imóvel</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}><X className="h-4 w-4" /></Button>
          </div>

          <div className="px-6 py-5 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input value={editForm.title} onChange={e => setEditForm(f => ({
                ...f,
                title: e.target.value
              }))} />
              </div>
              <div className="space-y-2">
                <Label>Preço *</Label>
                <Input value={editForm.price} onChange={e => setEditForm(f => ({
                ...f,
                price: e.target.value
              }))} />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={editForm.type} onValueChange={v => setEditForm(f => ({
                ...f,
                type: v
              }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">Residencial</SelectItem>
                    <SelectItem value="commercial">Comercial</SelectItem>
                    <SelectItem value="land">Terreno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editForm.status} onValueChange={v => setEditForm(f => ({
                ...f,
                status: v
              }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Disponível</SelectItem>
                    <SelectItem value="reserved">Reservado</SelectItem>
                    <SelectItem value="sold">Vendido</SelectItem>
                    <SelectItem value="rented">Alugado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo de Preço</Label>
                <Select value={editForm.price_type} onValueChange={v => setEditForm(f => ({
                ...f,
                price_type: v
              }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">Venda</SelectItem>
                    <SelectItem value="rent">Aluguel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Área (m²)</Label>
                <Input value={editForm.area} onChange={e => setEditForm(f => ({
                ...f,
                area: e.target.value
              }))} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Endereço</Label>
              <Input value={editForm.address} onChange={e => setEditForm(f => ({
              ...f,
              address: e.target.value
            }))} />
            </div>
            <div className="space-y-2">
              <Label>Bairro / Região</Label>
              <Input value={editForm.location} onChange={e => setEditForm(f => ({
              ...f,
              location: e.target.value
            }))} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Quartos</Label>
                <Input type="number" value={editForm.bedrooms} onChange={e => setEditForm(f => ({
                ...f,
                bedrooms: e.target.value
              }))} />
              </div>
              <div className="space-y-2">
                <Label>Banheiros</Label>
                <Input type="number" value={editForm.bathrooms} onChange={e => setEditForm(f => ({
                ...f,
                bathrooms: e.target.value
              }))} />
              </div>
              <div className="space-y-2">
                <Label>Salas</Label>
                <Input type="number" value={editForm.rooms} onChange={e => setEditForm(f => ({
                ...f,
                rooms: e.target.value
              }))} />
              </div>
              <div className="space-y-2">
                <Label>Vagas</Label>
                <Input type="number" value={editForm.parking} onChange={e => setEditForm(f => ({
                ...f,
                parking: e.target.value
              }))} />
              </div>
            </div>

            <div className="space-y-3">
              <ImageUploader images={editForm.images || []} onImagesChange={imgs => setEditForm(f => ({
              ...f,
              images: imgs,
              image_url: imgs[0] || f.image_url
            }))} propertyId={property.id} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Proprietário</Label>
                <Input value={editForm.owner_name} onChange={e => setEditForm(f => ({
                ...f,
                owner_name: e.target.value
              }))} />
              </div>
              <div className="space-y-2">
                <Label>Telefone Proprietário</Label>
                <Input value={editForm.owner_phone} onChange={e => setEditForm(f => ({
                ...f,
                owner_phone: e.target.value
              }))} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={editForm.description} onChange={e => setEditForm(f => ({
              ...f,
              description: e.target.value
            }))} rows={4} />
            </div>
          </div>

          <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex justify-between">
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
            <Button variant="cta" className="gap-2" onClick={handleSaveEdit} disabled={updateProperty.isPending}>
              {updateProperty.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>;
  }

  // ─── VIEW MODE ───
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        {/* Image Carousel */}
        <div className="relative h-64 md:h-80 overflow-hidden rounded-t-lg group">
          <img src={allImages[currentImageIndex]} alt={`${property.title} - Foto ${currentImageIndex + 1}`} className="w-full h-full object-cover transition-opacity duration-300" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Carousel Controls */}
          {allImages.length > 1 && <>
              <button onClick={handlePrevImage} className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={handleNextImage} className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="h-5 w-5" />
              </button>
              {/* Dots */}
              <div className="absolute bottom-14 left-1/2 -translate-x-1/2 flex gap-1.5">
                {allImages.map((_, i) => <button key={i} onClick={e => {
              e.stopPropagation();
              setCurrentImageIndex(i);
            }} className={cn("h-2 rounded-full transition-all", i === currentImageIndex ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80")} />)}
              </div>
              {/* Counter */}
              <div className="absolute top-4 right-16 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">
                {currentImageIndex + 1} / {allImages.length}
              </div>
            </>}

          {/* Badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            {getStatusBadge(property.status)}
            <Badge variant="outline" className="bg-card/80 backdrop-blur-sm">
              {getTypeLabel(property.type)}
            </Badge>
          </div>
          {property.code && <Badge variant="outline" className="absolute top-4 right-4 bg-card/80 backdrop-blur-sm font-mono">
              {property.code}
            </Badge>}
          <div className="absolute bottom-4 left-4">
            <p className="text-2xl font-bold text-white drop-shadow-lg">
              {formatPrice(property.price)}
              {property.price_type === "rent" && <span className="text-base font-normal">/mês</span>}
            </p>
          </div>
        </div>

        {/* Thumbnail Strip */}
        {allImages.length > 1 && <div className="flex gap-2 px-6 pt-4 overflow-x-auto">
            {allImages.map((img, i) => <button key={i} onClick={() => setCurrentImageIndex(i)} className={cn("h-16 w-24 rounded-lg overflow-hidden shrink-0 border-2 transition-all", i === currentImageIndex ? "border-accent ring-1 ring-accent" : "border-transparent opacity-60 hover:opacity-100")}>
                <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
              </button>)}
          </div>}

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title & Location */}
          <div>
            <h2 className="text-xl font-bold text-foreground">{property.title}</h2>
            {(property.address || property.location) && <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                <MapPin className="h-4 w-4 text-accent shrink-0" />
                {property.address || property.location}
                {mapsUrl && <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline inline-flex items-center gap-0.5 ml-1">
                    <ExternalLink className="h-3 w-3" />
                    Ver no mapa
                  </a>}
              </p>}
          </div>

          {/* Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {property.bedrooms != null && property.bedrooms > 0 && <div className="bg-muted/40 rounded-xl p-3 text-center">
                <Bed className="h-5 w-5 mx-auto text-accent mb-1" />
                <p className="text-lg font-semibold text-foreground">{property.bedrooms}</p>
                <p className="text-xs text-muted-foreground">Quartos</p>
              </div>}
            {property.bathrooms != null && property.bathrooms > 0 && <div className="bg-muted/40 rounded-xl p-3 text-center">
                <Bath className="h-5 w-5 mx-auto text-accent mb-1" />
                <p className="text-lg font-semibold text-foreground">{property.bathrooms}</p>
                <p className="text-xs text-muted-foreground">Banheiros</p>
              </div>}
            {property.parking != null && property.parking > 0 && <div className="bg-muted/40 rounded-xl p-3 text-center">
                <Car className="h-5 w-5 mx-auto text-accent mb-1" />
                <p className="text-lg font-semibold text-foreground">{property.parking}</p>
                <p className="text-xs text-muted-foreground">Vagas</p>
              </div>}
            {property.area && <div className="bg-muted/40 rounded-xl p-3 text-center">
                <Square className="h-5 w-5 mx-auto text-accent mb-1" />
                <p className="text-lg font-semibold text-foreground">{property.area}</p>
                <p className="text-xs text-muted-foreground">m²</p>
              </div>}
            {property.rooms != null && property.rooms > 0 && <div className="bg-muted/40 rounded-xl p-3 text-center">
                <Square className="h-5 w-5 mx-auto text-accent mb-1" />
                <p className="text-lg font-semibold text-foreground">{property.rooms}</p>
                <p className="text-xs text-muted-foreground">Salas</p>
              </div>}
          </div>

          {/* Description */}
          {property.description && <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Descrição</h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>}

          {/* Owner Info */}
          {(property.owner_name || property.owner_phone) && <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
              <h3 className="text-sm font-semibold text-foreground mb-2">Proprietário</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {property.owner_name && <div>
                    <p className="text-xs text-muted-foreground">Nome</p>
                    <p className="font-medium text-foreground">{property.owner_name}</p>
                  </div>}
                {property.owner_phone && <div>
                    <p className="text-xs text-muted-foreground">Telefone</p>
                    <p className="font-medium text-foreground">{property.owner_phone}</p>
                  </div>}
              </div>
            </div>}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Button variant="outline" className="flex-1 min-w-[120px]" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
            <Button variant="outline" className="gap-2" onClick={startEditing}>
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
            {!confirmDelete ? <Button variant="outline" className="gap-2 text-destructive hover:bg-destructive/10" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-4 w-4" />
                Excluir
              </Button> : <Button variant="destructive" className="gap-2" onClick={handleDelete} disabled={deleteProperty.isPending}>
                {deleteProperty.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Confirmar Exclusão
              </Button>}
            {mapsUrl && <Button variant="cta" className="flex-1 min-w-[120px]" asChild>
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                  <MapPin className="h-4 w-4 mr-2" />
                  Abrir no Google Maps
                </a>
              </Button>}
          </div>
        </div>
      </DialogContent>
    </Dialog>;
}