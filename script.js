// ==========================================================================
// NINJA KEYS — interações
// ==========================================================================

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', () => {
  initTimer();
  initReveal();
  initDecor();
  initStickyBar();
  initCarousel();
  initLightbox();
});

// 0. Cronômetro da oferta (10 min). O fim fica salvo no navegador, então
//    recarregar a página não reinicia a contagem. Ao zerar, o cronômetro some.
function initTimer() {
  const el = document.getElementById('timer');
  const box = document.getElementById('timerBox');
  if (!el) return;

  const KEY = 'nk_offer_end_10m';
  const DURATION = 10 * 60 * 1000;
  let end = Number(localStorage.getItem(KEY));
  if (!end) {
    end = Date.now() + DURATION;
    try { localStorage.setItem(KEY, String(end)); } catch (e) {}
  }

  const tick = () => {
    const left = Math.max(0, end - Date.now());
    if (left === 0) {
      if (box) box.hidden = true;
      clearInterval(id);
      return;
    }
    const m = Math.floor(left / 60000);
    const s = Math.floor((left % 60000) / 1000);
    el.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };
  const id = setInterval(tick, 1000);
  tick();
}

// 1. Revelação ao rolar: fade + slide, com atraso escalonado entre irmãos
//    (cards da mesma grade entram um depois do outro) e contagem dos números.
function initReveal() {
  const items = document.querySelectorAll('.reveal');

  // Escalonamento: cada .reveal recebe um atraso pela posição entre os irmãos
  items.forEach(el => {
    const siblings = Array.from(el.parentElement.children).filter(c => c.classList.contains('reveal'));
    const i = siblings.indexOf(el);
    if (i > 0) el.style.setProperty('--d', `${Math.min(i, 5) * 80}ms`);
  });

  const onIn = (el) => {
    el.classList.add('is-in');
    el.querySelectorAll('[data-count]').forEach(countUp);
  };

  if (!('IntersectionObserver' in window) || prefersReducedMotion) {
    items.forEach(onIn);
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        onIn(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
  items.forEach(el => io.observe(el));

  initTilt();
}

// Peças 3D de fundo: aparecem ao entrar na tela e fazem parallax suave ao rolar.
// O cálculo só roda enquanto a seção está visível e uma vez por frame.
function initDecor() {
  const decors = Array.from(document.querySelectorAll('.decor'));
  if (!decors.length) return;

  if (!('IntersectionObserver' in window) || prefersReducedMotion) {
    decors.forEach(d => d.classList.add('is-in'));
    return;
  }

  const visible = new Set();
  let ticking = false;

  const update = () => {
    ticking = false;
    const vh = window.innerHeight;
    const strength = window.innerWidth < 768 ? 40 : 90; // px de deslocamento
    visible.forEach(d => {
      const r = d.parentElement.getBoundingClientRect();
      // -1 quando a seção está entrando por baixo, +1 quando sai por cima
      const p = Math.max(-1, Math.min(1, (vh / 2 - (r.top + r.height / 2)) / vh));
      d.style.setProperty('--py', `${(-p * strength).toFixed(1)}px`);
      d.style.setProperty('--pr', `${(p * 6).toFixed(2)}deg`);
    });
  };
  const onScroll = () => {
    if (!ticking && visible.size) { ticking = true; requestAnimationFrame(update); }
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const d = entry.target.querySelector('.decor');
      if (!d) return;
      if (entry.isIntersecting) { visible.add(d); d.classList.add('is-in'); }
      else visible.delete(d);
    });
    onScroll();
  }, { rootMargin: '10% 0px 10% 0px' });

  decors.forEach(d => io.observe(d.parentElement));
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
}

// Conta de 0 até o valor (em reais), com desaceleração no final
function countUp(el) {
  const target = parseFloat(el.dataset.count);
  if (!target || el.dataset.counted) return;
  el.dataset.counted = '1';
  const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const duration = 1100;
  const start = performance.now() + 250;
  const frame = (now) => {
    const t = Math.min(1, Math.max(0, (now - start) / duration));
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = fmt.format(target * eased);
    if (t < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

// Inclinação suave do cartão de licença seguindo o mouse (só desktop com mouse)
function initTilt() {
  const area = document.querySelector('.hero-visual');
  const card = document.querySelector('.license');
  if (!area || !card || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  let raf = 0;
  area.addEventListener('pointermove', (e) => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const r = area.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--ry', `${(x * 10).toFixed(2)}deg`);
      card.style.setProperty('--rx', `${(-y * 8).toFixed(2)}deg`);
      card.style.setProperty('--shine', `${(x * 40).toFixed(0)}px`);
    });
  });
  area.addEventListener('pointerleave', () => {
    cancelAnimationFrame(raf);
    card.style.setProperty('--ry', '0deg');
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--shine', '0px');
  });
}

// 2. Barra fixa mobile: aparece depois do hero, some nos planos e no CTA final
function initStickyBar() {
  const bar = document.getElementById('stickyBar');
  const hero = document.getElementById('hero');
  if (!bar || !hero || !('IntersectionObserver' in window)) return;

  const link = bar.querySelector('a');
  const hideZones = ['planos', 'finalCta'].map(id => document.getElementById(id)).filter(Boolean);
  let pastHero = false;
  const inZone = new Set();

  const update = () => {
    const show = pastHero && inZone.size === 0;
    bar.classList.toggle('is-visible', show);
    bar.setAttribute('aria-hidden', show ? 'false' : 'true');
    if (link) link.tabIndex = show ? 0 : -1;
  };

  new IntersectionObserver(([entry]) => {
    pastHero = !entry.isIntersecting && entry.boundingClientRect.top < 0;
    update();
  }).observe(hero);

  const zoneObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) inZone.add(entry.target);
      else inZone.delete(entry.target);
    });
    update();
  }, { threshold: 0.05 });
  hideZones.forEach(z => zoneObserver.observe(z));
}

