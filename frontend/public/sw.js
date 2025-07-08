// Service Worker para funcionalidade offline
const CACHE_NAME = `chiaperini-cache-${new Date().getTime()}`;
const API_CACHE_NAME = 'chiaperini-api-cache';

// URLs para cache estático
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// URLs da API que devem ser cacheadas
const apiUrlsToCache = [
  '/api/stats/',
  '/api/orders/',
  '/api/suppliers/',
  '/api/health/'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  
  event.waitUntil(
    Promise.all([
      // Cache estático
      caches.open(CACHE_NAME).then((cache) => {
        console.log('Service Worker: Cache estático criado');
        return cache.addAll(urlsToCache);
      }),
      // Cache da API
      caches.open(API_CACHE_NAME).then((cache) => {
        console.log('Service Worker: Cache da API criado');
        return Promise.allSettled(
          apiUrlsToCache.map(url => 
            fetch(url).then(response => {
              if (response.ok) {
                return cache.put(url, response.clone());
              }
            }).catch(err => {
              console.log(`Não foi possível cachear ${url}:`, err);
            })
          )
        );
      })
    ]).then(() => {
      console.log('Service Worker: Instalação concluída');
      return self.skipWaiting();
    })
  );
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Ativando...');
  
  event.waitUntil(
    // Limpar caches antigos
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('Service Worker: Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Ativado e assumindo controle');
      return self.clients.claim();
    })
  );
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  
  // Estratégia para API: Network First, Cache Fallback
  if (requestUrl.pathname.startsWith('/api/')) {
    event.respondWith(
      networkFirstStrategy(event.request)
    );
    return;
  }
  
  // Estratégia para recursos estáticos: Cache First
  event.respondWith(
    cacheFirstStrategy(event.request)
  );
});

// Estratégia Network First (para API)
async function networkFirstStrategy(request) {
  try {
    // Tentar buscar da rede primeiro
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Se sucesso, atualizar cache
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    
    // Se falhou, tentar cache
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Se não tem cache, retornar resposta de erro
    return new Response(
      JSON.stringify({
        error: 'Sem conexão e dados não disponíveis offline',
        offline: true
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Estratégia Cache First (para recursos estáticos)
async function cacheFirstStrategy(request) {
  // Tentar cache primeiro
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Se não tem cache, buscar da rede
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cachear para próximas vezes
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Failed to fetch:', error);
    
    // Retornar página offline se disponível
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match('/');
      if (offlinePage) {
        return offlinePage;
      }
    }
    
    return new Response('Recurso não disponível offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Listener para mensagens do cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});