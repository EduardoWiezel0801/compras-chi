// Utilitários para funcionalidade offline

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered successfully:', registration.scope);
          
          // Listener para atualizações
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Nova versão disponível
                console.log('Nova versão do Service Worker disponível');
                
                // Opcional: notificar usuário sobre atualização
                if (confirm('Nova versão disponível. Recarregar página?')) {
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                  window.location.reload();
                }
              }
            });
          });
        })
        .catch((error) => {
          console.error('SW registration failed:', error);
        });
      
      // Listener para controle do SW
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service Worker controller mudou');
        window.location.reload();
      });
    });
  } else {
    console.log('Service Worker não suportado');
  }
}

export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
        console.log('Service Worker removido');
      })
      .catch((error) => {
        console.error('Erro ao remover SW:', error);
      });
  }
}

export function clearAppCache() {
  if ('serviceWorker' in navigator && 'caches' in window) {
    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.success) {
          console.log('Cache limpo com sucesso');
          resolve();
        } else {
          reject('Falha ao limpar cache');
        }
      };
      
      navigator.serviceWorker.controller?.postMessage(
        { type: 'CLEAR_CACHE' },
        [messageChannel.port2]
      );
    });
  }
  
  return Promise.reject('Service Worker não disponível');
}

export function checkOnlineStatus() {
  return navigator.onLine;
}

export function addOnlineStatusListener(callback) {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Retornar função de cleanup
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}