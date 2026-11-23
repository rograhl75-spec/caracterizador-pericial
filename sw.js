/* Service worker do Caracterizador Pericial: permite abrir o app sem internet.
   Estratégia: rede primeiro (sempre a versão mais nova quando há conexão) e cópia local como reserva.
   Ao incluir um arquivo novo no site, acrescente-o em ARQUIVOS e mude VERSAO. */
const VERSAO = 'v3';
const CACHE = 'caracterizador-' + VERSAO;
const ARQUIVOS = [
  './', 'index.html', 'termos.html', 'privacidade.html', 'manifest.webmanifest', 'css/estilo.css',
  'js/marca.js', 'js/motor.js', 'js/app.js',
  'dados/biblioteca.js', 'dados/normas-base.js', 'dados/nr15-anexo11.js', 'dados/nr15-anexo13.js', 'dados/in128-artigos.js',
  'dados/atualizacoes.js', 'dados/nr16.js', 'dados/fontes.js', 'dados/alertas.js', 'dados/glossario.js', 'dados/novidades.js',
  'img/logo-grahl.png', 'img/timbrado-a4-retrato.jpg', 'img/timbrado-a4-paisagem.jpg', 'img/icone-192.png', 'img/icone-512.png'
];

self.addEventListener('install', ev => {
  ev.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', ev => {
  ev.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('caracterizador-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

function comTempo(promessa, ms) {
  return new Promise((ok, falha) => { const t = setTimeout(() => falha(new Error('tempo')), ms); promessa.then(r => { clearTimeout(t); ok(r); }, e => { clearTimeout(t); falha(e); }); });
}

self.addEventListener('fetch', ev => {
  const req = ev.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  /* fontes do Google: usa a cópia local e atualiza em segundo plano */
  if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    ev.respondWith(caches.open(CACHE).then(async c => {
      const local = await c.match(req);
      const rede = fetch(req).then(r => { if (r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; }).catch(() => local);
      return local || rede;
    }));
    return;
  }
  if (url.origin !== self.location.origin) return;
  /* arquivos do próprio site: rede primeiro, cópia local se estiver sem conexão ou lento */
  ev.respondWith((async () => {
    const c = await caches.open(CACHE);
    try {
      const r = await comTempo(fetch(req), 5000);
      if (r.ok) c.put(req, r.clone());
      return r;
    } catch (e) {
      return (await c.match(req, { ignoreSearch: true })) || (req.mode === 'navigate' ? c.match('index.html') : Response.error());
    }
  })());
});
