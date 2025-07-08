const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Estatísticas do dashboard
  async getStats() {
    return this.request('/stats/');
  }

  // Pedidos de compra
  async getOrders(params = {}) {
    const searchParams = new URLSearchParams();
    
    // Adicionar parâmetros válidos
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value);
      }
    });
    
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/orders/?${queryString}` : '/orders/';
    
    return this.request(endpoint);
  }

  // Fornecedores
  async getSuppliers() {
    return this.request('/suppliers/');
  }

  // Health check
  async healthCheck() {
    return this.request('/health/');
  }

  // Detalhes de um pedido específico
  async getOrderDetail(id) {
    return this.request(`/orders/${id}/`);
  }

  // Recebimentos
  async getDeliveries(params = {}) {
    const searchParams = new URLSearchParams(params);
    return this.request(`/deliveries/?${searchParams}`);
  }
}

export default new ApiService();