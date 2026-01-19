const CACHE_NAME = 'essence-app-cache-v2'; // ← Incrementei a versão para forçar atualização

const urlsToCache = [
  '/',
  '/pwa_manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-512x512-maskable.png',
  '/icons/apple-touch-icon.png',
  '/logo.png', 
  '/favicon.ico',
  '/apple-icon.png',
  '/icon.svg',
];

// URLs que NUNCA devem ser cacheadas (APIs, autenticação, dados dinâmicos)
const NEVER_CACHE_PATTERNS = [
  /\/api\//,                    // Todas as API routes do Next.js
  /supabase/,                   // Qualquer chamada para Supabase
  /\.supabase\.co/,             // Domínio do Supabase
  /auth/,                       // Rotas de autenticação
  /stripe/,                     // Chamadas do Stripe
  /checkout/,                   // Página de checkout
  /success/,                    // Página de sucesso
  /profiles/,                   // Dados de perfil
  /subscription/,               // Dados de subscription
  /_next\/data/,                // Next.js data fetching
  /rest\/v1/,                   // Supabase REST API
];

// Verifica se a URL deve ser ignorada do cache
function shouldNotCache(url) {
  return NEVER_CACHE_PATTERNS.some(pattern => pattern.test(url));
}

// Instalação: Armazena os ativos estáticos no cache
self.addEventListener('install', event => {
  console.log('[SW] Instalando nova versão...');
  
  // Força ativação imediata da nova versão
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Cache aberto, adicionando arquivos estáticos');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('[SW] Falha ao adicionar URLs ao cache:', error);
      })
  );
});

// Ativação: Limpa caches antigos e assume controle imediato
self.addEventListener('activate', event => {
  console.log('[SW] Ativando nova versão...');
  
  event.waitUntil(
    Promise.all([
      // Limpa caches antigos
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Assume controle de todas as páginas imediatamente
      self.clients.claim()
    ])
  );
});

// Fetch: Estratégia inteligente
self.addEventListener('fetch', event => {
  const url = event.request.url;
  
  // 1. Ignora requisições que não são GET
  if (event.request.method !== 'GET') {
    return;
  }
  
  // 2. CRÍTICO: Nunca cachear APIs, Supabase, Stripe, etc.
  if (shouldNotCache(url)) {
    console.log('[SW] Bypass cache (API/dinâmico):', url);
    event.respondWith(
      fetch(event.request).catch(error => {
        console.error('[SW] Falha na requisição de API:', error);
        throw error;
      })
    );
    return;
  }
  
  // 3. Para arquivos estáticos: Cache-First
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          // Retorna do cache, mas também atualiza em background
          fetch(event.request).then(networkResponse => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, networkResponse);
              });
            }
          }).catch(() => {});
          
          return response;
        }
        
        // Não está no cache, busca na rede
        return fetch(event.request).then(response => {
          // Só cacheia respostas válidas de arquivos estáticos
          if (!response || response.status !== 200) {
            return response;
          }
          
          // Verifica se é um arquivo estático (não dados dinâmicos)
          const contentType = response.headers.get('content-type') || '';
          const isStaticAsset = 
            contentType.includes('image/') ||
            contentType.includes('text/css') ||
            contentType.includes('application/javascript') ||
            contentType.includes('font/') ||
            url.endsWith('.png') ||
            url.endsWith('.jpg') ||
            url.endsWith('.svg') ||
            url.endsWith('.ico') ||
            url.endsWith('.woff') ||
            url.endsWith('.woff2');
          
          if (isStaticAsset) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          
          return response;
        }).catch(error => {
          console.error('[SW] Falha ao buscar recurso:', error);
          // Retorna página offline se existir
          // return caches.match('/offline.html');
        });
      })
  );
});

// Listener para mensagens (permite limpar cache manualmente)
self.addEventListener('message', event => {
  if (event.data === 'CLEAR_CACHE') {
    console.log('[SW] Limpando todo o cache...');
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        caches.delete(cacheName);
      });
    });
  }
  
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
