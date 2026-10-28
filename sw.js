const V='dl-v1',SHELL=['./','css/style.css','js/app.js','js/data.js','js/art.js','js/i18n.js','js/hero-core.js','js/hero.worker.js','favicon.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
e.respondWith(caches.match(r).then(h=>{const n=fetch(r).then(res=>{if(res.ok)caches.open(V).then(c=>c.put(r,res.clone()));return res}).catch(()=>h);return h||n}))});
