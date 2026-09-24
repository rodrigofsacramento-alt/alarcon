import { useState, useEffect, useCallback } from 'react';
import { fetchCambiosChacoRates, CambiosChacoRates } from '../services/cambiosChacoService';

export function useCambiosChaco() {
  const [rates, setRates] = useState<CambiosChacoRates | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadRates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCambiosChacoRates();
      setRates(data);
    } catch (err: any) {
      setError(err?.message || 'Erro ao carregar cotações');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRates();
    // Atualiza a cada 15 minutos
    const interval = setInterval(loadRates, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadRates]);

  return { rates, loading, error, refreshRates: loadRates };
}
