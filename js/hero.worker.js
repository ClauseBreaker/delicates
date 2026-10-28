import { createHero } from './hero-core.js';
let hero;
self.onmessage = ({ data: m }) => {
  if (m.t === 'init') { hero = createHero(m.canvas, { reduced: m.reduced }); hero.resize(m.w, m.h, m.dpr); hero.start(); }
  else if (m.t === 'size') hero.resize(m.w, m.h, m.dpr);
  else if (m.t === 'ptr') hero.pointer(m.x, m.y, m.on);
  else if (m.t === 'run') hero.run(m.on);
};
