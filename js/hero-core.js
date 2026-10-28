// Hero scene: a rotating 3D cheese wedge + rising "cheese-hole" bubbles + gold dust.
// Runs inside a Worker on an OffscreenCanvas (main-thread fallback shares this exact code).
const TAU = Math.PI * 2;

export function createHero(canvas, { reduced = false } = {}) {
  const ctx = canvas.getContext('2d', { alpha: true });
  let W = 0, H = 0, dpr = 1, running = true, raf = 0;
  const ptr = { x: 0, y: 0, tx: 0, ty: 0, on: false };
  let yaw = -0.05, pitch = 0.42, spin = 0;
  let bubbles = [], dust = [];
  const R = Math.random;

  const mk = (i) => ({ x: R() * W, y: i === 1 ? H + R() * 80 : R() * H, r: 4 + R() * 26, vy: 0.08 + R() * 0.35, ph: R() * TAU, hue: R() });
  const mkd = () => ({ x: R() * W, y: R() * H, vx: (R() - .5) * .2, vy: -0.05 - R() * .25, s: .6 + R() * 1.8, ph: R() * TAU });

  function resize(w, h, d) {
    W = w; H = h; dpr = d;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    const nb = Math.min(34, Math.round((W * H) / 42000));
    bubbles = Array.from({ length: nb }, () => mk(0));
    dust = Array.from({ length: Math.min(90, Math.round((W * H) / 16000)) }, mkd);
    if (reduced || !running) draw(0);
  }

  // ---- tiny 3D ------------------------------------------------------------
  const tri = [[-1.35, 0], [1.1, -1.0], [1.1, 1.0]]; // x,z of triangular prism
  const Hh = 0.62;
  function rot([x, y, z]) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
    return [x1, y * cp + z1 * sp, -y * sp + z1 * cp];
  }
  const sc = () => Math.min(W * 0.18, H * 0.3, 250);
  const cx = () => (W > 820 ? W * 0.74 : W * 0.5), cyy = () => (W > 820 ? H * 0.5 : H * 0.3);
  function proj(p) { const q = rot(p), k = 1 / (1 + q[2] * 0.09); return [cx() + q[0] * sc() * k, cyy() - q[1] * sc() * k, q[2], k]; }

  // face = origin O, axes U (unit), V (unit), size lu, lv, normal n, base color
  function faces() {
    const y0 = -Hh / 2, y1 = Hh / 2, out = [];
    const T = tri.map(([x, z]) => [x, z]);
    const side = (a, b, col, kind) => {
      const ax = T[a][0], az = T[a][1], bx = T[b][0], bz = T[b][1];
      const dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz);
      const U = [dx / L, 0, dz / L], n = [dz / L, 0, -dx / L];
      out.push({ O: [ax, y0, az], U, V: [0, 1, 0], lu: L, lv: Hh, n, col, kind });
    };
    side(0, 1, [252, 200, 64], 'side'); // left long face
    side(2, 0, [252, 200, 64], 'side'); // right long face
    side(1, 2, [214, 130, 30], 'rind'); // back rind
    // top (triangle) – drawn separately as polygon with holes
    out.push({ top: true, n: [0, 1, 0], col: [255, 214, 90] });
    return out;
  }
  const FACES = faces();
  const light = [-0.3, 0.7, -0.65]; // camera-space light
  const shade = (n, col, k = 1) => {
    const q = rot(n), l = light;
    const d = Math.max(0, q[0] * l[0] + q[1] * l[1] + q[2] * l[2]) * 0.5 + 0.6;
    return `rgb(${Math.min(255, col[0] * d * k) | 0} ${Math.min(255, col[1] * d * k) | 0} ${Math.min(255, col[2] * d * k) | 0})`;
  };

  const HOLES = [[.22, .3, .1], [.5, .6, .14], [.78, .3, .08], [.65, .78, .07], [.35, .78, .06], [.9, .62, .05], [.12, .65, .05]];

  function drawSide(f) {
    const o = proj(f.O), pu = proj([f.O[0] + f.U[0], f.O[1], f.O[2] + f.U[2]]), pv = proj([f.O[0], f.O[1] + 1, f.O[2]]);
    const sc2 = 1;
    ctx.save();
    ctx.transform(pu[0] - o[0], pu[1] - o[1], pv[0] - o[0], pv[1] - o[1], o[0], o[1]);
    // local space: u in [0,lu] (world), v in [0,1] (up) → note v goes y up, screen flips via matrix
    const g = ctx.createLinearGradient(0, 0, f.lu, 0);
    const base = shade(f.n, f.col, 1), hi = shade(f.n, f.col, 1.18);
    g.addColorStop(0, hi); g.addColorStop(.5, base); g.addColorStop(1, shade(f.n, f.col, .86));
    ctx.fillStyle = g; ctx.fillRect(0, 0, f.lu, Hh);
    if (f.kind === 'side') {
      for (const [hx, hy, hr] of HOLES) {
        const x = hx * f.lu, y = hy * Hh, r = hr * Hh * 1.7;
        ctx.fillStyle = shade(f.n, [205, 135, 20], .95); ctx.beginPath(); ctx.ellipse(x, y, r, r * 1.0, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = shade(f.n, [170, 104, 10], .9); ctx.beginPath(); ctx.ellipse(x - r * .12, y - r * .1, r * .78, r * .8, 0, 0, TAU); ctx.fill();
      }
    } else {
      ctx.strokeStyle = 'rgba(120,60,0,.25)'; ctx.lineWidth = .015;
      for (let i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(0, (Hh * i) / 5); ctx.lineTo(f.lu, (Hh * i) / 5); ctx.stroke(); }
    }
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,240,180,.22)'; ctx.lineWidth = 1.2;
  }

  function drawTop(f) {
    const pts = tri.map(([x, z]) => proj([x, Hh / 2, z]));
    ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath();
    ctx.fillStyle = shade(f.n, f.col, 1.05); ctx.fill();
    ctx.save(); ctx.clip();
    for (const [hx, hy, hr] of [[.3, .5, .09], [.55, .35, .07], [.55, .68, .08], [.78, .5, .05]]) {
      const x = -1.35 + hx * 2.45, z = (hy - .5) * 2, p = proj([x, Hh / 2, z]);
      ctx.fillStyle = 'rgba(150,92,8,.8)'; ctx.beginPath(); ctx.ellipse(p[0], p[1], hr * sc() * p[3], hr * sc() * p[3] * .75, 0, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }

  function wedge() {
    // soft ground shadow + glow
    const gx = cx(), gy = cyy() + sc() * 0.95;
    let g = ctx.createRadialGradient(gx, gy, 0, gx, gy, sc() * 1.6);
    g.addColorStop(0, 'rgba(0,0,0,.45)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save(); ctx.translate(0, 0); ctx.scale(1, 1); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(gx, gy, sc() * 1.5, sc() * .32, 0, 0, TAU); ctx.fill(); ctx.restore();
    g = ctx.createRadialGradient(cx(), cyy(), 0, cx(), cyy(), sc() * 2.2);
    g.addColorStop(0, 'rgba(244,195,51,.28)'); g.addColorStop(1, 'rgba(244,195,51,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    const vis = FACES.filter((f) => rot(f.n)[2] < 0.02 || f.top).map((f) => {
      let depth;
      if (f.top) depth = proj([0, Hh / 2, 0])[2] - 5; // top first? top is drawn last for correctness unless below horizon
      else depth = proj([f.O[0] + f.U[0] * f.lu / 2, 0, f.O[2] + f.U[2] * f.lu / 2])[2];
      return { f, depth };
    });
    vis.sort((a, b) => b.depth - a.depth);
    // top face is always visible with pitch>0 and sits above the sides: draw it last.
    const sides = vis.filter((v) => !v.f.top), top = vis.find((v) => v.f.top);
    for (const v of sides) drawSide(v.f);
    if (top) drawTop(top.f);
  }

  function draw(t) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    for (const b of bubbles) {
      const dx = b.x - ptr.x, dy = b.y - ptr.y, d = Math.hypot(dx, dy);
      if (ptr.on && d < 150) { const f = (1 - d / 150) * 1.6; b.x += (dx / d) * f; b.y += (dy / d) * f; }
      b.y -= b.vy; b.x += Math.sin(t / 1800 + b.ph) * .25;
      if (b.y < -b.r * 2) { b.y = H + b.r * 2; b.x = R() * W; }
      const g = ctx.createRadialGradient(b.x - b.r * .3, b.y - b.r * .3, b.r * .1, b.x, b.y, b.r);
      g.addColorStop(0, `rgba(255,236,150,${.22 + b.hue * .15})`); g.addColorStop(.7, 'rgba(244,195,51,.06)'); g.addColorStop(1, 'rgba(244,195,51,.0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, TAU); ctx.fill();
      ctx.strokeStyle = `rgba(255,230,140,${.12 + b.hue * .12})`; ctx.lineWidth = 1; ctx.stroke();
    }
    for (const p of dust) {
      p.x += p.vx + (ptr.on ? (ptr.x - W / 2) * 0.00004 : 0); p.y += p.vy;
      if (p.y < -5) { p.y = H + 5; p.x = R() * W; }
      const a = .35 + .35 * Math.sin(t / 700 + p.ph);
      ctx.fillStyle = `rgba(255,222,120,${a})`; ctx.fillRect(p.x, p.y, p.s, p.s);
    }
    ctx.globalCompositeOperation = 'source-over';
    wedge();
  }

  let last = 0;
  function loop(t) {
    if (!running) return;
    const dt = Math.min(48, t - last || 16); last = t;
    ptr.x += (ptr.tx - ptr.x) * .2; ptr.y += (ptr.ty - ptr.y) * .2;
    spin += dt * 0.00028;
    const px = ptr.on ? (ptr.x / W - .5) : 0, py = ptr.on ? (ptr.y / H - .5) : 0;
    yaw = -.05 + Math.sin(spin * 2.2) * .6 + px * .9;
    pitch = .42 + py * .25 + Math.sin(spin * 3.1) * .04;
    draw(t);
    raf = requestAnimationFrame(loop);
  }

  return {
    resize,
    pointer(x, y, on) { ptr.tx = x; ptr.ty = y; ptr.on = on; if (!on) return; if (!ptr.x && !ptr.y) { ptr.x = x; ptr.y = y; } },
    run(on) { if (on === running && raf) return; running = on; cancelAnimationFrame(raf); raf = 0; if (on && !reduced) raf = requestAnimationFrame(loop); },
    start() { if (reduced) draw(0); else { running = true; raf = requestAnimationFrame(loop); } },
  };
}
