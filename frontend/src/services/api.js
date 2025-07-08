// Configuração base da API
const API_BASE_URL = 'http://localhost:8000/api';

// Função auxiliar para fazer requisições
const makeRequest = async (url, options = {}) => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Erro na requisição: ${response.status}`);
  }

  return response.json();
};

// Buscar estatísticas
export const fetchStats = async () => {
  try {
    return await makeRequest(`${API_BASE_URL}/stats/`);
  } catch (error) {
    throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
  }
};

// Buscar pedidos
export const fetchOrders = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Adicionar parâmetros de filtro
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value);
      }
    });

    // Garantir que sempre tenha uma página
    if (!params.has('page')) {
      params.append('page', '1');
    }

    const url = `${API_BASE_URL}/orders/?${params.toString()}`;
    return await makeRequest(url);
  } catch (error) {
    throw new Error(`Erro ao buscar pedidos: ${error.message}`);
  }
};

// Buscar fornecedores
export const fetchSuppliers = async () => {
  try {
    return await makeRequest(`${API_BASE_URL}/suppliers/`);
  } catch (error) {
    throw new Error(`Erro ao buscar fornecedores: ${error.message}`);
  }
};

// Buscar recebimentos
export const fetchDeliveries = async () => {
  try {
    return await makeRequest(`${API_BASE_URL}/deliveries/`);
  } catch (error) {
    throw new Error(`Erro ao buscar recebimentos: ${error.message}`);
  }
};

// Verificar saúde da API
export const checkHealth = async () => {
  try {
    return await makeRequest(`${API_BASE_URL}/health/`);
  } catch (error) {
    throw new Error(`Erro ao verificar saúde da API: ${error.message}`);
  }
};

// Export do objeto para compatibilidade
export const apiService = {
  fetchStats,
  fetchOrders,
  fetchSuppliers,
  fetchDeliveries,
  checkHealth,
};

// Export default para compatibilidade
export default apiService;
