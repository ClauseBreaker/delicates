import { CATS, P } from './data.js';
import { paintArt } from './art.js';
import { T, LANGS } from './i18n.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const store = {
  get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
};
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const WA = '994555003410';

const prods = P.map(([id, cat, name, price, old, state, unit, brand]) => ({ id, cat, name, price, old, state, unit, brand, hay: name.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i') }));
const byId = new Map(prods.map((p) => [p.id, p]));
const catById = new Map(CATS.map((c) => [+c.id.slice(1), c]));
const norm = (s) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i').replace(/ə/g, 'e');

let lang = store.get('dl.lang');
if (!LANGS.includes(lang)) lang = /^az/i.test(navigator.language) ? 'az' : /^ru/i.test(navigator.language) ? 'ru' : /^en/i.test(navigator.language) ? 'en' : 'ru';
const S = { cat: 0, q: '', sort: 'def', stock: false };
let cart = new Map();
try { cart = new Map(JSON.parse(store.get('dl.cart') || '[]').filter(([id]) => byId.has(id))); } catch {}

let t = T[lang], nf;
const money = (v) => `${nf.format(v)} ₼`;
const moneyH = (v) => `${nf.format(v)}<span class="cur">₼</span>`;
const disp = (n) => n.replace(/(\d+)\s*qr\b/gi, `$1 ${t.g}`).replace(/(\d+)\s*kq\b/gi, `$1 ${t.kg}`).replace(/\bgr\b/gi, t.g);
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const unitTxt = (u) => (u === 1 ? t.per100 : u === 2 ? t.perKg : '');
const step = (p) => (p.unit === 2 ? 0.5 : 1);
const qtyTxt = (p, q) => (p.unit === 1 ? `${q * 100} ${t.g}` : p.unit === 2 ? `${q} ${t.kg}` : `× ${q}`);

// ---------- cards ---------------------------------------------------------
const artCache = new Map();
const io = new IntersectionObserver((es) => {
  for (const e of es) {
    if (!e.isIntersecting) continue;
    io.unobserve(e.target);
    const id = +e.target.dataset.id, p = byId.get(id);
    let cv = artCache.get(id);
    if (!cv) { cv = document.createElement('canvas'); paintArt(cv, p.cat, p.id, catById.get(p.cat).hue); artCache.set(id, cv); }
    e.target.replaceChildren(cv);
  }
}, { rootMargin: '400px 0px' });

function card(p) {
  const off = p.old ? Math.round((1 - p.price / p.old) * 100) : 0;
  const dead = p.state !== 0;
  return `<article class="card${dead ? ' dead' : ''}" data-id="${p.id}">
  <div class="art" data-id="${p.id}">${off ? `<span class="tag">−${off}%</span>` : ''}${dead ? `<span class="tag so">${t.soldout}</span>` : ''}</div>
  <div class="body">
    ${p.brand ? `<small>${esc(p.brand)}</small>` : `<small>${esc(catById.get(p.cat).n[lang])}</small>`}
    <h3>${esc(disp(p.name))}</h3>
    <div class="foot-c"><div class="price"><b>${moneyH(p.price)}</b>${p.old ? `<s>${moneyH(p.old)}</s>` : ''}${p.unit ? `<i>${unitTxt(p.unit)}</i>` : ''}</div>
    <button class="add" data-add="${p.id}" ${dead ? 'disabled' : ''} aria-label="${t.add}: ${esc(p.name)}"><svg viewBox="0 0 24 24"><path d="M5 12h14"/><path d="M12 5v14"/></svg></button></div>
  </div></article>`;
}
function mount(el, list) {
  el.innerHTML = list.map(card).join('');
  $$('.art', el).forEach((a) => { const c = artCache.get(+a.dataset.id); c ? a.prepend(c) : io.observe(a); });
}

function visible() {
  const q = norm(S.q.trim());
  let l = prods.filter((p) => (!S.cat || p.cat === S.cat) && (!S.stock || p.state === 0) && (!q || q.split(/\s+/).every((w) => p.hay.includes(w) || norm(p.name).includes(w))));
  if (S.sort === 'asc') l = [...l].sort((a, b) => a.price - b.price);
  else if (S.sort === 'desc') l = [...l].sort((a, b) => b.price - a.price);
  else if (S.sort === 'disc') l = [...l].sort((a, b) => (b.old ? 1 - b.price / b.old : 0) - (a.old ? 1 - a.price / a.old : 0));
  return l;
}
function renderGrid() {
  const l = visible();
  mount($('#grid'), l);
  $('#none').hidden = l.length > 0;
  $('#foundCount').textContent = t.found(l.length);
}
const withVT = (fn) => (document.startViewTransition && !reduced ? document.startViewTransition(fn) : fn());

function renderChips() {
  const all = `<button role="tab" class="chip" aria-selected="${!S.cat}" data-cat="0">${t.all}<i>${prods.length}</i></button>`;
  $('#chips').innerHTML = all + CATS.map((c) => { const id = +c.id.slice(1); return `<button role="tab" class="chip" aria-selected="${S.cat === id}" data-cat="${id}">${esc(c.n[lang])}<i>${prods.filter((p) => p.cat === id).length}</i></button>`; }).join('');
}
function renderRail() {
  $('#catRail').innerHTML = CATS.map((c) => { const id = +c.id.slice(1); return `<button class="tile" data-cat="${id}" style="--h:${c.hue}"><div class="art" data-rail="${id}"></div><span>${esc(c.n[lang])}</span></button>`; }).join('');
  $$('[data-rail]').forEach((a) => {
    const id = +a.dataset.rail, key = 'r' + id; let cv = artCache.get(key);
    if (!cv) { cv = document.createElement('canvas'); paintArt(cv, id, 900 + id, catById.get(id).hue); artCache.set(key, cv); }
    a.append(cv);
  });
}
function renderDeals() {
  const l = prods.filter((p) => p.old && p.state === 0).sort((a, b) => b.old / b.price - a.old / a.price).slice(0, 12);
  mount($('#dealRail'), l);
}
function renderMarquee() {
  const b = ['Borges', 'Valio', 'Svalya', 'Elle&Vire', 'Pittoresque', 'Emborg', 'Yayla', 'Sveza', 'Brest-Litovsk', 'Savushkin', 'Friendship', 'Lotus', 'TEOS'];
  const row = b.map((x) => `<span>${x}</span><i></i>`).join('');
  $('#marquee').innerHTML = row + row;
}

// ---------- i18n ----------------------------------------------------------
function applyLang() {
  t = T[lang]; nf = new Intl.NumberFormat(t.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  document.documentElement.lang = lang; document.title = t.title;
  $('meta[name=description]').content = t.desc;
  $$('[data-i18n]').forEach((e) => { if (t[e.dataset.i18n]) e.textContent = t[e.dataset.i18n]; });
  $$('[data-i18n-html]').forEach((e) => { e.innerHTML = t[e.dataset.i18nHtml]; });
  $$('[data-i18n-ph]').forEach((e) => { e.placeholder = t[e.dataset.i18nPh]; });
  $$('.lang button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.lang === lang));
  $('#cartBtn').setAttribute('aria-label', t.cart);
  renderChips(); renderRail(); renderDeals(); renderGrid(); renderCart();
}
$('.lang').addEventListener('click', (e) => {
  const b = e.target.closest('[data-lang]'); if (!b || b.dataset.lang === lang) return;
  lang = b.dataset.lang; store.set('dl.lang', lang); withVT(applyLang);
});

// ---------- filters -------------------------------------------------------
function setCat(id, scroll) {
  S.cat = id; withVT(() => { renderChips(); renderGrid(); });
  if (scroll) $('#catalog').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
}
$('#chips').addEventListener('click', (e) => { const b = e.target.closest('[data-cat]'); if (b) setCat(+b.dataset.cat); });
$('#catRail').addEventListener('click', (e) => { const b = e.target.closest('[data-cat]'); if (b) setCat(+b.dataset.cat, true); });
let tm; $('#q').addEventListener('input', (e) => { clearTimeout(tm); tm = setTimeout(() => { S.q = e.target.value; renderGrid(); }, 90); });
$('#sort').addEventListener('change', (e) => { S.sort = e.target.value; withVT(renderGrid); });
$('#stock').addEventListener('change', (e) => { S.stock = e.target.checked; withVT(renderGrid); });

// ---------- cart ----------------------------------------------------------
const dlg = $('#cart');
const save = () => store.set('dl.cart', JSON.stringify([...cart]));
function toast(msg) { const el = $('#toast'); el.textContent = msg; el.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('on'), 1400); }
function renderCart() {
  const items = [...cart].map(([id, q]) => [byId.get(id), q]);
  const n = items.length, sum = items.reduce((s, [p, q]) => s + p.price * q, 0);
  const cnt = $('#cartCount'); cnt.hidden = !n; cnt.textContent = n;
  $('#lines').innerHTML = n ? items.map(([p, q]) => `<div class="line"><div><b>${esc(disp(p.name))}</b><small>${moneyH(p.price)} ${unitTxt(p.unit)}</small></div>
    <div class="qty"><button data-q="${p.id}" data-d="-1" aria-label="−">−</button><span>${qtyTxt(p, q)}</span><button data-q="${p.id}" data-d="1" aria-label="+">+</button></div>
    <strong>${moneyH(p.price * q)}</strong></div>`).join('') : `<p class="empty">${t.empty}</p>`;
  $('#total').innerHTML = moneyH(sum);
  const wa = $('#wa'); wa.toggleAttribute('hidden', !n);
  $('#clear').hidden = !n;
  const text = `${t.hello}\n` + items.map(([p, q]) => `• ${disp(p.name)} — ${qtyTxt(p, q)} — ${money(p.price * q)}`).join('\n') + `\n${t.total}: ${money(sum)}`;
  wa.href = `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;
}
function add(id, d = 1) {
  const p = byId.get(id), q = Math.round(((cart.get(id) || 0) + d * step(p)) * 2) / 2;
  q > 0 ? cart.set(id, q) : cart.delete(id); save(); renderCart();
}
document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-add]');
  if (a) { add(+a.dataset.add); toast(t.added); a.classList.add('pop'); setTimeout(() => a.classList.remove('pop'), 400); }
  const q = e.target.closest('[data-q]'); if (q) { e.preventDefault(); add(+q.dataset.q, +q.dataset.d); }
});
$('#cartBtn').addEventListener('click', () => dlg.showModal());
dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
$('#clear').addEventListener('click', () => { cart.clear(); save(); renderCart(); });

// ---------- hero canvas (OffscreenCanvas worker → main-thread fallback) ----
async function hero() {
  const cv = $('#heroCanvas'), box = $('#hero');
  const size = () => { const r = box.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), dpr: Math.min(devicePixelRatio || 1, 2) }; };
  let api;
  const s0 = size();
  if ('OffscreenCanvas' in window && cv.transferControlToOffscreen && location.protocol !== 'file:') {
    try {
      const w = new Worker(new URL('./hero.worker.js', import.meta.url), { type: 'module' });
      const off = cv.transferControlToOffscreen();
      w.postMessage({ t: 'init', canvas: off, reduced, ...s0 }, [off]);
      api = { size: (s) => w.postMessage({ t: 'size', ...s }), ptr: (x, y, on) => w.postMessage({ t: 'ptr', x, y, on }), run: (on) => w.postMessage({ t: 'run', on }) };
    } catch { api = null; }
  }
  if (!api) {
    const { createHero } = await import('./hero-core.js');
    const h = createHero(cv, { reduced }); h.resize(s0.w, s0.h, s0.dpr); h.start();
    api = { size: (s) => h.resize(s.w, s.h, s.dpr), ptr: (x, y, on) => h.pointer(x, y, on), run: (on) => h.run(on) };
  }
  new ResizeObserver(() => api.size(size())).observe(box);
  new IntersectionObserver(([e]) => api.run(e.isIntersecting && !document.hidden)).observe(box);
  document.addEventListener('visibilitychange', () => api.run(!document.hidden));
  box.addEventListener('pointermove', (e) => { const r = box.getBoundingClientRect(); api.ptr(e.clientX - r.left, e.clientY - r.top, true); }, { passive: true });
  box.addEventListener('pointerleave', () => api.ptr(0, 0, false));
}

// ---------- misc ----------------------------------------------------------
function counters() {
  $$('[data-count]').forEach((el) => {
    const to = +el.dataset.count; if (reduced) return;
    const t0 = performance.now(), d = 1400;
    const f = (n) => { const k = Math.min(1, (n - t0) / d); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  });
}
function reveal() {
  if (CSS.supports('animation-timeline: view()')) return; // pure-CSS scroll-driven reveal
  const o = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); o.unobserve(e.target); } }), { threshold: 0.12 });
  $$('.reveal').forEach((e) => o.observe(e));
  document.documentElement.classList.add('io-reveal');
}
const header = $('.site-header'), toTop = $('#toTop');
addEventListener('scroll', () => { header.classList.toggle('stuck', scrollY > 10); toTop.hidden = scrollY < 900; }, { passive: true });
toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));
$('#yr').textContent = new Date().getFullYear();

applyLang(); renderMarquee(); reveal(); counters();
$('#stockCount').dataset.count = prods.filter((p) => p.state === 0).length;
hero();
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}), { once: true });
