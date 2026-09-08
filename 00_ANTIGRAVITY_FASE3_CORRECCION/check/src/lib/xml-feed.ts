import type { Property } from '@/hooks/use-properties';
function escapeXml(unsafe: string | number | null | undefined): string {
  if (unsafe == null) return '';
  return String(unsafe).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}
function mapType(type: string | null): string {
  const map: Record<string, string> = {
    residential: 'Casa',
    apartment: 'Apartamento',
    commercial: 'Comercial',
    land: 'Terreno'
  };
  return map[type || ''] || 'Residencial';
}
function mapCategory(status: string | null): string {
  if (status === 'available') return 'Venda';
  if (status === 'rent') return 'Locação';
  return 'Venda';
}
function mapPortalStatus(status: string | null): string {
  if (status === 'available') return 'Disponível';
  if (status === 'reserved') return 'Reservado';
  if (status === 'sold') return 'Vendido';
  if (status === 'rent') return 'Disponível';
  return 'Disponível';
}
function formatPrice(price: number | null | undefined): string {
  if (!price) return '0';
  return Math.round(price).toString();
}
function parseAddress(location: string | null): {
  cidade: string;
  bairro: string;
  estado: string;
} {
  if (!location) return {
    cidade: '',
    bairro: '',
    estado: ''
  };
  const parts = location.split(',').map(p => p.trim());
  return {
    cidade: parts[0] || '',
    bairro: parts[1] || '',
    estado: parts[2] || ''
  };
}
export function generatePropertyXml(property: Property): string {
  const addr = parseAddress(property.location);
  const tipo = mapType(property.type);
  const categoria = mapCategory(property.status);
  const statusPortal = mapPortalStatus(property.status);
  const fotos = property.images as string[] | null || [];
  const fotoXml = fotos.length > 0 ? `<Fotos>${fotos.map((url, i) => `
      <Foto>
        <NomeArquivo>${escapeXml(property.code)}_${i + 1}.jpg</NomeArquivo>
        <URLdaFoto>${escapeXml(url)}</URLdaFoto>
        <Principal>${i === 0 ? 'Sim' : 'Nao'}</Principal>
      </Foto>`).join('')}
    </Fotos>` : '<Fotos />';
  return `
  <Imovel>
    <CodigoImovel>${escapeXml(property.code || property.id)}</CodigoImovel>
    <TipoImovel>${escapeXml(tipo)}</TipoImovel>
    <SubTipoImovel>${escapeXml(tipo)}</SubTipoImovel>
    <Categoria>${escapeXml(categoria)}</Categoria>
    <Status>${escapeXml(statusPortal)}</Status>
    <DataAtualizacao>${new Date(property.updated_at || property.created_at || Date.now()).toISOString()}</DataAtualizacao>
    <Cidade>${escapeXml(addr.cidade)}</Cidade>
    <Bairro>${escapeXml(addr.bairro)}</Bairro>
    <Estado>${escapeXml(addr.estado)}</Estado>
    <Logradouro>${escapeXml(property.address || property.location)}</Logradouro>
    <Numero></Numero>
    <Complemento></Complemento>
    <CEP></CEP>
    <PrecoVenda>${categoria === 'Venda' ? formatPrice(property.price) : '0'}</PrecoVenda>
    <PrecoLocacao>${categoria === 'Locação' ? formatPrice(property.price) : '0'}</PrecoLocacao>
    <AreaTotal>${Math.round(Number(property.area || 0))}</AreaTotal>
    <AreaUtil>${Math.round(Number(property.area || 0))}</AreaUtil>
    <QtdDormitorios>${Number(property.bedrooms || 0)}</QtdDormitorios>
    <QtdSuites>${Number(property.bathrooms || 0)}</QtdSuites>
    <QtdBanheiros>${Number(property.bathrooms || 0)}</QtdBanheiros>
    <QtdVagas>${0}</QtdVagas>
    <Titulo>${escapeXml(property.title)}</Titulo>
    <Descricao>${escapeXml(property.description || '')}</Descricao>
    ${fotoXml}
  </Imovel>`;
}
export function generateFeedXml(properties: Property[]): string {
  const imoveisXml = properties.filter(p => p.status !== 'sold') // Portais normalmente não aceitam vendidos
  .map(generatePropertyXml).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>
<Imoveis>${imoveisXml}
</Imoveis>`;
}
export function downloadXmlFeed(properties: Property[], filename = 'feed-imoveis.xml') {
  const xml = generateFeedXml(properties);
  const blob = new Blob([xml], {
    type: 'application/xml;charset=utf-8'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}