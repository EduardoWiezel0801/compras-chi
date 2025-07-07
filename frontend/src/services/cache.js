// Serviço de cache para funcionalidade offline
class CacheService {
  constructor() {
    this.CACHE_PREFIX = 'chiaperini_';
    this.CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutos
  }

  // Salvar dados no cache
  set(key, data) {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        expiry: Date.now() + this.CACHE_EXPIRY,
      };
      localStorage.setItem(this.CACHE_PREFIX + key, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Erro ao salvar no cache:', error);
    }
  }

  // Recuperar dados do cache
  get(key) {
    try {
      const cached = localStorage.getItem(this.CACHE_PREFIX + key);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      
      // Verificar se o cache expirou
      if (Date.now() > cacheData.expiry) {
        this.remove(key);
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.error('Erro ao recuperar do cache:', error);
      return null;
    }
  }

  // Remover item do cache
  remove(key) {
    try {
      localStorage.removeItem(this.CACHE_PREFIX + key);
    } catch (error) {
      console.error('Erro ao remover do cache:', error);
    }
  }

  // Limpar todo o cache
  clear() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Erro ao limpar cache:', error);
    }
  }

  // Verificar se existe cache válido
  has(key) {
    return this.get(key) !== null;
  }

  // Obter idade do cache em minutos
  getAge(key) {
    try {
      const cached = localStorage.getItem(this.CACHE_PREFIX + key);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      return Math.floor((Date.now() - cacheData.timestamp) / (1000 * 60));
    } catch (error) {
      console.error('Erro ao verificar idade do cache:', error);
      return null;
    }
  }
}

export const cacheService = new CacheService();
export default cacheService;

