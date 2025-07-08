import { useState, useEffect } from 'react';

// Hook simplificado para evitar problemas de dependências
export const useApi = (endpoint, params = {}, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Dados mock para evitar problemas de API
  const mockData = {
    stats: {
      previsto_hoje: 5,
      atrasada: 1,
      previsto_amanha: 2,
      finalizado: 0
    },
    orders: {
      results: [
        {
          id: 1,
          numero_pc: 'PC2024007',
          data_emissao: '2025-01-07',
          fornecedor: { codigo: 'FOR001', razao_social: 'ALPHA MATERIAIS LTDA' },
          quantidade_itens: 5,
          followup: '2025-01-08',
          armazenamento: '01',
          atraso: 0,
          status: 'PENDENTE'
        }
      ],
      count: 1
    }
  };

  // Simular carregamento
  useEffect(() => {
    const timer = setTimeout(() => {
      setData(mockData[endpoint] || null);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [endpoint]);

  // Função de refresh
  const refresh = () => {
    setLoading(true);
    setTimeout(() => {
      setData(mockData[endpoint] || null);
      setLoading(false);
    }, 500);
  };

  return {
    data,
    loading,
    error,
    refresh,
    isOnline,
    cacheAge: null
  };
};

// Hooks específicos
export const useStats = (options = {}) => {
  return useApi('stats', {}, options);
};

export const useOrders = (params = {}, options = {}) => {
  return useApi('orders', params, options);
};

export const useSuppliers = (options = {}) => {
  return useApi('suppliers', {}, options);
};

export const useDeliveries = (params = {}, options = {}) => {
  return useApi('deliveries', params, options);
};
