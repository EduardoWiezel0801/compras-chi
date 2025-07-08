// Serviço de cache simplificado
class SimpleCacheService {
  constructor() {
    this.cache = new Map();
    this.CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutos
  }

  set(key, data) {
    try {
      this.cache.set(key, {
        data,
        timestamp: Date.now(),
        expiry: Date.now() + this.CACHE_EXPIRY
      });
    } catch (error) {
      console.warn('Erro ao salvar no cache:', error);
    }
  }

  get(key) {
    try {
      const cached = this.cache.get(key);
      if (!cached) return null;

      // Verificar se expirou
      if (Date.now() > cached.expiry) {
        this.cache.delete(key);
        return null;
      }

      return cached.data;
    } catch (error) {
      console.warn('Erro ao recuperar do cache:', error);
      return null;
    }
  }

  remove(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  getAge(key) {
    const cached = this.cache.get(key);
    return cached ? Date.now() - cached.timestamp : null;
  }

  has(key) {
    return this.get(key) !== null;
  }
}

// Exportar instância única
export const cacheService = new SimpleCacheService();
export default cacheService;
