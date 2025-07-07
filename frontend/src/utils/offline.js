// Utilitários para funcionalidade offline

// Registrar Service Worker
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registrado com sucesso:', registration);
      
      // Lidar com atualizações do Service Worker
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Nova versão disponível
            console.log('Nova versão do Service Worker disponível');
            
            // Notificar usuário sobre atualização
            if (window.confirm('Nova versão disponível. Deseja atualizar?')) {
              newWorker.postMessage({ type: 'SKIP_WAITING' });
              window.location.reload();
            }
          }
        });
      });
      
      return registration;
    } catch (error) {
      console.error('Erro ao registrar Service Worker:', error);
      return null;
    }
  } else {
    console.log('Service Worker não suportado neste navegador');
    return null;
  }
};

// Verificar status da conexão
export const getConnectionStatus = () => {
  return {
    online: navigator.onLine,
    connection: navigator.connection || navigator.mozConnection || navigator.webkitConnection,
    effectiveType: navigator.connection?.effectiveType || 'unknown'
  };
};

// Monitorar mudanças de conectividade
export const setupConnectivityMonitoring = (onOnline, onOffline) => {
  const handleOnline = () => {
    console.log('Conexão restaurada');
    if (onOnline) onOnline();
  };
  
  const handleOffline = () => {
    console.log('Conexão perdida');
    if (onOffline) onOffline();
  };
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Retornar função de cleanup
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

// Comunicar com Service Worker
export const sendMessageToSW = async (message) => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data);
      };
      
      messageChannel.port1.onerror = (error) => {
        reject(error);
      };
      
      navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);
    });
  }
  
  throw new Error('Service Worker não disponível');
};

// Obter status do cache
export const getCacheStatus = async () => {
  try {
    return await sendMessageToSW({ type: 'GET_CACHE_STATUS' });
  } catch (error) {
    console.error('Erro ao obter status do cache:', error);
    return {};
  }
};

// Limpar cache
export const clearCache = async () => {
  try {
    await sendMessageToSW({ type: 'CLEAR_CACHE' });
    console.log('Cache limpo com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao limpar cache:', error);
    return false;
  }
};

// Forçar sincronização
export const forceSync = async () => {
  try {
    await sendMessageToSW({ type: 'FORCE_SYNC' });
    console.log('Sincronização forçada com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao forçar sincronização:', error);
    return false;
  }
};

// Detectar se a resposta veio do cache
export const isFromCache = (response) => {
  return response && response.headers && response.headers.get('X-From-Cache') === 'true';
};

// Estratégia de retry para requisições falhadas
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      if (i < maxRetries - 1) {
        console.log(`Tentativa ${i + 1} falhou, tentando novamente em ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Backoff exponencial
      }
    }
  }
  
  throw lastError;
};

// Verificar se há dados em cache para uma URL
export const hasCachedData = async (url) => {
  if ('caches' in window) {
    try {
      const cache = await caches.open('chiaperini-api-v1');
      const response = await cache.match(url);
      return !!response;
    } catch (error) {
      console.error('Erro ao verificar cache:', error);
      return false;
    }
  }
  return false;
};

// Obter dados do cache diretamente
export const getCachedData = async (url) => {
  if ('caches' in window) {
    try {
      const cache = await caches.open('chiaperini-api-v1');
      const response = await cache.match(url);
      
      if (response) {
        return await response.json();
      }
    } catch (error) {
      console.error('Erro ao obter dados do cache:', error);
    }
  }
  return null;
};

// Salvar dados no cache manualmente
export const saveToCacheManually = async (url, data) => {
  if ('caches' in window) {
    try {
      const cache = await caches.open('chiaperini-api-v1');
      const response = new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' }
      });
      
      await cache.put(url, response);
      console.log('Dados salvos no cache:', url);
      return true;
    } catch (error) {
      console.error('Erro ao salvar no cache:', error);
      return false;
    }
  }
  return false;
};

// Configurar notificações de sincronização
export const setupSyncNotifications = (onSyncComplete) => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      const { type, timestamp } = event.data;
      
      if (type === 'SYNC_COMPLETE') {
        console.log('Sincronização completa:', new Date(timestamp));
        if (onSyncComplete) onSyncComplete(timestamp);
      }
    });
  }
};

// Verificar capacidade de armazenamento
export const getStorageInfo = async () => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      return {
        quota: estimate.quota,
        usage: estimate.usage,
        available: estimate.quota - estimate.usage,
        percentage: Math.round((estimate.usage / estimate.quota) * 100)
      };
    } catch (error) {
      console.error('Erro ao obter informações de armazenamento:', error);
    }
  }
  
  return {
    quota: 'Desconhecido',
    usage: 'Desconhecido',
    available: 'Desconhecido',
    percentage: 0
  };
};

// Limpar dados antigos do cache baseado em idade
export const cleanOldCache = async (maxAge = 24 * 60 * 60 * 1000) => { // 24 horas
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        
        for (const request of requests) {
          const response = await cache.match(request);
          const dateHeader = response.headers.get('date');
          
          if (dateHeader) {
            const responseDate = new Date(dateHeader);
            const now = new Date();
            
            if (now - responseDate > maxAge) {
              await cache.delete(request);
              console.log('Cache antigo removido:', request.url);
            }
          }
        }
      }
    } catch (error) {
      console.error('Erro ao limpar cache antigo:', error);
    }
  }
};