// 3. Carrossel 3D de depoimentos (coverflow)
//    Cada slide recebe --off (posição relativa ao centro, pode ser fracionária
//    durante o arraste) e --abs; o CSS transforma isso em profundidade e rotação.
function initCarousel() {
  const root = document.getElementById('carousel');
  const stage = document.getElementById('carouselTrack');
  if (!root || !stage) return;
  const slides = Array.from(stage.querySelectorAll('.slide'));
  const n = slides.length;
  if (!n) return;

  const dots = document.getElementById('carouselDots');
  const prev = document.getElementById('carouselPrev');
  const next = document.getElementById('carouselNext');

  let pos = 0;        // posição atual (inteira quando parado)
  let timer = null;

  slides.forEach((s, i) => {
    s.setAttribute('role', 'group');
    s.setAttribute('aria-roledescription', 'slide');
    s.setAttribute('aria-label', `${i + 1} de ${n}`);
    s.addEventListener('click', () => {
      if (moved) return;
      const i0 = mod(Math.round(pos), n);
      if (i === i0) openLightbox(s);
      else go(pos + wrap(i - pos));
      restart();
    });
    if (dots) {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', `Depoimento ${i + 1}`);
      b.addEventListener('click', () => { go(pos + wrap(i - pos)); restart(); });
      dots.appendChild(b);
    }
  });

  function mod(a, m) { return ((a % m) + m) % m; }
  function wrap(d) { // menor distância circular
    d = mod(d + n / 2, n) - n / 2;
    return d;
  }

  function layout() {
    const active = mod(Math.round(pos), n);
    slides.forEach((s, i) => {
      const off = n > 2 ? wrap(i - pos) : i - pos;
      const abs = Math.abs(off);
      s.style.setProperty('--off', off.toFixed(3));
      s.style.setProperty('--abs', abs.toFixed(3));
      s.style.zIndex = String(100 - Math.round(abs * 10));
      s.style.visibility = abs > 2.6 ? 'hidden' : 'visible';
      const isActive = i === active;
      s.classList.toggle('is-active', isActive);
      s.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });
    if (dots) dots.querySelectorAll('button').forEach((b, i) =>
      b.setAttribute('aria-selected', i === active ? 'true' : 'false'));
  }

  function go(p) { pos = Math.round(p); layout(); }

  // Autoplay (pausa com mouse em cima, foco, arraste ou movimento reduzido)
  function start() {
    if (prefersReducedMotion || n < 2) return;
    clearInterval(timer);
    timer = setInterval(() => go(pos + 1), 5000);
  }
  function stop() { clearInterval(timer); }
  function restart() { stop(); start(); }

  prev && prev.addEventListener('click', () => { go(pos - 1); restart(); });
  next && next.addEventListener('click', () => { go(pos + 1); restart(); });
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);
  root.addEventListener('focusin', stop);
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { go(pos - 1); e.preventDefault(); }
    if (e.key === 'ArrowRight') { go(pos + 1); e.preventDefault(); }
  });

  // Arraste: o carrossel acompanha o dedo/mouse e encaixa no slide mais próximo
  let startX = 0, startPos = 0, dragging = false, moved = false;
  const gap = () => parseFloat(getComputedStyle(root).getPropertyValue('--gap')) || 200;

  stage.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    dragging = true; moved = false;
    startX = e.clientX; startPos = pos;
    stop();
  });
  window.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    if (!moved && Math.abs(dx) > 6) { moved = true; stage.classList.add('is-dragging'); }
    if (moved) { pos = startPos - dx / gap(); layout(); }
  });
  const end = () => {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove('is-dragging');
    if (moved) {
      // um arraste curto e rápido já troca de slide
      const delta = pos - startPos;
      go(Math.abs(delta) > 0.15 && Math.abs(delta) < 0.5 ? startPos + Math.sign(delta) : pos);
      setTimeout(() => { moved = false; }, 0);
    }
    start();
  };
  window.addEventListener('pointerup', end);
  window.addEventListener('pointercancel', end);

  // Só roda o autoplay quando a seção está na tela
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => entry.isIntersecting ? start() : stop(), { threshold: 0.3 }).observe(root);
  } else {
    start();
  }

  layout();
  requestAnimationFrame(() => requestAnimationFrame(() => stage.classList.add('is-ready')));
}

// Abre o print do slide no lightbox (definido em initLightbox)
let openLightbox = () => {};

// 4. Lightbox para ampliar os prints
function initLightbox() {
  const box = document.getElementById('lightbox');
  const img = document.getElementById('lightboxImg');
  const close = document.getElementById('lightboxClose');
  if (!box || !img) return;

  let lastFocus = null;
  const open = (src, alt) => {
    lastFocus = document.activeElement;
    img.src = src;
    img.alt = alt;
    box.hidden = false;
    close && close.focus();
  };
  const shut = () => {
    box.hidden = true;
    lastFocus && lastFocus.focus();
  };

  // O carrossel chama isto ao clicar no slide central
  openLightbox = (slide) => {
    const el = slide.querySelector('img');
    if (el) open(el.currentSrc || el.src, el.alt);
  };
  close && close.addEventListener('click', shut);
  box.addEventListener('click', e => { if (e.target === box) shut(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !box.hidden) shut(); });
}

// Compatibilidade: chamadas antigas a scrollToPlans()
function scrollToPlans() {
  const el = document.getElementById('planos');
  if (el) el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
}
