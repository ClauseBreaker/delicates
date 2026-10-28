// Procedural product art drawn on <canvas>. One painter per category, seeded by product id.
const TAU = Math.PI * 2;
export const rng = (s) => () => ((s = (s + 0x6d2b79f5) | 0), (s = Math.imul(s ^ (s >>> 15), s | 1)), (s ^= s + Math.imul(s ^ (s >>> 7), s | 61)), ((s ^ (s >>> 14)) >>> 0) / 4294967296);
const lin = (c, x0, y0, x1, y1, ...st) => { const g = c.createLinearGradient(x0, y0, x1, y1); st.forEach((s, i) => g.addColorStop(i / (st.length - 1), s)); return g; };
const rad = (c, x, y, r0, r1, ...st) => { const g = c.createRadialGradient(x, y, r0, x, y, r1); st.forEach((s, i) => g.addColorStop(i / (st.length - 1), s)); return g; };
const rr = (c, x, y, w, h, r) => { c.beginPath(); c.roundRect(x, y, w, h, r); };
const ell = (c, x, y, rx, ry, rot = 0) => { c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, TAU); };
const hsl = (h, s, l, a = 1) => `hsl(${h} ${s}% ${l}% / ${a})`;

const P = {
  // 1 pizza
  1(c, s, r) {
    const dough = r() > 0.5 ? '#e0a23d' : '#d4912c';
    c.rotate(r() * TAU);
    ell(c, 0, 0, s * 0.5, s * 0.5); c.fillStyle = rad(c, -s * .1, -s * .1, s * .1, s * .5, '#f2bf63', dough, '#a86a17'); c.fill();
    ell(c, 0, 0, s * 0.43, s * 0.43); c.fillStyle = rad(c, 0, 0, s * .05, s * .43, '#ffd86b', '#f6b93b'); c.fill();
    const v = (r() * 3) | 0;
    for (let i = 0; i < 9; i++) {
      const a = r() * TAU, d = Math.sqrt(r()) * s * 0.34, x = Math.cos(a) * d, y = Math.sin(a) * d;
      if (v === 0 || (v === 2 && i % 2)) { ell(c, x, y, s * .06, s * .06); c.fillStyle = '#b8322c'; c.fill(); ell(c, x - 2, y - 2, s * .02, s * .02); c.fillStyle = '#e0665c'; c.fill(); }
      else if (v === 1) { ell(c, x, y, s * .05, s * .028, a); c.fillStyle = '#4c8a3a'; c.fill(); }
      else { ell(c, x, y, s * .045, s * .045); c.fillStyle = '#6e4a2f'; c.fill(); }
    }
    c.strokeStyle = 'rgba(120,70,10,.35)'; c.lineWidth = 2;
    for (let i = 0; i < 4; i++) { const a = (i * TAU) / 8; c.beginPath(); c.moveTo(Math.cos(a) * s * .43, Math.sin(a) * s * .43); c.lineTo(-Math.cos(a) * s * .43, -Math.sin(a) * s * .43); c.stroke(); }
  },
  // 2 sandwich
  2(c, s, r) {
    const w = s * 0.9, x = -w / 2;
    rr(c, x, s * .12, w, s * .16, s * .06); c.fillStyle = '#d8a35a'; c.fill();
    const layers = [['#7ec14b', .06, 1], ['#e2503f', .05, .92], ['#f3b9a7', .06, .96], ['#ffd24d', .05, .98], ['#7ec14b', .05, 1]];
    let y = s * .12;
    for (const [col, h, k] of layers) { y -= s * h; rr(c, x - (k < 1 ? 0 : s * .03), y, w * (k < 1 ? k : 1.06), s * h + 2, s * .025); c.fillStyle = col; c.fill(); }
    c.beginPath(); c.moveTo(x, y + 2); c.bezierCurveTo(x, y - s * .38, x + w, y - s * .38, x + w, y + 2); c.closePath();
    c.fillStyle = lin(c, 0, y - s * .3, 0, y, '#f0be72', '#cf8f3f'); c.fill();
    for (let i = 0; i < 12; i++) { ell(c, x + w * (.2 + r() * .6), y - s * .24 * r() - s * .03, 3, 1.6, r() * 3); c.fillStyle = '#fff3d1'; c.fill(); }
  },
  // 3 croissant / pies
  3(c, s, r) {
    c.rotate(-0.25 + r() * 0.3);
    for (let i = 0; i < 7; i++) {
      const t = (i - 3) / 3, a = t * 1.15, k = 1 - Math.abs(t) * 0.55;
      c.save(); c.translate(Math.sin(a) * s * .42, -Math.cos(a) * s * .26 + s * .14); c.rotate(a);
      ell(c, 0, 0, s * .17 * k, s * .26 * k); c.fillStyle = lin(c, -s * .1, -s * .2, s * .1, s * .2, '#f7c872', '#d58f33', '#a8661b'); c.fill();
      c.strokeStyle = 'rgba(120,60,0,.25)'; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, s * .12 * k, .6, 2.6); c.stroke();
      c.restore();
    }
  },
  // 4 dessert (cake slice)
  4(c, s, r) {
    const pal = [['#5b3424', '#7a4a33'], ['#c4262e', '#e0525a'], ['#e88a2a', '#f5b360'], ['#f6e4c8', '#ffffff'], ['#d98cb0', '#f4bfd5']][(r() * 5) | 0];
    const w = s * .78, h = s * .4, x = -w / 2, y = -h / 2 + s * .05;
    c.beginPath(); c.moveTo(x, y); c.lineTo(x + w, y); c.lineTo(x + w + s * .1, y - s * .13); c.lineTo(x + s * .1, y - s * .13); c.closePath(); c.fillStyle = pal[1]; c.fill();
    rr(c, x, y, w, h, 6); c.fillStyle = pal[0]; c.fill();
    for (let i = 1; i < 3; i++) { c.fillStyle = '#fff1d6'; c.fillRect(x, y + (h * i) / 3 - 3, w, 6); }
    c.beginPath(); c.moveTo(x + w, y); c.lineTo(x + w + s * .1, y - s * .13); c.lineTo(x + w + s * .1, y + h - s * .13); c.lineTo(x + w, y + h); c.fillStyle = 'rgba(0,0,0,.25)'; c.fill();
    ell(c, x + w * .5, y - s * .1, s * .1, s * .07); c.fillStyle = '#fff6e3'; c.fill();
    ell(c, x + w * .5, y - s * .17, s * .05, s * .05); c.fillStyle = '#c4262e'; c.fill();
  },
  // 5 jar with olives
  5(c, s, r) {
    const w = s * .56, h = s * .74, x = -w / 2, y = -h / 2 + s * .04;
    rr(c, x, y, w, h, s * .09); c.fillStyle = 'rgba(190,220,200,.18)'; c.fill(); c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = 3; c.stroke();
    const black = r() > .5;
    for (let i = 0; i < 14; i++) {
      const ox = x + s * .09 + r() * (w - s * .2), oy = y + h * .3 + r() * h * .6, k = s * .06;
      ell(c, ox, oy, k, k * .8, r() * 3); c.fillStyle = black ? '#2b2a2e' : '#8da63a'; c.fill();
      ell(c, ox, oy, k * .35, k * .28); c.fillStyle = '#d6443a'; c.fill();
    }
    rr(c, x - 3, y - s * .09, w + 6, s * .12, 5); c.fillStyle = lin(c, 0, y - s * .09, 0, y + s * .03, '#f4c333', '#b98a14'); c.fill();
    rr(c, x + w * .15, y + h * .22, w * .7, h * .2, 4); c.fillStyle = 'rgba(255,248,230,.9)'; c.fill();
  },
  // 6 milk / drink
  6(c, s, r) {
    const w = s * .42, h = s * .72, x = -w / 2, y = -h / 2 + s * .04, col = ['#ffffff', '#cfe6ff', '#f3e6d0'][(r() * 3) | 0];
    c.beginPath(); c.moveTo(x, y + s * .12); c.lineTo(x + w * .25, y); c.lineTo(x + w * .75, y); c.lineTo(x + w, y + s * .12); c.lineTo(x + w, y + h); c.lineTo(x, y + h); c.closePath();
    c.fillStyle = lin(c, x, 0, x + w, 0, col, '#e4edf7'); c.fill();
    rr(c, x + w * .12, y + h * .35, w * .76, h * .34, 8); c.fillStyle = '#26427a'; c.fill();
    ell(c, 0, y + h * .52, s * .06, s * .07); c.fillStyle = '#f4c333'; c.fill();
    rr(c, x + w * .3, y - s * .04, w * .4, s * .05, 3); c.fillStyle = '#f4c333'; c.fill();
  },
  // 7 vinegar / sauce
  7(c, s, r) {
    const hue = [350, 28, 285][(r() * 3) | 0], w = s * .34, h = s * .78, x = -w / 2, y = -h / 2 + s * .04;
    c.beginPath(); c.moveTo(x + w * .35, y); c.lineTo(x + w * .65, y); c.lineTo(x + w * .62, y + h * .25); c.bezierCurveTo(x + w * 1.25, y + h * .38, x + w * 1.2, y + h, x + w * .9, y + h); c.lineTo(x + w * .1, y + h); c.bezierCurveTo(x - w * .2, y + h, x - w * .25, y + h * .38, x + w * .38, y + h * .25); c.closePath();
    c.fillStyle = lin(c, x, 0, x + w, 0, hsl(hue, 55, 12), hsl(hue, 60, 28), hsl(hue, 55, 10)); c.fill();
    rr(c, x + w * .35, y - s * .07, w * .3, s * .09, 3); c.fillStyle = '#c9a36b'; c.fill();
    rr(c, x - w * .05, y + h * .52, w * 1.1, h * .26, 5); c.fillStyle = '#f7ecd3'; c.fill();
    ell(c, 0, y + h * .65, s * .035, s * .035); c.fillStyle = hsl(hue, 60, 38); c.fill();
  },
  // 8 oil bottle
  8(c, s, r) {
    const hue = [58, 72, 46][(r() * 3) | 0], w = s * .36, h = s * .8, x = -w / 2, y = -h / 2 + s * .04;
    c.beginPath(); c.moveTo(x + w * .36, y); c.lineTo(x + w * .64, y); c.lineTo(x + w * .6, y + h * .3); c.quadraticCurveTo(x + w * 1.15, y + h * .36, x + w, y + h * .55); c.lineTo(x + w, y + h - 8); c.quadraticCurveTo(x + w, y + h, x + w - 8, y + h); c.lineTo(x + 8, y + h); c.quadraticCurveTo(x, y + h, x, y + h - 8); c.lineTo(x, y + h * .55); c.quadraticCurveTo(x - w * .15, y + h * .36, x + w * .4, y + h * .3); c.closePath();
    c.fillStyle = lin(c, x, 0, x + w, 0, hsl(hue, 80, 28), hsl(hue, 90, 52), hsl(hue, 80, 26)); c.fill();
    c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x + w * .16, y + h * .38, w * .07, h * .5);
    rr(c, x + w * .34, y - s * .06, w * .32, s * .08, 3); c.fillStyle = '#1b2237'; c.fill();
    rr(c, x + w * .08, y + h * .55, w * .84, h * .24, 5); c.fillStyle = '#fbf2dc'; c.fill();
    for (let i = 0; i < 3; i++) { ell(c, -s * .06 + i * s * .06, y + h * .67, s * .022, s * .012, -.6); c.fillStyle = '#6b8e23'; c.fill(); }
  },
  // 9 pasta
  9(c, s, r) {
    c.lineCap = 'round';
    for (let i = 0; i < 6; i++) {
      c.save(); c.translate((r() - .5) * s * .5, (r() - .5) * s * .5); c.rotate(r() * TAU);
      const L = s * .3;
      c.beginPath(); for (let t = -L; t <= L; t += 3) c.lineTo(t, Math.sin(t / 7) * s * .035);
      c.strokeStyle = '#e8b64d'; c.lineWidth = s * .075; c.stroke();
      c.strokeStyle = '#fbe08f'; c.lineWidth = s * .03; c.translate(0, -s * .012); c.stroke();
      c.restore();
    }
  },
  // 10 salami
  10(c, s, r) {
    c.save(); c.rotate(-.35);
    rr(c, -s * .46, -s * .1, s * .62, s * .2, s * .09); c.fillStyle = lin(c, 0, -s * .1, 0, s * .1, '#a63a2e', '#6e1d18'); c.fill(); c.restore();
    for (let k = 0; k < 3; k++) {
      c.save(); c.translate(s * (.16 + k * .13), s * (.14 - k * .11)); ell(c, 0, 0, s * .17, s * .17); c.fillStyle = '#7d2a22'; c.fill();
      ell(c, 0, 0, s * .15, s * .15); c.fillStyle = '#c2493b'; c.fill();
      for (let i = 0; i < 9; i++) { ell(c, (r() - .5) * s * .24, (r() - .5) * s * .24, 3, 3); c.fillStyle = '#f5d5c3'; c.fill(); }
      c.restore();
    }
  },
  // 11 butter
  11(c, s, r) {
    const w = s * .62, h = s * .3, d = s * .22, x = -w / 2, y = -h / 2 + s * .08;
    c.beginPath(); c.moveTo(x, y); c.lineTo(x + d, y - d * .7); c.lineTo(x + w + d, y - d * .7); c.lineTo(x + w, y); c.closePath(); c.fillStyle = '#fff0a8'; c.fill();
    c.beginPath(); c.moveTo(x + w, y); c.lineTo(x + w + d, y - d * .7); c.lineTo(x + w + d, y + h - d * .7); c.lineTo(x + w, y + h); c.closePath(); c.fillStyle = '#e8c75a'; c.fill();
    rr(c, x, y, w, h, 3); c.fillStyle = lin(c, x, y, x + w, y + h, '#f7d96a', '#e3b93c'); c.fill();
    rr(c, x + w * .45, y, w * .55, h, 3); c.fillStyle = lin(c, 0, y, 0, y + h, '#e3e8ee', '#aab4c2'); c.fill();
    ell(c, x + w * .72, y + h * .5, s * .04, s * .04); c.fillStyle = '#1c2a50'; c.fill();
  },
  // 12 weight cheese: wheel + wedge
  12(c, s, r) {
    const hue = [44, 38, 30][(r() * 3) | 0], rx = s * .46, ry = s * .22, hh = s * .2;
    c.save(); c.translate(0, s * .05);
    c.beginPath(); c.moveTo(-rx, 0); c.lineTo(-rx, hh); c.ellipse(0, hh, rx, ry, 0, Math.PI, 0, true); c.lineTo(rx, 0); c.closePath(); c.fillStyle = lin(c, -rx, 0, rx, 0, hsl(hue, 85, 55), hsl(hue, 90, 70), hsl(hue, 80, 42)); c.fill();
    ell(c, 0, 0, rx, ry); c.fillStyle = hsl(hue, 95, 70); c.fill();
    for (let i = 0; i < 5; i++) { ell(c, (r() - .5) * rx * 1.2, (r() - .5) * ry * 1.1, s * .03, s * .018); c.fillStyle = 'rgba(150,92,8,.7)'; c.fill(); }
    c.save(); c.beginPath(); c.moveTo(0, 0); c.lineTo(rx * .95, -ry * .6); c.lineTo(rx, ry * .5); c.closePath(); c.fillStyle = hsl(hue, 70, 45); c.fill(); c.restore();
    c.restore();
  },
  // 13 packaged cheese
  13(c, s, r) {
    const hue = [210, 150, 12, 280, 42][(r() * 5) | 0];
    if (r() > .45) {
      const w = s * .66, h = s * .4, x = -w / 2, y = -h / 2 + s * .08;
      rr(c, x, y, w, h, 10); c.fillStyle = lin(c, x, y, x + w, y + h, '#ffe27a', '#f0b92a'); c.fill();
      for (let i = 0; i < 4; i++) { ell(c, x + w * (.15 + r() * .7), y + h * (.15 + r() * .7), s * .03, s * .03); c.fillStyle = 'rgba(160,100,10,.45)'; c.fill(); }
      rr(c, x, y + h * .35, w, h * .42, 4); c.fillStyle = hsl(hue, 60, 36); c.fill();
      c.fillStyle = '#f4c333'; c.fillRect(x, y + h * .35, w, 4);
      ell(c, 0, y + h * .56, s * .06, s * .06); c.fillStyle = '#fff8e6'; c.fill();
    } else {
      const rx = s * .3, h = s * .26, y = -h / 2 + s * .12;
      c.beginPath(); c.moveTo(-rx, y); c.lineTo(-rx * .85, y + h); c.ellipse(0, y + h, rx * .85, s * .06, 0, Math.PI, 0, true); c.lineTo(rx, y); c.closePath(); c.fillStyle = lin(c, -rx, 0, rx, 0, hsl(hue, 55, 40), hsl(hue, 60, 55), hsl(hue, 55, 34)); c.fill();
      ell(c, 0, y, rx, s * .07); c.fillStyle = '#fff4d6'; c.fill();
      ell(c, 0, y + s * .005, rx * .88, s * .055); c.fillStyle = '#ffe9a6'; c.fill();
      rr(c, -rx * .6, y + h * .35, rx * 1.2, h * .35, 4); c.fillStyle = '#fff8e6'; c.fill();
    }
  },
};

export function paintArt(canvas, cat, id, hue) {
  const dpr = 2, W = 320, H = 240;
  canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
  const c = canvas.getContext('2d'); c.scale(dpr, dpr);
  const r = rng(id * 7919 + cat * 131);
  const bg = c.createRadialGradient(W * .5, H * .42, 4, W * .5, H * .5, Math.max(W, H) * .75);
  bg.addColorStop(0, hsl(hue, 45, 30)); bg.addColorStop(1, hsl((hue + 200) % 360, 40, 11)); c.fillStyle = bg; c.fillRect(0, 0, W, H);
  c.fillStyle = hsl(hue, 90, 65, .07); for (let i = 0; i < 6; i++) { ell(c, r() * W, r() * H, 10 + r() * 40, 10 + r() * 40); c.fill(); }
  const s = Math.min(W, H) * .78;
  ell(c, W / 2, H * .5 + s * .42, s * .36, s * .07); c.fillStyle = 'rgba(0,0,0,.35)'; c.filter = 'blur(6px)'; c.fill(); c.filter = 'none';
  c.save(); c.translate(W / 2, H * .5); (P[cat] || P[13])(c, s, r); c.restore();
}
