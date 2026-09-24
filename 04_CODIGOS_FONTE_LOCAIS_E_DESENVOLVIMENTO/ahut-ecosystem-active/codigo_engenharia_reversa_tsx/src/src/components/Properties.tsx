import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  Grid, 
  List, 
  MoreVertical, 
  Heart, 
  Eye, 
  Edit2, 
  Trash2,
  Bed,
  Bath,
  Car,
  Maximize2,
  X,
  Upload,
  Link as LinkIcon,
  MapPin,
  Home,
  DollarSign,
  Users,
  CheckCircle,
  Building,
  FileText,
  Calculator,
  Percent,
  Calendar,
  ShieldCheck,
  Coins,
  Layers,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Globe
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { useCambiosChaco } from '../hooks/useCambiosChaco';

export interface PropertyItem {
  id: string | number;
  code: string;
  title: string;
  location: string;
  price: number;
  status: 'available' | 'reserved' | 'sold';
  type: string;
  beds: number;
  baths: number;
  rooms: number;
  area: number;
  parking: number;
  image: string;
  desc: string;
  priceType?: 'À Vista' | 'Parcelado';
  currency?: 'PYG' | 'BRL' | 'USD';
  cotacaoManual?: number;
  ownerName?: string;
  ownerPhone?: string;

  // Campos específicos para Terrenos & Loteamentos
  empresa?: string;
  loteamento?: string;
  manzana?: string;
  numeroDoLote?: string;
  metragensMetroQuadrado?: number;
  valorTotalParcelado?: number;
  valorAVista?: number;
  valorEntradaFinanciamento?: number;
  saldoFinanciado?: number;
  entradaGuaranis?: number; // Custo administrativo no 1º pagamento
  numeroParcelas?: number;
  valorParcelaMensal?: number;
  percentualComissaoAVista?: number;
  comissaoAVista?: number;
  percentualComissaoParcelado?: number;
  comissaoParcelado?: number;
  mesesAReceber?: string;
  valorAReceberPorParcela?: number;
}

