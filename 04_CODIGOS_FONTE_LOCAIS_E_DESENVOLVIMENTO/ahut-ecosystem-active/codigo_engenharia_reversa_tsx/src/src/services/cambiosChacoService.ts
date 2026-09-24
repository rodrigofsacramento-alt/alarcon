export interface ExchangeRateData {
  currency: string;
  symbol: string;
  purchaseRate: number; // Taxa de Compra
  saleRate: number;     // Taxa de Venda
  lastUpdated: string;
}

export interface CambiosChacoRatesResponse {
  usdPyg: ExchangeRateData;
  brlPyg: ExchangeRateData;
  usdBrl: ExchangeRateData;
  updatedAt: string;
  isLive: boolean;
  USD_PYG: number;
  BRL_PYG: number;
}

export type CambiosChacoRates = CambiosChacoRatesResponse;

// Cotações padrão de reserva (fallback) caso a API da Cambios Chaco esteja indisponível ou bloqueada por CORS
const FALLBACK_RATES: CambiosChacoRatesResponse = {
  usdPyg: {
    currency: 'USD/PYG',
    symbol: '$',
    purchaseRate: 7750,
    saleRate: 7820,
    lastUpdated: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  },
  brlPyg: {
    currency: 'BRL/PYG',
    symbol: 'R$',
    purchaseRate: 1350,
    saleRate: 1385,
    lastUpdated: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  },
  usdBrl: {
    currency: 'USD/BRL',
    symbol: 'R$',
    purchaseRate: 5.55,
    saleRate: 5.62,
    lastUpdated: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  },
  updatedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
  isLive: false,
  USD_PYG: 7820,
  BRL_PYG: 1385,
};

export async function fetchCambiosChacoRates(): Promise<CambiosChacoRatesResponse> {
  try {
    const response = await fetch('https://www.cambioschaco.com.py/api/v1/cotaciones', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      
      if (data && Array.isArray(data)) {
        const usdItem = data.find((item: any) => item.iso === 'USD' || item.moneda === 'DOLAR');
        const brlItem = data.find((item: any) => item.iso === 'BRL' || item.moneda === 'REAL');

        const usdSale = Number(usdItem?.venda || usdItem?.sale || 7820);
        const usdPurchase = Number(usdItem?.compra || usdItem?.purchase || 7750);
        const brlSale = Number(brlItem?.venda || brlItem?.sale || 1385);
        const brlPurchase = Number(brlItem?.compra || brlItem?.purchase || 1350);

        return {
          usdPyg: {
            currency: 'USD/PYG',
            symbol: '$',
            purchaseRate: usdPurchase,
            saleRate: usdSale,
            lastUpdated: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          },
          brlPyg: {
            currency: 'BRL/PYG',
            symbol: 'R$',
            purchaseRate: brlPurchase,
            saleRate: brlSale,
            lastUpdated: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          },
          usdBrl: {
            currency: 'USD/BRL',
            symbol: 'R$',
            purchaseRate: Number((usdPurchase / brlSale).toFixed(2)),
            saleRate: Number((usdSale / brlPurchase).toFixed(2)),
            lastUpdated: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          },
          updatedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          isLive: true,
          USD_PYG: usdSale,
          BRL_PYG: brlSale,
        };
      }
    }
  } catch (err) {
    console.warn('API Cambios Chaco indisponível ou com restrição CORS. Utilizando cotações de referência atualizadas.', err);
  }

  return FALLBACK_RATES;
}
