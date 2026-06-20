/* ================================================================
   LOEX — Interactions & Animations
   - Custom cursor with smooth follower
   - Scroll reveal (IntersectionObserver)
   - Mobile menu
   - Magnetic card effect
   - Contact form feedback
   ================================================================ */

(function () {
  'use strict';

  /* ── CURSOR ── */
  const cursor = document.getElementById('cursor');
  const ring   = document.getElementById('cursorRing');

  if (cursor && ring && window.matchMedia('(pointer: fine)').matches) {
    document.body.style.cursor = 'none';

    let mx = 0, my = 0;
    let rx = 0, ry = 0;

    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top  = my + 'px';
    });

    (function animateRing() {
      rx += (mx - rx) * 0.1;
      ry += (my - ry) * 0.1;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      requestAnimationFrame(animateRing);
    })();

    const hoverEls = document.querySelectorAll(
      'a, button, .service-card, .case-card, .team-card, .testimonial-card, [data-href]'
    );
    hoverEls.forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-active'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-active'));
    });
  }

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── SPLIT HEADINGS — palabras con máscara ── */
  function splitHeading(el) {
    const nodes = Array.from(el.childNodes);
    el.innerHTML = '';
    let w = 0;
    const makeWord = (html) => {
      const line = document.createElement('span');
      line.className = 'split-line';
      const word = document.createElement('span');
      word.className = 'split-word';
      word.style.setProperty('--w', w++);
      word.innerHTML = html;
      line.appendChild(word);
      return line;
    };
    nodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split(/(\s+)/).forEach(part => {
          if (/^\s+$/.test(part)) el.appendChild(document.createTextNode(' '));
          else if (part.length) el.appendChild(makeWord(part));
        });
      } else if (node.nodeName === 'BR') {
        el.appendChild(document.createElement('br'));
      } else {
        el.appendChild(makeWord(node.outerHTML));   // preserva <span> con estilo como una palabra
      }
    });
    el.classList.add('split');
  }
  document.querySelectorAll('[data-split]').forEach(splitHeading);

  /* ── LETTER SWAP — palabra del hero: la palabra rueda letra por letra (MARCA ↔ EMPRESA), automático ── */
  const heroSwap = document.getElementById('heroSwap');
  if (heroSwap) {
    const words = (heroSwap.dataset.words || 'MARCA.,EMPRESA.').split(',').map(w => w.trim());
    const STAGGER = parseFloat(heroSwap.dataset.stagger) || 45;   // ms por letra
    const DUR = parseFloat(heroSwap.dataset.duration) || 520;     // ms del rodado
    const HOLD = parseFloat(heroSwap.dataset.hold) || 1600;       // ms entre cambios
    const EASE = 'cubic-bezier(0.2, 0.7, 0.2, 1.15)';             // resorte con leve rebote
    let idx = 0;

    // Construye una palabra completa como capa (cada letra en su propio span)
    function buildWord(word) {
      const layer = document.createElement('span');
      layer.className = 'ls-word';
      word.split('').forEach(ch => {
        const l = document.createElement('span');
        l.className = 'ls-l';
        l.textContent = ch;
        layer.appendChild(l);
      });
      return layer;
    }

    // Fija el ancho a la palabra más larga (evita saltos de layout)
    function setWidth() {
      const ghost = document.createElement('span');
      const cs = getComputedStyle(heroSwap);
      Object.assign(ghost.style, {
        position: 'absolute', visibility: 'hidden', whiteSpace: 'pre',
        fontFamily: cs.fontFamily, fontWeight: cs.fontWeight,
        fontSize: cs.fontSize, letterSpacing: cs.letterSpacing
      });
      document.body.appendChild(ghost);
      let max = 0;
      words.forEach(w => { ghost.textContent = w; max = Math.max(max, ghost.getBoundingClientRect().width); });
      ghost.remove();
      heroSwap.style.width = Math.ceil(max) + 'px';
    }

    heroSwap.innerHTML = '';
    let current = buildWord(words[0]);
    heroSwap.appendChild(current);
    const sr = document.createElement('span'); sr.className = 'ls-sr';
    sr.textContent = words[0]; heroSwap.appendChild(sr);

    setWidth();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(setWidth);
    window.addEventListener('resize', setWidth, { passive: true });

    let busy = false;
    function swapOnce() {
      if (busy) return;
      busy = true;
      const to = (idx + 1) % words.length;

      const incoming = buildWord(words[to]);
      const inLetters = Array.from(incoming.children);
      inLetters.forEach(l => { l.style.transform = 'translateY(105%)'; });  // empiezan abajo, ocultas
      heroSwap.appendChild(incoming);
      void heroSwap.offsetWidth;                                            // reflow

      const outLetters = Array.from(current.children);
      const n = Math.max(outLetters.length, inLetters.length);

      outLetters.forEach((l, i) => {
        l.style.transition = `transform ${DUR}ms ${EASE}`;
        l.style.transitionDelay = (i * STAGGER) + 'ms';
        l.style.transform = 'translateY(-105%)';                            // salen hacia arriba
      });
      inLetters.forEach((l, i) => {
        l.style.transition = `transform ${DUR}ms ${EASE}`;
        l.style.transitionDelay = (i * STAGGER) + 'ms';
        l.style.transform = 'translateY(0)';                               // entran a su lugar
      });

      const total = DUR + (n - 1) * STAGGER;
      const outgoing = current;
      current = incoming;
      idx = to;
      sr.textContent = words[to];
      setTimeout(() => { outgoing.remove(); busy = false; }, total + 90);
    }

    if (!prefersReduced && words.length > 1) {
      const cycleMs = DUR + Math.max(...words.map(w => w.length)) * STAGGER + HOLD;
      setTimeout(() => {
        swapOnce();
        setInterval(swapOnce, cycleMs);
      }, 1200);   // arranca tras el revelado del hero
    }
  }

  /* ── SCROLL REVEAL v2 ── */
  const animEls = document.querySelectorAll('.reveal, [data-reveal], [data-split]');
  if (animEls.length) {
    const activate = (el) =>
      el.classList.add(el.hasAttribute('data-split') ? 'is-in' : 'visible');

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          activate(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    animEls.forEach(el => {
      if (el.closest('.hero')) {
        setTimeout(() => activate(el), 140);   // el hero entra al cargar
      } else {
        io.observe(el);
      }
    });
  }

  /* ── SMOOTH SCROLL (inercia, estilo Lenis) ── */
  const canSmooth = !prefersReduced &&
    window.matchMedia('(pointer: fine)').matches &&
    window.matchMedia('(min-width: 769px)').matches;

  if (canSmooth) {
    document.documentElement.style.scrollBehavior = 'auto';
    let target = window.scrollY;
    let current = target;
    let raf = null;
    const EASE = 0.085;
    const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;
    const clampY = (v) => Math.max(0, Math.min(v, maxScroll()));

    function frame() {
      current += (target - current) * EASE;
      if (Math.abs(target - current) < 0.4) current = target;
      window.scrollTo(0, current);
      raf = (current !== target) ? requestAnimationFrame(frame) : null;
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }

    window.addEventListener('wheel', (e) => {
      if (e.ctrlKey) return;            // permite zoom del navegador
      e.preventDefault();
      let d = e.deltaY;
      if (e.deltaMode === 1) d *= 16;            // líneas → px
      else if (e.deltaMode === 2) d *= window.innerHeight;
      target = clampY(target + d);
      kick();
    }, { passive: false });

    // Sincroniza si se usa scrollbar / teclado / touch
    window.addEventListener('scroll', () => {
      if (!raf) { target = current = window.scrollY; }
    }, { passive: true });
    window.addEventListener('resize', () => { target = clampY(target); });

    // Anclas con destino suavizado
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (!id || id.length < 2) return;
        const dest = document.querySelector(id);
        if (!dest) return;
        e.preventDefault();
        const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 68;
        target = clampY(dest.getBoundingClientRect().top + window.scrollY - navH + 1);
        kick();
      });
    });
  }

  /* ── PARALLAX + BARRA DE PROGRESO ── */
  const progressBar = document.getElementById('scrollProgress');
  const parallaxEls = Array.from(document.querySelectorAll('[data-parallax]'));
  let fxTicking = false;

  function updateScrollFx() {
    const vh = window.innerHeight;
    const docH = document.documentElement.scrollHeight - vh;
    if (progressBar) {
      progressBar.style.transform = `scaleX(${docH > 0 ? (window.scrollY / docH).toFixed(4) : 0})`;
    }
    if (!prefersReduced) {
      for (const el of parallaxEls) {
        const speed = parseFloat(el.dataset.parallax) || 0.15;
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) continue;   // fuera de vista
        const offset = (r.top + r.height / 2 - vh / 2) / vh;  // ~ -1 … 1
        el.style.setProperty('--py', (offset * speed * 100).toFixed(1) + 'px');
      }
    }
    fxTicking = false;
  }
  function onScrollFx() {
    if (!fxTicking) { fxTicking = true; requestAnimationFrame(updateScrollFx); }
  }
  window.addEventListener('scroll', onScrollFx, { passive: true });
  window.addEventListener('resize', onScrollFx, { passive: true });
  updateScrollFx();

  /* ── MOBILE MENU ── */
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  if (hamburger && mobileMenu) {
    const toggleMenu = (open) => {
      hamburger.classList.toggle('open', open);
      mobileMenu.classList.toggle('open', open);
      mobileMenu.setAttribute('aria-hidden', String(!open));
      hamburger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    };

    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('open');
      toggleMenu(!isOpen);
    });

    mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
      link.addEventListener('click', () => toggleMenu(false));
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        toggleMenu(false);
        hamburger.focus();
      }
    });
  }

  /* ── SERVICE/CASE CARDS — make whole card clickable ── */
  document.querySelectorAll('.service-card[data-href], .case-card[data-href]').forEach(card => {
    card.addEventListener('click', () => {
      window.location.href = card.dataset.href;
    });
    card.setAttribute('role', 'link');
    card.setAttribute('tabindex', '0');
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        window.location.href = card.dataset.href;
      }
    });
  });

  /* ── NAV — transparente sobre el hero + hide/show on scroll ── */
  const nav = document.querySelector('.nav');
  if (nav) {
    const hero = document.querySelector('.hero');
    let lastY = 0;
    let ticking = false;

    // Umbral para volverse sólido: casi al final del hero (o siempre sólido sin hero)
    const solidAt = () => hero ? Math.max(60, hero.offsetHeight - nav.offsetHeight - 40) : 0;

    function updateNav() {
      const y = window.scrollY;
      nav.classList.toggle('is-solid', !hero || y > solidAt());
      // ocultar al bajar, mostrar al subir (solo fuera del tope)
      if (y > 80) {
        nav.style.transform = (y > lastY) ? 'translateY(-110%)' : 'translateY(0)';
      } else {
        nav.style.transform = 'translateY(0)';
      }
      lastY = y;
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(updateNav); }
    }, { passive: true });
    window.addEventListener('resize', updateNav, { passive: true });
    updateNav();
  }

  /* ── CONTACT FORM ── */
  const form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn  = form.querySelector('.form-submit');
      const text = btn.querySelector('.submit-text');
      const arr  = btn.querySelector('.submit-arrow');

      btn.disabled = true;
      text.textContent = 'Enviando…';
      arr.textContent  = '⏳';

      setTimeout(() => {
        text.textContent = '¡Mensaje enviado!';
        arr.textContent  = '✓';
        btn.style.background = '#00E5FF';
        btn.style.color      = '#000';
        btn.style.borderColor = '#00E5FF';
      }, 1400);
    });
  }

  /* ── STAGGER TESTIMONIOS — tarjetas apiladas ── */
  const stagger = document.getElementById('staggerTestimonials');
  if (stagger) {
    const cards = Array.from(stagger.querySelectorAll('.st-card'));
    const staggerReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let size = 365;
    let order = cards.map((_, i) => i);   // índices de tarjeta en orden de presentación
    let autoTimer = null;
    const AUTO_DELAY = 4000;

    function layout() {
      const L = order.length;
      const half = Math.floor(L / 2);
      order.forEach((cardIdx, displayIdx) => {
        const position = displayIdx - half;       // centro simétrico = 0
        const el = cards[cardIdx];
        const isCenter = position === 0;
        const ax = Math.abs(position);
        const tx = (size / 1.5) * position;
        const ty = isCenter ? -65 : (ax % 2 ? 15 : -15);
        const rot = isCenter ? 0 : (position % 2 ? 2.5 : -2.5);
        el.classList.toggle('is-center', isCenter);
        el.style.zIndex = isCenter ? 10 : 10 - ax;
        el.style.transform =
          `translate(-50%, -50%) translateX(${tx}px) translateY(${ty}px) rotate(${rot}deg)`;
        el.dataset.pos = String(position);
        el.setAttribute('aria-current', isCenter ? 'true' : 'false');
      });
    }

    function move(steps) {
      const L = order.length;
      const n = ((steps % L) + L) % L;
      if (!n) return;
      order = order.slice(n).concat(order.slice(0, n));
      layout();
    }

    function startAuto() {
      if (staggerReduce || autoTimer) return;
      autoTimer = setInterval(() => move(1), AUTO_DELAY);
    }
    function stopAuto() {
      if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    }
    // Reinicia el contador tras una interacción manual
    function nudge(steps) { move(steps); stopAuto(); startAuto(); }

    function setSize() {
      size = window.matchMedia('(min-width: 640px)').matches ? 365 : 290;
      stagger.style.setProperty('--st-size', size + 'px');
      layout();
    }

    // Click / teclado en una tarjeta → llevarla al centro
    cards.forEach(el => {
      el.addEventListener('click', () => nudge(Number(el.dataset.pos) || 0));
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          nudge(Number(el.dataset.pos) || 0);
        }
      });
    });

    // Flechas ‹ ›
    stagger.querySelectorAll('.st-btn').forEach(btn => {
      btn.addEventListener('click', () => nudge(Number(btn.dataset.dir)));
    });

    // Pausa al pasar el mouse o enfocar; reanuda al salir
    stagger.addEventListener('mouseenter', stopAuto);
    stagger.addEventListener('mouseleave', startAuto);
    stagger.addEventListener('focusin', stopAuto);
    stagger.addEventListener('focusout', startAuto);
    // Pausa cuando la pestaña no está visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopAuto(); else startAuto();
    });

    setSize();
    window.addEventListener('resize', setSize, { passive: true });
    startAuto();
  }

  /* ── MARQUEE — pause on reduced motion ── */
  const track = document.querySelector('.marquee-track');
  if (track && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    track.style.animation = 'none';
  }

})();