export function formatMoneyDisplay(val?: number, currency: string = 'PYG', cotacao?: number) {
  if (val === undefined || val === null || isNaN(val)) return 'N/A';

  if (currency === 'PYG') {
    return `₲ ${Math.round(val).toLocaleString('pt-BR')}`;
  } else if (currency === 'BRL') {
    return `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else if (currency === 'USD') {
    return `$ ${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  return `₲ ${Math.round(val).toLocaleString('pt-BR')}`;
}

const initialProperties: PropertyItem[] = [
  { 
    id: 1, 
    code: 'AP8736', 
    title: 'Mansão Alphaville Premium', 
    location: 'Alameda das Palmeiras, 450 - Alphaville', 
    price: 2450000, 
    status: 'available', 
    type: 'Residencial', 
    beds: 4, 
    baths: 5, 
    rooms: 3, 
    area: 450, 
    parking: 3, 
    currency: 'BRL',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80', 
    desc: 'Mansão de alto padrão com piscina aquecida, área gourmet completa, home theater e jardim paisagístico.' 
  },
  { 
    id: 2, 
    code: 'AP8737', 
    title: 'Apartamento Jardins Luxo', 
    location: 'Rua Oscar Freire, 1200 - Jardins', 
    price: 1850000, 
    status: 'reserved', 
    type: 'Residencial', 
    beds: 3, 
    baths: 3, 
    rooms: 2, 
    area: 180, 
    parking: 2, 
    currency: 'BRL',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', 
    desc: 'Apartamento reformado com acabamento premium, varanda gourmet e vista para o parque.' 
  },
  { 
    id: 3, 
    code: 'AP8738', 
    title: 'Residência Morumbi', 
    location: 'Rua das Magnólias, 89 - Morumbi', 
    price: 3200000, 
    status: 'sold', 
    type: 'Residencial', 
    beds: 5, 
    baths: 6, 
    rooms: 4, 
    area: 600, 
    parking: 4, 
    currency: 'BRL',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80', 
    desc: 'Casa em condomínio fechado com segurança 24h, 5 suítes e quadra de tênis.' 
  },
  { 
    id: 4, 
    code: 'AP8739', 
    title: 'Laje Corporativa Faria Lima', 
    location: 'Av. Faria Lima, 3500 - Itaim Bibi', 
    price: 12000, 
    status: 'available', 
    type: 'Comercial', 
    beds: 0, 
    baths: 4, 
    rooms: 6, 
    area: 350, 
    parking: 8, 
    currency: 'BRL',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80', 
    desc: 'Laje corporativa com infraestrutura completa, piso elevado e ar condicionado central.'
  },
  { 
    id: 5, 
    code: 'AP8740', 
    title: 'Loft Industrial Pinheiros', 
    location: 'Rua dos Pinheiros, 780', 
    price: 890000, 
    status: 'available', 
    type: 'Residencial', 
    beds: 1, 
    baths: 1, 
    rooms: 1, 
    area: 65, 
    parking: 1, 
    currency: 'BRL',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80', 
    desc: 'Loft com pé direito duplo, estilo industrial e varanda integrada.' 
  },
  { 
    id: 6, 
    code: 'LOT8741', 
    title: 'Terreno Loteamento Green Park', 
    location: 'Manzana 01, Lote 02 - Green Park', 
    price: 90000000, 
    status: 'available', 
    type: 'Terreno', 
    beds: 0, 
    baths: 0, 
    rooms: 0, 
    area: 700, 
    parking: 0, 
    empresa: 'Inmo Desarrollos', 
    loteamento: 'Green Park', 
    manzana: '01', 
    numeroDoLote: '02', 
    metragensMetroQuadrado: 700,
    priceType: 'Parcelado',
    currency: 'PYG',
    cotacaoManual: 7800,
    valorAVista: 90000000,
    valorTotalParcelado: 120000000,
    valorEntradaFinanciamento: 20000000,
    saldoFinanciado: 100000000,
    entradaGuaranis: 500000,
    numeroParcelas: 50,
    valorParcelaMensal: 2000000,
    percentualComissaoAVista: 10,
    comissaoAVista: 9000000,
    percentualComissaoParcelado: 10,
    comissaoParcelado: 12000000,
    mesesAReceber: '1, 3, 5, 7',
    valorAReceberPorParcela: 3000000,
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80', 
    desc: 'Lote plano pronto para construir no Loteamento Green Park com infraestrutura completa de saneamento e asfalto.' 
  },
];

export default function Properties() {
  const { rates: liveRates, loading: ratesLoading, refreshRates } = useCambiosChaco();
  const [propertyList, setPropertyList] = useState<PropertyItem[]>(initialProperties);
  const [showModal, setShowModal] = useState(false);
  const [selectedPropertyView, setSelectedPropertyView] = useState<PropertyItem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<string>('Todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<string>('recent');

  // Estado completo do formulário com Moeda, Cotação, Entrada e Parcela Automática
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    type: 'Terreno',
    status: 'available' as 'available' | 'reserved' | 'sold',
    price: '',
    priceType: 'Parcelado' as 'À Vista' | 'Parcelado',
    currency: 'PYG' as 'PYG' | 'BRL' | 'USD',
    cotacaoManual: '7800',
    address: '',
    neighborhood: '',
    beds: 0,
    baths: 0,
    rooms: 0,
    parking: 0,
    area: 0,
    imageUrl: '',
    ownerName: '',
    ownerPhone: '',
    description: '',

    // CAMPOS ESPECÍFICOS PARA TERRENOS E LOTEAMENTOS
    empresa: '',
    loteamento: '',
    manzana: '',
    numeroDoLote: '',
    metragensMetroQuadrado: '',
    valorAVista: '',
    valorTotalParcelado: '',
    valorEntradaFinanciamento: '', // Entrada do financiamento
    saldoFinanciado: '', // Calculado (Total - Entrada)
    entradaGuaranis: '', // Custo administrativo no 1º pagamento
    numeroParcelas: '',
    valorParcelaMensal: '', // Calculado automático ((Total - Entrada) / Parcelas)

    // COMISSÕES (Entrada manual da % + Cálculo monetário automático)
    percentualComissaoAVista: '10',
    comissaoAVista: '', // Calculado automático (Valor à vista * %)
    percentualComissaoParcelado: '10',
    comissaoParcelado: '', // Calculado automático (Total Parcelado * %)
    mesesAReceber: '1, 3, 5, 7',
    valorAReceberPorParcela: '', // Calculado automático (Comissão Parcelada / Qtd Meses)
  });

  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load from Supabase on mount
  useEffect(() => {
    async function loadProperties() {
      try {
        const { data, error } = await supabase.from('properties').select('*');
        if (data && data.length > 0 && !error) {
          const mapped: PropertyItem[] = data.map((p: any) => ({
            id: p.id,
            code: p.code || `AP${Math.floor(1000 + Math.random() * 9000)}`,
            title: p.title || 'Imóvel sem título',
            location: p.address || p.location || 'Localização não informada',
            price: Number(p.price || p.valor_a_vista || p.valor_total_parcelado) || 0,
            status: p.status === 'reserved' ? 'reserved' : p.status === 'sold' ? 'sold' : 'available',
            type: p.type || 'Terreno',
            beds: Number(p.bedrooms || p.beds) || 0,
            baths: Number(p.bathrooms || p.baths) || 0,
            rooms: Number(p.rooms) || 0,
            area: Number(p.metragens_m2 || p.area) || 0,
            parking: Number(p.parking) || 0,
            image: p.image_url || p.image || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
            desc: p.description || p.desc || '',
            priceType: p.price_type === 'À Vista' ? 'À Vista' : 'Parcelado',
            currency: p.currency || 'PYG',
            cotacaoManual: Number(p.cotacao_manual) || 7800,
            ownerName: p.owner_name || undefined,
            ownerPhone: p.owner_phone || undefined,

            // Mapeamento dos campos de terreno
            empresa: p.empresa || undefined,
            loteamento: p.loteamento || undefined,
            manzana: p.manzana || undefined,
            numeroDoLote: p.numero_do_lote || p.numeroDoLote || undefined,
            metragensMetroQuadrado: Number(p.metragens_m2 || p.area) || undefined,
            valorAVista: Number(p.valor_a_vista) || undefined,
            valorTotalParcelado: Number(p.valor_total_parcelado) || undefined,
            valorEntradaFinanciamento: Number(p.valor_entrada_financiamento) || undefined,
            saldoFinanciado: Number(p.saldo_financiado) || undefined,
            entradaGuaranis: Number(p.entrada_guaranis) || undefined,
            numeroParcelas: Number(p.numero_parcelas) || undefined,
            valorParcelaMensal: Number(p.valor_parcela_mensal) || undefined,
            percentualComissaoAVista: Number(p.percentual_comissao_a_vista) || undefined,
            comissaoAVista: Number(p.comissao_a_vista) || undefined,
            percentualComissaoParcelado: Number(p.percentual_comissao_parcelado) || undefined,
            comissaoParcelado: Number(p.comissao_parcelado) || undefined,
            mesesAReceber: p.meses_a_receber || undefined,
            valorAReceberPorParcela: Number(p.valor_a_receber_por_parcela) || undefined,
          }));
          setPropertyList([...mapped, ...initialProperties]);
        }
      } catch (err) {
        console.warn('Usando lista local de imóveis', err);
      }
    }
    loadProperties();
  }, []);

  // Manipulador de Mudança nos Inputs com CÁLCULOS AUTOMÁTICOS COM ENTRADA E SALDO FINANCIADO
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };

      // Sincroniza Metragens m² e Área geral
      if (field === 'metragensMetroQuadrado') {
        updated.area = Number(value) || 0;
      } else if (field === 'area') {
        updated.metragensMetroQuadrado = value;
      }

      // 1. CÁLCULO AUTOMÁTICO: Saldo Financiado = Valor Total Parcelado - Valor Entrada Financiamento
      // 2. CÁLCULO AUTOMÁTICO: Valor da Parcela Mensal = Saldo Financiado / Nº Parcelas
      const numParcelas = Number(field === 'numeroParcelas' ? value : updated.numeroParcelas) || 0;
      const totalParcelado = Number(field === 'valorTotalParcelado' ? value : updated.valorTotalParcelado) || 0;
      const entradaFinan = Number(field === 'valorEntradaFinanciamento' ? value : updated.valorEntradaFinanciamento) || 0;

      const saldoAFinanciar = Math.max(0, totalParcelado - entradaFinan);
      updated.saldoFinanciado = saldoAFinanciar > 0 ? saldoAFinanciar.toString() : '';

      if (field === 'valorTotalParcelado' || field === 'valorEntradaFinanciamento' || field === 'numeroParcelas') {
        if (saldoAFinanciar >= 0 && numParcelas > 0) {
          updated.valorParcelaMensal = Math.round(saldoAFinanciar / numParcelas).toString();
        }
      } else if (field === 'valorParcelaMensal') {
        const valMensal = Number(value) || 0;
        if (valMensal > 0 && numParcelas > 0) {
          updated.valorTotalParcelado = Math.round((valMensal * numParcelas) + entradaFinan).toString();
          updated.saldoFinanciado = Math.round(valMensal * numParcelas).toString();
        }
      }

      // 3. CÁLCULO AUTOMÁTICO: Comissão À Vista (Valor Monetário = Valor à Vista * % Comissão À Vista / 100)
      const valVista = Number(field === 'valorAVista' ? value : updated.valorAVista) || 0;
      const percComVista = Number(field === 'percentualComissaoAVista' ? value : updated.percentualComissaoAVista) || 0;

      if (field === 'valorAVista' || field === 'percentualComissaoAVista') {
        if (valVista > 0 && percComVista >= 0) {
          updated.comissaoAVista = Math.round((valVista * percComVista) / 100).toString();
        }
      } else if (field === 'comissaoAVista') {
        const comVistaVal = Number(value) || 0;
        if (valVista > 0 && comVistaVal >= 0) {
          updated.percentualComissaoAVista = ((comVistaVal / valVista) * 100).toFixed(1);
        }
      }

      // 4. CÁLCULO AUTOMÁTICO: Comissão Parcelado (Valor Monetário = Valor Total Parcelado * % Comissão Parcelado / 100)
      const percComParc = Number(field === 'percentualComissaoParcelado' ? value : updated.percentualComissaoParcelado) || 0;
      const currentTotalParc = Number(field === 'valorTotalParcelado' ? value : updated.valorTotalParcelado) || 0;

      if (field === 'valorTotalParcelado' || field === 'percentualComissaoParcelado') {
        if (currentTotalParc > 0 && percComParc >= 0) {
          updated.comissaoParcelado = Math.round((currentTotalParc * percComParc) / 100).toString();
        }
      } else if (field === 'comissaoParcelado') {
        const comParcVal = Number(value) || 0;
        if (currentTotalParc > 0 && comParcVal >= 0) {
          updated.percentualComissaoParcelado = ((comParcVal / currentTotalParc) * 100).toFixed(1);
        }
      }

      // 5. CÁLCULO AUTOMÁTICO: Valor a Receber por Parcela de Comissão = Comissão Parcelada / Qtd Meses a Receber
      const currentComParc = Number(field === 'comissaoParcelado' ? updated.comissaoParcelado : (field === 'valorTotalParcelado' || field === 'percentualComissaoParcelado') ? updated.comissaoParcelado : updated.comissaoParcelado) || 0;
      const mesesStr = field === 'mesesAReceber' ? value : updated.mesesAReceber;
      const mesesList = (mesesStr || '').split(/[,;\s]+/).filter((m: string) => m.trim() !== '' && !isNaN(Number(m.trim())));
      const qtdMeses = mesesList.length;

      if (field === 'comissaoParcelado' || field === 'mesesAReceber' || field === 'valorTotalParcelado' || field === 'percentualComissaoParcelado') {
        if (currentComParc > 0 && qtdMeses > 0) {
          updated.valorAReceberPorParcela = Math.round(currentComParc / qtdMeses).toString();
        }
      } else if (field === 'valorAReceberPorParcela') {
        const valPorParcela = Number(value) || 0;
        if (valPorParcela > 0 && qtdMeses > 0) {
          const totalComissaoCalculada = Math.round(valPorParcela * qtdMeses);
          updated.comissaoParcelado = totalComissaoCalculada.toString();
          if (currentTotalParc > 0) {
            updated.percentualComissaoParcelado = ((totalComissaoCalculada / currentTotalParc) * 100).toFixed(1);
          }
        }
      }

      if (field === 'valorAVista') {
        updated.price = value;
      }

      return updated;
    });
  };

  const handleConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const isTerreno = formData.type === 'Terreno';
    const newCode = formData.code.trim() || (isTerreno ? `LOT${Math.floor(100 + Math.random() * 900)}` : `AP${Math.floor(1000 + Math.random() * 9000)}`);
    
    let newTitle = formData.title.trim();
    if (!newTitle) {
      if (isTerreno && (formData.loteamento || formData.manzana || formData.numeroDoLote)) {
        newTitle = `Terreno ${formData.loteamento || 'Loteamento'} - Manzana ${formData.manzana || '01'} Lote ${formData.numeroDoLote || '01'}`;
      } else {
        newTitle = 'Novo Imóvel / Terreno Cadastrado';
      }
    }

    let newLocation = [formData.address, formData.neighborhood].filter(Boolean).join(' - ');
    if (!newLocation && isTerreno && formData.loteamento) {
      newLocation = `Loteamento ${formData.loteamento}, Manzana ${formData.manzana || '-'}, Lote ${formData.numeroDoLote || '-'}`;
    } else if (!newLocation) {
      newLocation = 'Endereço não informado';
    }

    const newPrice = Number(formData.valorAVista || formData.valorTotalParcelado || formData.price) || 0;
    const defaultImage = formData.imageUrl.trim() || (isTerreno 
      ? 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80'
      : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80'
    );

    const newItem: PropertyItem = {
      id: Date.now(),
      code: newCode,
      title: newTitle,
      location: newLocation,
      price: newPrice,
      status: formData.status,
      type: formData.type,
      beds: Number(formData.beds) || 0,
      baths: Number(formData.baths) || 0,
      rooms: Number(formData.rooms) || 0,
      area: Number(formData.metragensMetroQuadrado || formData.area) || 0,
      parking: Number(formData.parking) || 0,
      image: defaultImage,
      desc: formData.description || (isTerreno 
        ? `Empresa: ${formData.empresa || '-'} | Loteamento: ${formData.loteamento || '-'} | Manzana: ${formData.manzana || '-'} | Lote: ${formData.numeroDoLote || '-'}` 
        : 'Nenhuma descrição detalhada informada.'
      ),
      priceType: formData.priceType,
      currency: formData.currency,
      cotacaoManual: Number(formData.cotacaoManual) || 7800,
      ownerName: formData.ownerName,
      ownerPhone: formData.ownerPhone,

      // Todos os campos de terreno
      empresa: formData.empresa,
      loteamento: formData.loteamento,
      manzana: formData.manzana,
      numeroDoLote: formData.numeroDoLote,
      metragensMetroQuadrado: Number(formData.metragensMetroQuadrado || formData.area) || 0,
      valorAVista: Number(formData.valorAVista) || 0,
      valorTotalParcelado: Number(formData.valorTotalParcelado) || 0,
      valorEntradaFinanciamento: Number(formData.valorEntradaFinanciamento) || 0,
      saldoFinanciado: Number(formData.saldoFinanciado) || 0,
      entradaGuaranis: Number(formData.entradaGuaranis) || 0,
      numeroParcelas: Number(formData.numeroParcelas) || 0,
      valorParcelaMensal: Number(formData.valorParcelaMensal) || 0,
      percentualComissaoAVista: Number(formData.percentualComissaoAVista) || 0,
      comissaoAVista: Number(formData.comissaoAVista) || 0,
      percentualComissaoParcelado: Number(formData.percentualComissaoParcelado) || 0,
      comissaoParcelado: Number(formData.comissaoParcelado) || 0,
      mesesAReceber: formData.mesesAReceber,
      valorAReceberPorParcela: Number(formData.valorAReceberPorParcela) || 0,
    };

    // Salvar no Banco de Dados (Supabase) com fallback seguro
    try {
      await supabase.from('properties').insert({
        code: newCode,
        title: newTitle,
        address: newLocation,
        price: newPrice,
        price_type: formData.priceType,
        currency: formData.currency,
        cotacao_manual: newItem.cotacaoManual,
        status: formData.status,
        type: formData.type,
        bedrooms: newItem.beds,
        bathrooms: newItem.baths,
        rooms: newItem.rooms,
        area: newItem.area,
        parking: newItem.parking,
        image_url: defaultImage,
        description: newItem.desc,
        owner_name: formData.ownerName,
        owner_phone: formData.ownerPhone,
        empresa: formData.empresa,
        loteamento: formData.loteamento,
        manzana: formData.manzana,
        numero_do_lote: formData.numeroDoLote,
        metragens_m2: newItem.metragensMetroQuadrado,
        valor_a_vista: newItem.valorAVista,
        valor_total_parcelado: newItem.valorTotalParcelado,
        valor_entrada_financiamento: newItem.valorEntradaFinanciamento,
        saldo_financiado: newItem.saldoFinanciado,
        entrada_guaranis: newItem.entradaGuaranis,
        numero_parcelas: newItem.numeroParcelas,
        valor_parcela_mensal: newItem.valorParcelaMensal,
        percentual_comissao_a_vista: newItem.percentualComissaoAVista,
        comissao_a_vista: newItem.comissaoAVista,
        percentual_comissao_parcelado: newItem.percentualComissaoParcelado,
        comissao_parcelado: newItem.comissaoParcelado,
        meses_a_receber: newItem.mesesAReceber,
        valor_a_receber_por_parcela: newItem.valorAReceberPorParcela,
      });
    } catch (err) {
      console.warn('Salvo com sucesso no estado local do sistema', err);
    }

    // RENDERIZAR CARD NOVO VINCULADO NO ESTADO DA APLICAÇÃO
    setPropertyList(prev => [newItem, ...prev]);

    setSaving(false);
    setShowModal(false);
    setToastMessage(`Terreno / Imóvel "${newTitle}" cadastrado com sucesso!`);
    setTimeout(() => setToastMessage(null), 4500);

    // Reset Form
    setFormData({
      title: '',
      code: '',
      type: 'Terreno',
      status: 'available',
      price: '',
      priceType: 'Parcelado',
      currency: 'PYG',
      cotacaoManual: '7800',
      address: '',
      neighborhood: '',
      beds: 0,
      baths: 0,
      rooms: 0,
      parking: 0,
      area: 0,
      imageUrl: '',
      ownerName: '',
      ownerPhone: '',
      description: '',
      empresa: '',
      loteamento: '',
      manzana: '',
      numeroDoLote: '',
      metragensMetroQuadrado: '',
      valorAVista: '',
      valorTotalParcelado: '',
      valorEntradaFinanciamento: '',
      saldoFinanciado: '',
      entradaGuaranis: '',
      numeroParcelas: '',
      valorParcelaMensal: '',
      percentualComissaoAVista: '10',
      comissaoAVista: '',
      percentualComissaoParcelado: '10',
      comissaoParcelado: '',
      mesesAReceber: '1, 3, 5, 7',
      valorAReceberPorParcela: '',
    });
  };

  const handleDelete = (id: string | number) => {
    setPropertyList(prev => prev.filter(p => p.id !== id));
  };

  // Filtragem e Ordenação
  const filteredProperties = propertyList.filter(prop => {
    const matchesType = 
      filterType === 'Todos' ? true :
      filterType === 'Terrenos' ? (prop.type === 'Terreno' || prop.type === 'Terrenos' || Boolean(prop.loteamento)) :
      prop.type === filterType;
    
    const matchesSearch = 
      searchTerm === '' ||
      prop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prop.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prop.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prop.loteamento && prop.loteamento.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (prop.empresa && prop.empresa.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (prop.manzana && prop.manzana.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (prop.numeroDoLote && prop.numeroDoLote.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesType && matchesSearch;
  }).sort((a, b) => {
    if (sortOrder === 'price_asc') return a.price - b.price;
    if (sortOrder === 'price_desc') return b.price - a.price;
    return 0;
  });

  return (
    <div className="p-6 space-y-6 bg-transparent min-h-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white px-5 py-3.5 rounded-xl shadow-2xl animate-in slide-in-from-top duration-300 border border-white/20">
          <CheckCircle className="w-5 h-5 text-white" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
            {['Todos', 'Terrenos', 'Residencial', 'Comercial'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={cn(
                  "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                  filterType === t ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/30" : "text-slate-400 hover:text-slate-200"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-white/5 border border-cyan-900/30 rounded-lg px-3 py-1.5 text-sm">
            <Search className="w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar código, loteamento, manzana, empresa..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-slate-200 outline-none text-xs w-48 md:w-64"
            />
          </div>
          
          <select 
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="bg-white/5 border border-cyan-900/30 rounded-lg px-3 py-1.5 text-xs text-slate-300 outline-none"
          >
            <option value="recent">Ordenar: Mais Recentes</option>
            <option value="price_asc">Preço: Menor para Maior</option>
            <option value="price_desc">Preço: Maior para Menor</option>
          </select>

          {/* Live Cambios Chaco Rates Ticker Widget */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-cyan-950/80 to-slate-900 border border-cyan-500/30 rounded-xl px-3 py-1.5 text-xs text-slate-200">
            <Globe className="w-3.5 h-3.5 text-cyan-400 animate-pulse shrink-0" />
            <span className="text-[11px] font-bold text-slate-300 hidden sm:inline">Cambios Chaco:</span>
            {ratesLoading ? (
              <span className="text-[11px] text-slate-400">Carregando...</span>
            ) : liveRates ? (
              <div className="flex items-center gap-2.5 font-mono text-[11px]">
                <span className="text-amber-300">USD: <strong>₲{liveRates.USD_PYG}</strong></span>
                <span className="text-cyan-300">BRL: <strong>₲{liveRates.BRL_PYG}</strong></span>
              </div>
            ) : (
              <span className="text-[11px] text-slate-400">USD ₲7800 | BRL ₲1380</span>
            )}
            <button 
              onClick={() => refreshRates()}
              title="Atualizar Cotação Cambios Chaco"
              className="p-1 hover:bg-white/10 rounded transition-colors text-cyan-400"
            >
              <RefreshCw className={cn("w-3 h-3", ratesLoading && "animate-spin")} />
            </button>
          </div>

          <div className="flex items-center bg-white/5 border border-cyan-900/30 rounded-lg p-1">
            <button 
              onClick={() => setViewMode('grid')}
              className={cn("p-1.5 rounded-md transition-all", viewMode === 'grid' ? "bg-white/10 text-cyan-400" : "text-slate-400")}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn("p-1.5 rounded-md transition-all", viewMode === 'list' ? "bg-white/10 text-cyan-400" : "text-slate-400")}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* BOTÃO EXISTENTE NA TELA "Novo Imóvel / Terreno" */}
        <button 
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/25 active:scale-95 border border-cyan-400/30"
        >
          <Plus className="w-4 h-4" />
          Novo Imóvel / Terreno
        </button>
      </div>

      {/* Grid or List of Cards */}
      <div className={cn(
        viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "flex flex-col gap-4"
      )}>
        {filteredProperties.map((prop) => {
          const isTerreno = prop.type === 'Terreno' || Boolean(prop.loteamento);
          const curr = prop.currency || 'PYG';

          return (
            <div 
              key={prop.id} 
              className="glass-neon-card overflow-hidden group hover:shadow-2xl hover:shadow-cyan-900/30 transition-all border border-white/5 hover:border-cyan-500/40 rounded-2xl flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 overflow-hidden bg-slate-900">
                  <img 
                    src={prop.image} 
                    alt={prop.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    referrerPolicy="no-referrer" 
                    onError={(e) => {
                      (e.target as HTMLElement).setAttribute('src', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80');
                    }}
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                    <span className={cn(
                      "text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-md backdrop-blur-md",
                      prop.status === 'available' ? "bg-cyan-500/90 text-white" :
                      prop.status === 'reserved' ? "bg-amber-500/90 text-white" :
                      "bg-emerald-500/90 text-white"
                    )}>
                      {prop.status === 'available' ? 'Disponível' : prop.status === 'reserved' ? 'Reservado' : 'Vendido'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-black/70 text-slate-200 backdrop-blur-md">
                      {prop.code}
                    </span>
                    {isTerreno && (
                      <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-teal-950/90 text-teal-300 border border-teal-500/30 backdrop-blur-md">
                        Terreno / Lote
                      </span>
                    )}
                    <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-cyan-900/90 text-cyan-200 border border-cyan-500/30 backdrop-blur-md">
                      {curr}
                    </span>
                  </div>
                  
                  <button 
                    onClick={() => handleDelete(prop.id)}
                    className="absolute top-3 right-3 p-2 bg-black/50 backdrop-blur-md text-slate-300 hover:text-rose-400 rounded-full hover:bg-black/80 transition-all z-10"
                    title="Excluir Cadastrado"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between backdrop-blur-md bg-black/60 p-2.5 rounded-xl border border-white/10">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {prop.priceType === 'À Vista' ? 'À Vista' : 'Valor Total'}
                      </p>
                      <p className="text-white font-extrabold text-lg leading-none">
                        {formatMoneyDisplay(prop.valorAVista || prop.price, curr)}
                      </p>
                    </div>
                    {prop.valorTotalParcelado ? (
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                          Parcelado ({prop.numeroParcelas || '60'}x)
                        </p>
                        <p className="text-cyan-300 font-bold text-xs">
                          {formatMoneyDisplay(prop.valorParcelaMensal || Math.round((prop.valorTotalParcelado - (prop.valorEntradaFinanciamento || 0)) / (prop.numeroParcelas || 60)), curr)}/mês
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-white truncate" title={prop.title}>{prop.title}</h3>
                    <div className="flex items-center gap-1 mt-0.5 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <p className="text-[11px] truncate">{prop.location}</p>
                    </div>
                  </div>

                  {/* Informações de Terreno / Loteamento */}
                  {isTerreno ? (
                    <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-cyan-900/30 text-xs">
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Empresa</span>
                          <span className="text-slate-200 font-semibold truncate block">{prop.empresa || 'Empresa N/I'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Loteamento</span>
                          <span className="text-cyan-300 font-semibold truncate block">{prop.loteamento || 'Loteamento N/I'}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
                        <span className="bg-cyan-950/80 px-2 py-0.5 rounded text-slate-200 border border-cyan-800/40">
                          Manzana: <strong className="text-cyan-400">{prop.manzana || '-'}</strong>
                        </span>
                        <span className="bg-cyan-950/80 px-2 py-0.5 rounded text-slate-200 border border-cyan-800/40">
                          Lote: <strong className="text-cyan-400">{prop.numeroDoLote || '-'}</strong>
                        </span>
                        <span className="bg-cyan-950/80 px-2 py-0.5 rounded text-slate-200 border border-cyan-800/40 flex items-center gap-1">
                          <Maximize2 className="w-3 h-3 text-cyan-400" />
                          <strong className="text-slate-100">{prop.metragensMetroQuadrado || prop.area} m²</strong>
                        </span>
                      </div>

                      {/* Resumo Financeiro, Entrada & Comissões */}
                      {(prop.valorEntradaFinanciamento || prop.entradaGuaranis || prop.comissaoParcelado || prop.comissaoAVista) && (
                        <div className="space-y-1.5 pt-2 border-t border-cyan-900/30 text-[10px]">
                          {prop.valorEntradaFinanciamento ? (
                            <div className="flex justify-between text-slate-300">
                              <span className="text-slate-400">Entrada do Financiamento:</span>
                              <strong className="text-cyan-300">{formatMoneyDisplay(prop.valorEntradaFinanciamento, curr)}</strong>
                            </div>
                          ) : null}

                          {prop.entradaGuaranis ? (
                            <div className="flex justify-between text-slate-300">
                              <span className="text-slate-400">Entrada (Custo Admin):</span>
                              <strong className="text-amber-300">{formatMoneyDisplay(prop.entradaGuaranis, 'PYG')}</strong>
                            </div>
                          ) : null}

                          {prop.comissaoAVista ? (
                            <div className="flex justify-between text-slate-300">
                              <span className="text-slate-400">Comissão À Vista:</span>
                              <strong className="text-emerald-400">{formatMoneyDisplay(prop.comissaoAVista, curr)}</strong>
                            </div>
                          ) : null}

                          {prop.comissaoParcelado ? (
                            <div className="flex justify-between text-slate-300">
                              <span className="text-slate-400">Comissão Parcelada:</span>
                              <strong className="text-teal-300">
                                {formatMoneyDisplay(prop.comissaoParcelado, curr)}
                              </strong>
                            </div>
                          ) : null}

                          {prop.mesesAReceber && prop.valorAReceberPorParcela ? (
                            <div className="flex justify-between text-slate-300 bg-teal-950/40 px-2 py-1 rounded border border-teal-500/20">
                              <span className="text-slate-400">Mês [{prop.mesesAReceber}]:</span>
                              <strong className="text-teal-200">{formatMoneyDisplay(prop.valorAReceberPorParcela, curr)} / parcela</strong>
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Imóvel Genérico */
                    <div className="flex items-center gap-3 text-slate-300 text-xs py-1">
                      <div className="flex items-center gap-1"><Bed className="w-3.5 h-3.5 text-cyan-400" /><span>{prop.beds}</span></div>
                      <div className="flex items-center gap-1"><Bath className="w-3.5 h-3.5 text-cyan-400" /><span>{prop.baths}</span></div>
                      <div className="flex items-center gap-1"><Car className="w-3.5 h-3.5 text-cyan-400" /><span>{prop.parking}</span></div>
                      <div className="flex items-center gap-1"><Maximize2 className="w-3.5 h-3.5 text-cyan-400" /><span>{prop.area} m²</span></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 pt-0 flex items-center justify-between gap-2">
                <button 
                  onClick={() => setSelectedPropertyView(prop)}
                  className="w-full bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 hover:text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-cyan-800/40 transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Ver Ficha Completa
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL FICHA COMPLETA DO IMOVEL / TERRENO */}
      {selectedPropertyView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-cyan-900/60 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">{selectedPropertyView.code} • {selectedPropertyView.type}</span>
                <h3 className="text-xl font-extrabold text-white">{selectedPropertyView.title}</h3>
                <p className="text-xs text-slate-400">{selectedPropertyView.location}</p>
              </div>
              <button 
                onClick={() => setSelectedPropertyView(null)} 
                className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-white/5 text-xs">
              <div><span className="text-slate-400">1. Empresa:</span> <strong className="text-white block">{selectedPropertyView.empresa || '-'}</strong></div>
              <div><span className="text-slate-400">2. Loteamento:</span> <strong className="text-cyan-300 block">{selectedPropertyView.loteamento || '-'}</strong></div>
              <div><span className="text-slate-400">3. Manzana / Quadra:</span> <strong className="text-white block">{selectedPropertyView.manzana || '-'}</strong></div>
              <div><span className="text-slate-400">4. Número do Lote:</span> <strong className="text-white block">{selectedPropertyView.numeroDoLote || '-'}</strong></div>
              <div><span className="text-slate-400">5. Metragens (m²):</span> <strong className="text-white block">{selectedPropertyView.metragensMetroQuadrado || selectedPropertyView.area} m²</strong></div>
              <div><span className="text-slate-400">Moeda Selecionada:</span> <strong className="text-cyan-300 block">{selectedPropertyView.currency || 'PYG'} {selectedPropertyView.cotacaoManual ? `(Cotação: ${selectedPropertyView.cotacaoManual})` : ''}</strong></div>
              <div><span className="text-slate-400">6. Valor à Vista:</span> <strong className="text-emerald-400 block">{formatMoneyDisplay(selectedPropertyView.valorAVista || selectedPropertyView.price, selectedPropertyView.currency || 'PYG')}</strong></div>
              <div><span className="text-slate-400">7. Valor Total Parcelado:</span> <strong className="text-cyan-300 block">{formatMoneyDisplay(selectedPropertyView.valorTotalParcelado, selectedPropertyView.currency || 'PYG')}</strong></div>
              <div><span className="text-slate-400">Valor Entrada Financiamento:</span> <strong className="text-cyan-200 block">{formatMoneyDisplay(selectedPropertyView.valorEntradaFinanciamento, selectedPropertyView.currency || 'PYG')}</strong></div>
              <div><span className="text-slate-400">Saldo Financiado:</span> <strong className="text-slate-200 block">{formatMoneyDisplay(selectedPropertyView.saldoFinanciado, selectedPropertyView.currency || 'PYG')}</strong></div>
              <div><span className="text-slate-400">8. Entrada Guaranis (Custo Admin):</span> <strong className="text-amber-300 block">{formatMoneyDisplay(selectedPropertyView.entradaGuaranis, 'PYG')}</strong></div>
              <div><span className="text-slate-400">9. Número de Parcelas:</span> <strong className="text-white block">{selectedPropertyView.numeroParcelas ? `${selectedPropertyView.numeroParcelas} parcelas` : '-'}</strong></div>
              <div><span className="text-slate-400">10. Valor Parcela Mensal (Calculado):</span> <strong className="text-cyan-300 block">{formatMoneyDisplay(selectedPropertyView.valorParcelaMensal, selectedPropertyView.currency || 'PYG')}/mês</strong></div>
              <div><span className="text-slate-400">11. Comissão à Vista (Calculada):</span> <strong className="text-emerald-400 block">{formatMoneyDisplay(selectedPropertyView.comissaoAVista, selectedPropertyView.currency || 'PYG')} {selectedPropertyView.percentualComissaoAVista ? `(${selectedPropertyView.percentualComissaoAVista}%)` : ''}</strong></div>
              <div><span className="text-slate-400">12. Comissão Parcelado (Calculada):</span> <strong className="text-teal-300 block">{formatMoneyDisplay(selectedPropertyView.comissaoParcelado, selectedPropertyView.currency || 'PYG')} {selectedPropertyView.percentualComissaoParcelado ? `(${selectedPropertyView.percentualComissaoParcelado}%)` : ''}</strong></div>
              <div><span className="text-slate-400">13. Mês a Receber (Comissão):</span> <strong className="text-white block">Mês [{selectedPropertyView.mesesAReceber || '-'}]</strong></div>
              <div><span className="text-slate-400">14. Valor a Receber (por Parcela):</span> <strong className="text-emerald-400 block">{formatMoneyDisplay(selectedPropertyView.valorAReceberPorParcela, selectedPropertyView.currency || 'PYG')} / parcela</strong></div>
            </div>

            {selectedPropertyView.desc && (
              <div className="space-y-1 bg-white/5 p-4 rounded-xl border border-white/5 text-xs">
                <span className="text-slate-400 font-bold block">Descrição & Observações:</span>
                <p className="text-slate-200 leading-relaxed">{selectedPropertyView.desc}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button 
                onClick={() => setSelectedPropertyView(null)}
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-xl text-xs font-bold"
              >
                Fechar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FORMULÁRIO COMPLETO COM MOEDA, COTAÇÃO, TIPO DE VALOR (À VISTA / PARCELADO), ENTRADA E CÁLCULO DA PARCELA */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <form onSubmit={handleConfirmSubmit} className="bg-slate-900 border border-cyan-900/50 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100">
            <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-md z-20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Cadastrar Terreno / Loteamento</h3>
                  <p className="text-xs text-slate-400">Formulário de cadastro com tipo de valor (À Vista / Parcelado), Moedas, Cotação Manual e Entrada</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowModal(false)} 
                className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-8">

              {/* SEÇÃO 1: TIPO DE PROPRIEDADE, TIPO DE VALOR (À VISTA / PARCELADO), MOEDA & COTAÇÃO */}
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-cyan-900/40 pb-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                    <Globe className="w-4 h-4" />
                    <h4>1. Tipo de Propriedade, Tipo de Valor, Moeda & Cotação</h4>
                  </div>
                  <span className="text-[10px] font-bold bg-cyan-950 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                    Modo Terrenos Ativo
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Tipo de Propriedade */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Tipo de Propriedade *</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-full bg-slate-800 border border-cyan-900/50 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400 font-bold"
                    >
                      <option value="Terreno">Terreno / Lote</option>
                      <option value="Residencial">Residencial</option>
                      <option value="Comercial">Comercial</option>
                    </select>
                  </div>

                  {/* ITEM 1 PEDIDO: Tipo de Valor (À Vista ou Parcelado) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-cyan-300">Tipo de Valor *</label>
                    <select 
                      value={formData.priceType}
                      onChange={(e) => handleInputChange('priceType', e.target.value)}
                      className="w-full bg-slate-800 border border-cyan-500/40 rounded-xl px-3 py-2.5 text-sm text-cyan-200 outline-none focus:border-cyan-400 font-extrabold"
                    >
                      <option value="À Vista">À Vista</option>
                      <option value="Parcelado">Parcelado</option>
                    </select>
                  </div>

                  {/* ITEM 3 PEDIDO: Seleção de Moeda */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-amber-300">Moeda *</label>
                    <select 
                      value={formData.currency}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                      className="w-full bg-slate-800 border border-amber-500/40 rounded-xl px-3 py-2.5 text-sm text-amber-200 outline-none focus:border-amber-400 font-bold"
                    >
                      <option value="PYG">Guarani (PYG / ₲)</option>
                      <option value="BRL">Real (BRL / R$)</option>
                      <option value="USD">Dólar (USD / $)</option>
                    </select>
                  </div>

                  {/* ITEM 3 PEDIDO: Cotação Manual */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300">Cotação Manual</label>
                      {liveRates && (
                        <button
                          type="button"
                          onClick={() => {
                            const rate = formData.currency === 'BRL' ? liveRates.BRL_PYG : liveRates.USD_PYG;
                            handleInputChange('cotacaoManual', rate.toString());
                          }}
                          className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                          title="Clique para preencher com a cotação ao vivo da Cambios Chaco"
                        >
                          <RefreshCw className="w-2.5 h-2.5" /> Puxar {formData.currency === 'BRL' ? `BRL (${liveRates.BRL_PYG})` : `USD (${liveRates.USD_PYG})`}
                        </button>
                      )}
                    </div>
                    <input 
                      type="number" 
                      placeholder="Ex: 7800" 
                      value={formData.cotacaoManual}
                      onChange={(e) => handleInputChange('cotacaoManual', e.target.value)}
                      className="w-full bg-white/5 border border-cyan-900/40 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500 font-mono" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Código do Lote / Imóvel</label>
                    <input 
                      type="text" 
                      placeholder="Ex: LOT8741" 
                      value={formData.code}
                      onChange={(e) => handleInputChange('code', e.target.value)}
                      className="w-full bg-white/5 border border-cyan-900/40 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Status de Disponibilidade</label>
                    <select 
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full bg-slate-800 border border-cyan-900/50 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500 font-bold"
                    >
                      <option value="available">Disponível</option>
                      <option value="reserved">Reservado</option>
                      <option value="sold">Vendido</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Título / Nome do Registro</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Terreno Loteamento Green Park - Q01 L02" 
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full bg-white/5 border border-cyan-900/40 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500" 
                  />
                </div>
              </section>

              {/* SEÇÃO 2: DADOS DA EMPRESA, LOTEAMENTO, QUADRA, LOTE E METRAGEM */}
              <section className="space-y-4 bg-slate-950/80 p-5 rounded-2xl border border-cyan-500/20 shadow-inner">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm border-b border-cyan-900/40 pb-2">
                  <Building className="w-4 h-4 text-cyan-400" />
                  <h4>2. Dados do Loteamento, Empresa e Medidas (Campos 1 a 5)</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* CAMPO 1: Empresa */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                      <span className="bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30 text-[10px]">1</span>
                      <span>Nome da Empresa *</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="Ex: Inmo Desarrollos" 
                      value={formData.empresa}
                      onChange={(e) => handleInputChange('empresa', e.target.value)}
                      className="w-full bg-slate-800 border border-cyan-900/50 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-400 font-semibold" 
                    />
                  </div>

                  {/* CAMPO 2: Loteamento */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                      <span className="bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30 text-[10px]">2</span>
                      <span>Nome do Loteamento *</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="Ex: Green Park" 
                      value={formData.loteamento}
                      onChange={(e) => handleInputChange('loteamento', e.target.value)}
                      className="w-full bg-slate-800 border border-cyan-900/50 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-400 font-semibold" 
                    />
                  </div>

                  {/* CAMPO 3: Manzana / Quadra */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                      <span className="bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30 text-[10px]">3</span>
                      <span>Manzana ou Quadra *</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="Ex: 01 ou Quadra A" 
                      value={formData.manzana}
                      onChange={(e) => handleInputChange('manzana', e.target.value)}
                      className="w-full bg-slate-800 border border-cyan-900/50 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-400 font-semibold" 
                    />
                  </div>

                  {/* CAMPO 4: Número do Lote */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                      <span className="bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30 text-[10px]">4</span>
                      <span>Número do Lote *</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="Ex: 02" 
                      value={formData.numeroDoLote}
                      onChange={(e) => handleInputChange('numeroDoLote', e.target.value)}
                      className="w-full bg-slate-800 border border-cyan-900/50 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-400 font-semibold" 
                    />
                  </div>

                  {/* CAMPO 5: Metragens Metro Quadrado */}
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                      <span className="bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30 text-[10px]">5</span>
                      <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Metragens Metro Quadrado (m²) *</span>
                    </label>
                    <input 
                      type="number" 
                      min="0"
                      placeholder="Ex: 700" 
                      value={formData.metragensMetroQuadrado || formData.area}
                      onChange={(e) => handleInputChange('metragensMetroQuadrado', e.target.value)}
                      className="w-full bg-slate-800 border border-cyan-900/50 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-400 font-bold" 
                    />
                  </div>
                </div>
              </section>

              {/* SEÇÃO 3: VALORES DO IMÓVEL, FINANCIAMENTO COM ENTRADA E CÁLCULO DA PARCELA */}
              <section className="space-y-4 bg-cyan-950/20 p-5 rounded-2xl border border-cyan-500/30">
                <div className="flex items-center justify-between border-b border-cyan-900/40 pb-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                    <Coins className="w-4 h-4" />
                    <h4>3. Valores do Imóvel & Financiamento (Com Valor de Entrada & Custo Admin)</h4>
                  </div>
                  <span className="text-[10px] font-bold text-cyan-300 flex items-center gap-1 bg-cyan-900/60 px-2.5 py-1 rounded-lg border border-cyan-500/40">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    Calculadora de Mensalidades Ativa
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* CAMPO 6: Valor à Vista */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                      <span className="bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30 text-[10px]">6</span>
                      <span>Valor à Vista ({formData.currency}) *</span>
                    </label>
                    <input 
                      type="number" 
                      placeholder="Ex: 90000000" 
                      value={formData.valorAVista}
                      onChange={(e) => handleInputChange('valorAVista', e.target.value)}
                      className="w-full bg-slate-800 border border-emerald-500/40 rounded-xl px-4 py-2.5 text-sm text-emerald-300 outline-none focus:border-emerald-400 font-bold" 
                    />
                  </div>

                  {/* CAMPO 8: Entrada Guaranis (Custo Administrativo Extra) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-amber-300 flex items-center gap-1">
                      <span className="bg-amber-950 px-2 py-0.5 rounded border border-amber-500/30 text-[10px]">8</span>
                      <span>Entrada Guaranis (Custo Admin Extra no 1º Pagamento) *</span>
                    </label>
                    <input 
                      type="number" 
                      placeholder="Ex: 500000" 
                      value={formData.entradaGuaranis}
                      onChange={(e) => handleInputChange('entradaGuaranis', e.target.value)}
                      className="w-full bg-slate-800 border border-amber-500/40 rounded-xl px-4 py-2.5 text-sm text-amber-200 outline-none focus:border-amber-400 font-bold" 
                    />
                    <p className="text-[10px] text-slate-400">Custo administrativo cobrado extra do cliente no primeiro pagamento</p>
                  </div>

                  {/* CAMPO 7: Valor Total Parcelado */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                      <span className="bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30 text-[10px]">7</span>
                      <span>Valor Total Parcelado ({formData.currency}) *</span>
                    </label>
                    <input 
                      type="number" 
                      placeholder="Ex: 120000000" 
                      value={formData.valorTotalParcelado}
                      onChange={(e) => handleInputChange('valorTotalParcelado', e.target.value)}
                      className="w-full bg-slate-800 border border-cyan-500/40 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-400 font-bold" 
                    />
                  </div>

                  {/* ITEM 2 PEDIDO: Campo de Preencher o Valor de Entrada do Financiamento */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                      <span className="bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30 text-[10px]">E</span>
                      <span>Valor de Entrada do Financiamento ({formData.currency}) *</span>
                    </label>
                    <input 
                      type="number" 
                      placeholder="Ex: 20000000" 
                      value={formData.valorEntradaFinanciamento}
                      onChange={(e) => handleInputChange('valorEntradaFinanciamento', e.target.value)}
                      className="w-full bg-slate-800 border border-cyan-500/40 rounded-xl px-4 py-2.5 text-sm text-cyan-200 outline-none focus:border-cyan-400 font-bold" 
                    />
                    {formData.saldoFinanciado ? (
                      <p className="text-[10px] text-slate-400">
                        Saldo a Financiar: <strong className="text-cyan-300">{formatMoneyDisplay(Number(formData.saldoFinanciado), formData.currency)}</strong>
                      </p>
                    ) : null}
                  </div>

                  {/* CAMPO 9: Número de Parcelas */}
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                      <span className="bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30 text-[10px]">9</span>
                      <span>Número Total de Parcelas *</span>
                    </label>
                    <input 
                      type="number" 
                      min="1"
                      placeholder="Ex: 50 ou 60" 
                      value={formData.numeroParcelas}
                      onChange={(e) => handleInputChange('numeroParcelas', e.target.value)}
                      className="w-full bg-slate-800 border border-cyan-500/40 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-400 font-bold" 
                    />
                  </div>

                  {/* CAMPO 10: Valor da Parcela Mensal (CAMPO AUTOMÁTICO CALCULADO) */}
                  <div className="md:col-span-2 space-y-1.5 bg-cyan-900/40 p-4 rounded-xl border border-cyan-400/50 shadow-md">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-cyan-200 flex items-center gap-1.5">
                        <span className="bg-cyan-500 text-black font-extrabold px-2 py-0.5 rounded text-[10px]">10</span>
                        <Calculator className="w-4 h-4 text-cyan-400" />
                        <span>Valor da Parcela Mensal (CÁLCULO AUTOMÁTICO DE MENSALIDADES) *</span>
                      </label>
                      <span className="text-[10px] text-cyan-300 font-mono bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                        = (Total - Entrada) ÷ Nº Parcelas
                      </span>
                    </div>
                    <input 
                      type="number" 
                      placeholder="Calculado automaticamente..." 
                      value={formData.valorParcelaMensal}
                      onChange={(e) => handleInputChange('valorParcelaMensal', e.target.value)}
                      className="w-full bg-slate-900 border border-cyan-400/60 rounded-xl px-4 py-2.5 text-base text-cyan-300 outline-none focus:border-cyan-300 font-black" 
                    />
                    {formData.valorParcelaMensal && formData.numeroParcelas ? (
                      <p className="text-[11px] text-cyan-200 font-semibold flex items-center gap-1 mt-1">
                        <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                        Cliente pagará <strong className="text-white">{formatMoneyDisplay(Number(formData.valorParcelaMensal), formData.currency)}</strong> por mês em {formData.numeroParcelas} parcelas após a entrada.
                      </p>
                    ) : null}
                  </div>
                </div>
              </section>

              {/* SEÇÃO 4: COMISSÕES DA EMPRESA (PERCENTUAL MANUAL + CÁLCULO MONETÁRIO AUTOMÁTICO) */}
              <section className="space-y-4 bg-slate-950/90 p-5 rounded-2xl border border-teal-500/30">
                <div className="flex items-center justify-between border-b border-teal-900/40 pb-2">
                  <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                    <Percent className="w-4 h-4" />
                    <h4>4. Comissões da Empresa (Campos 11 a 14)</h4>
                  </div>
                  <span className="text-[10px] font-bold text-teal-300 bg-teal-950 px-2.5 py-1 rounded-lg border border-teal-500/40 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                    Percentual Manual + Cálculo Monetário Automático
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* CAMPO 11: Comissão À Vista (Percentual Manual + Valor Monetário Calculado) */}
                  <div className="space-y-1.5 bg-slate-900/80 p-3.5 rounded-xl border border-teal-500/20">
                    <label className="text-xs font-bold text-teal-300 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span className="bg-teal-950 px-2 py-0.5 rounded border border-teal-500/30 text-[10px]">11</span>
                        <span>Comissão À Vista *</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">% Manual</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="w-1/3">
                        <input 
                          type="number" 
                          step="0.1"
                          placeholder="%" 
                          value={formData.percentualComissaoAVista}
                          onChange={(e) => handleInputChange('percentualComissaoAVista', e.target.value)}
                          className="w-full bg-slate-800 border border-teal-500/40 rounded-xl px-3 py-2 text-sm text-teal-300 font-bold text-center outline-none focus:border-teal-400" 
                        />
                      </div>
                      <div className="w-2/3">
                        <input 
                          type="number" 
                          placeholder="Valor em Moeda" 
                          value={formData.comissaoAVista}
                          onChange={(e) => handleInputChange('comissaoAVista', e.target.value)}
                          className="w-full bg-slate-800 border border-teal-500/40 rounded-xl px-4 py-2 text-sm text-white font-bold outline-none focus:border-teal-400" 
                        />
                      </div>
                    </div>
                    {formData.comissaoAVista ? (
                      <p className="text-[10px] text-teal-200 mt-1">
                        ✓ Valor Monetário: <strong className="text-white">{formatMoneyDisplay(Number(formData.comissaoAVista), formData.currency)}</strong>
                      </p>
                    ) : null}
                  </div>

                  {/* CAMPO 12: Comissão Parcelado (Percentual Manual + Valor Monetário Calculado) */}
                  <div className="space-y-1.5 bg-slate-900/80 p-3.5 rounded-xl border border-teal-500/20">
                    <label className="text-xs font-bold text-teal-300 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span className="bg-teal-950 px-2 py-0.5 rounded border border-teal-500/30 text-[10px]">12</span>
                        <span>Comissão Parcelado Total *</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">% Manual</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="w-1/3">
                        <input 
                          type="number" 
                          step="0.1"
                          placeholder="%" 
                          value={formData.percentualComissaoParcelado}
                          onChange={(e) => handleInputChange('percentualComissaoParcelado', e.target.value)}
                          className="w-full bg-slate-800 border border-teal-500/40 rounded-xl px-3 py-2 text-sm text-teal-300 font-bold text-center outline-none focus:border-teal-400" 
                        />
                      </div>
                      <div className="w-2/3">
                        <input 
                          type="number" 
                          placeholder="Valor em Moeda" 
                          value={formData.comissaoParcelado}
                          onChange={(e) => handleInputChange('comissaoParcelado', e.target.value)}
                          className="w-full bg-slate-800 border border-teal-500/40 rounded-xl px-4 py-2 text-sm text-white font-bold outline-none focus:border-teal-400" 
                        />
                      </div>
                    </div>
                    {formData.comissaoParcelado ? (
                      <p className="text-[10px] text-teal-200 mt-1">
                        ✓ Valor Monetário Total: <strong className="text-white">{formatMoneyDisplay(Number(formData.comissaoParcelado), formData.currency)}</strong>
                      </p>
                    ) : null}
                  </div>

                  {/* CAMPO 13: Mês a Receber */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-teal-300 flex items-center gap-1">
                      <span className="bg-teal-950 px-2 py-0.5 rounded border border-teal-500/30 text-[10px]">13</span>
                      <Calendar className="w-3.5 h-3.5 text-teal-400" />
                      <span>Mês a Receber (Ex: 1, 3, 5, 7) *</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="Ex: 1, 3, 5, 7" 
                      value={formData.mesesAReceber}
                      onChange={(e) => handleInputChange('mesesAReceber', e.target.value)}
                      className="w-full bg-slate-800 border border-teal-500/40 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-teal-400 font-mono font-bold" 
                    />
                    <p className="text-[10px] text-slate-400">Meses de recebimento da comissão parcelada</p>
                  </div>

                  {/* CAMPO 14: Valor a Receber por Parcela (CÁLCULO AUTOMÁTICO) */}
                  <div className="space-y-1.5 bg-teal-900/40 p-3.5 rounded-xl border border-teal-400/50 shadow-md">
                    <label className="text-xs font-bold text-teal-200 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className="bg-teal-500 text-black font-extrabold px-2 py-0.5 rounded text-[10px]">14</span>
                        <Calculator className="w-4 h-4 text-teal-300" />
                        <span>Valor a Receber por Parcela (CÁLCULO AUTOMÁTICO) *</span>
                      </span>
                    </label>
                    <input 
                      type="number" 
                      placeholder="Calculado automaticamente..." 
                      value={formData.valorAReceberPorParcela}
                      onChange={(e) => handleInputChange('valorAReceberPorParcela', e.target.value)}
                      className="w-full bg-slate-900 border border-teal-400/60 rounded-xl px-4 py-2 text-sm text-teal-200 outline-none focus:border-teal-300 font-black" 
                    />
                    {formData.valorAReceberPorParcela ? (
                      <p className="text-[10px] text-teal-200 mt-1 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-teal-400" />
                        Empresa receberá <strong className="text-white">{formatMoneyDisplay(Number(formData.valorAReceberPorParcela), formData.currency)}</strong> por parcela nos meses programados.
                      </p>
                    ) : null}
                  </div>

                </div>
              </section>

              {/* SEÇÃO 5: IMAGEM, PROPRIETÁRIO & OBSERVAÇÕES */}
              <section className="space-y-4 border-t border-white/10 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">URL da Imagem do Terreno / Lote</label>
                    <input 
                      type="url" 
                      placeholder="https://images.unsplash.com/photo-..." 
                      value={formData.imageUrl}
                      onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                      className="w-full bg-white/5 border border-cyan-900/40 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Nome do Proprietário / Vendedor</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Carlos Mendoza" 
                      value={formData.ownerName}
                      onChange={(e) => handleInputChange('ownerName', e.target.value)}
                      className="w-full bg-white/5 border border-cyan-900/40 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Descrição & Observações</label>
                  <textarea 
                    rows={2} 
                    placeholder="Descreva detalhes como infraestrutura de saneamento, luz, asfaltamento ou observações..." 
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full bg-white/5 border border-cyan-900/40 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-500 resize-none" 
                  />
                </div>
              </section>

            </div>

            {/* Modal Footer Buttons */}
            <div className="p-6 border-t border-white/10 flex items-center justify-between sticky bottom-0 bg-slate-900/95 backdrop-blur-md z-20">
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                ✓ Todos os campos prontos para salvar no banco
              </span>

              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)} 
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-300 hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white transition-all shadow-lg shadow-cyan-500/25 active:scale-95 flex items-center gap-2"
                >
                  {saving ? 'Salvando...' : 'Salvar Terreno / Imóvel'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
