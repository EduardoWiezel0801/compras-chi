import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { cacheService } from '../services/cache';

// Hook customizado para gerenciar chamadas da API com cache
export const useApi = (endpoint, params = {}, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const {
    useCache = true,
    autoRefresh = false,
    refreshInterval = 30000, // 30 segundos
  } = options;

  // Gerar chave única para o cache
  const cacheKey = `${endpoint}_${JSON.stringify(params)}`;

  // Função para buscar dados
  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // Verificar cache primeiro (se não for refresh forçado)
      if (useCache && !forceRefresh) {
        const cachedData = cacheService.get(cacheKey);
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          return cachedData;
        }
      }

      // Buscar dados da API
      let response;
      switch (endpoint) {
        case 'stats':
          response = await apiService.getStats();
          break;
        case 'orders':
          response = await apiService.getOrders(params);
          break;
        case 'suppliers':
          response = await apiService.getSuppliers();
          break;
        case 'deliveries':
          response = await apiService.getDeliveries(params);
          break;
        case 'health':
          response = await apiService.healthCheck();
          break;
        default:
          throw new Error(`Endpoint não suportado: ${endpoint}`);
      }

      // Salvar no cache
      if (useCache) {
        cacheService.set(cacheKey, response);
      }

      setData(response);
      return response;
    } catch (err) {
      setError(err);
      
      // Em caso de erro, tentar usar cache como fallback
      if (useCache) {
        const cachedData = cacheService.get(cacheKey);
        if (cachedData) {
          setData(cachedData);
          console.warn('Usando dados em cache devido a erro na API:', err);
          return cachedData;
        }
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint, params, cacheKey, useCache]);

  // Função para refresh manual
  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  // Monitorar status da conexão
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Buscar dados iniciais
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh || !isOnline) return;

    const interval = setInterval(() => {
      fetchData(true);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, isOnline, fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
    isOnline,
    cacheAge: cacheService.getAge(cacheKey),
  };
};

// Hook específico para estatísticas do dashboard
export const useStats = (options = {}) => {
  return useApi('stats', {}, { autoRefresh: true, ...options });
};

// Hook específico para pedidos
export const useOrders = (params = {}, options = {}) => {
  return useApi('orders', params, options);
};

// Hook específico para fornecedores
export const useSuppliers = (options = {}) => {
  return useApi('suppliers', {}, options);
};

// Hook específico para recebimentos
export const useDeliveries = (params = {}, options = {}) => {
  return useApi('deliveries', params, options);
};

