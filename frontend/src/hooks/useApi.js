import { useState, useEffect } from 'react';

// Serviço de API simples
const API_BASE_URL = 'http://localhost:8000/api';

const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export function useStats(options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📊 Buscando estatísticas...');
      const result = await apiRequest('/stats/');
      console.log('📊 Estatísticas recebidas:', result);
      setData(result);
    } catch (err) {
      console.error('❌ Erro ao buscar estatísticas:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    if (options.refreshInterval) {
      const interval = setInterval(fetchStats, options.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [options.refreshInterval]);

  return { data, loading, error, refetch: fetchStats };
}

export function useOrders(params = {}, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value);
        }
      });
      
      const queryString = searchParams.toString();
      const endpoint = queryString ? `/orders/?${queryString}` : '/orders/';
      
      console.log('📋 Buscando pedidos:', endpoint);
      const result = await apiRequest(endpoint);
      console.log('📋 Pedidos recebidos:', result);
      setData(result);
    } catch (err) {
      console.error('❌ Erro ao buscar pedidos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    
    if (options.refreshInterval) {
      const interval = setInterval(fetchOrders, options.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [JSON.stringify(params), options.refreshInterval]);

  return { data, loading, error, refetch: fetchOrders };
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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

  return isOnline;
}