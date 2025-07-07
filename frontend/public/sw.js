// Service Worker para funcionalidade offline
const CACHE_NAME = 'chiaperini-pedidos-v1';
const API_CACHE_NAME = 'chiaperini-api-v1';

// Recursos para cache estático
const STATIC_RESOURCES = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// URLs da API para cache
const API_URLS = [
  '/api/stats/',
  '/api/orders/',
  '/api/suppliers/',
  '/api/deliveries/',
  '/api/health/'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  
  event.waitUntil(
    Promise.all([
      // Cache de recursos estáticos
      caches.open(CACHE_NAME).then((cache) => {
        console.log('Service Worker: Cache de recursos estáticos criado');
        return cache.addAll(STATIC_RESOURCES);
      }),
      // Cache da API
      caches.open(API_CACHE_NAME).then((cache) => {
        console.log('Service Worker: Cache da API criado');
        return cache;
      })
    ])
  );
  
  // Força a ativação imediata
  self.skipWaiting();
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Ativando...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Remove caches antigos
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('Service Worker: Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Assume controle imediato
  self.clients.claim();
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Estratégia para recursos estáticos
  if (request.destination === 'document' || 
      request.destination === 'script' || 
      request.destination === 'style') {
    event.respondWith(cacheFirstStrategy(request, CACHE_NAME));
    return;
  }
  
  // Estratégia para API
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request, API_CACHE_NAME));
    return;
  }
  
  // Para outros recursos, tentar rede primeiro
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request);
    })
  );
});

// Estratégia Cache First (para recursos estáticos)
async function cacheFirstStrategy(request, cacheName) {
  try {
    // Tentar buscar no cache primeiro
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Se não estiver no cache, buscar na rede
    const networkResponse = await fetch(request);
    
    // Adicionar ao cache se a resposta for válida
    if (networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Erro na estratégia Cache First:', error);
    
    // Fallback para página offline se disponível
    if (request.destination === 'document') {
      return caches.match('/offline.html') || new Response('Offline', { status: 503 });
    }
    
    return new Response('Recurso não disponível offline', { status: 503 });
  }
}

// Estratégia Network First (para API)
async function networkFirstStrategy(request, cacheName) {
  try {
    // Tentar buscar na rede primeiro
    const networkResponse = await fetch(request);
    
    // Se a resposta for válida, atualizar o cache
    if (networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Rede indisponível, buscando no cache:', request.url);
    
    // Se a rede falhar, buscar no cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Adicionar header para indicar que é cache
      const response = cachedResponse.clone();
      response.headers.set('X-From-Cache', 'true');
      return response;
    }
    
    // Se não houver cache, retornar erro
    return new Response(
      JSON.stringify({ 
        error: 'Dados não disponíveis offline',
        offline: true 
      }), 
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Sincronização em background (quando a rede voltar)
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Sincronização em background');
  
  if (event.tag === 'background-sync') {
    event.waitUntil(syncData());
  }
});

// Função para sincronizar dados
async function syncData() {
  try {
    console.log('Service Worker: Sincronizando dados...');
    
    // Atualizar cache da API com dados mais recentes
    const cache = await caches.open(API_CACHE_NAME);
    
    for (const url of API_URLS) {
      try {
        const response = await fetch(url);
        if (response.status === 200) {
          await cache.put(url, response.clone());
          console.log('Service Worker: Cache atualizado para:', url);
        }
      } catch (error) {
        console.log('Service Worker: Erro ao sincronizar:', url, error);
      }
    }
    
    // Notificar clientes sobre a sincronização
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        timestamp: Date.now()
      });
    });
    
  } catch (error) {
    console.error('Service Worker: Erro na sincronização:', error);
  }
}

// Lidar com mensagens dos clientes
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_CACHE_STATUS':
      getCacheStatus().then(status => {
        event.ports[0].postMessage(status);
      });
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
      
    case 'FORCE_SYNC':
      syncData().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
  }
});

// Obter status do cache
async function getCacheStatus() {
  try {
    const cacheNames = await caches.keys();
    const status = {};
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      status[cacheName] = {
        count: keys.length,
        urls: keys.map(req => req.url)
      };
    }
    
    return status;
  } catch (error) {
    console.error('Erro ao obter status do cache:', error);
    return {};
  }
}

// Limpar todos os caches
async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('Service Worker: Todos os caches foram limpos');
  } catch (error) {
    console.error('Erro ao limpar caches:', error);
  }
}

// Monitorar mudanças de conectividade
self.addEventListener('online', () => {
  console.log('Service Worker: Conexão restaurada');
  syncData();
});

self.addEventListener('offline', () => {
  console.log('Service Worker: Conexão perdida');
});

