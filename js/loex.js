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

  /* ── TESTIMONIALS CAROUSEL — uno por transición ── */
  const carousel = document.getElementById('testimonialsCarousel');
  if (carousel) {
    const track  = carousel.querySelector('.t-track');
    const slides = Array.from(carousel.querySelectorAll('.t-slide'));
    const prev   = carousel.querySelector('.t-prev');
    const next   = carousel.querySelector('.t-next');
    const dotsEl = carousel.querySelector('.t-dots');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let index = 0;
    let timer = null;
    const DELAY = 6000;
    carousel.style.setProperty('--t-delay', DELAY + 'ms');

    // Build dots
    const dots = slides.map((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 't-dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Ver testimonio ${i + 1}`);
      dot.addEventListener('click', () => { goTo(i); restart(); });
      dotsEl.appendChild(dot);
      return dot;
    });

    const bars = slides.map(s => s.querySelector('.t-progress'));

    function runProgress() {
      bars.forEach(b => b && b.classList.remove('run'));
      const bar = bars[index];
      if (bar && !reduceMotion) {
        void bar.offsetWidth;            // reinicia la animación
        bar.classList.add('run');
        bar.style.animationPlayState = 'running';
      }
    }

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      slides.forEach((s, n) => s.classList.toggle('is-active', n === index));
      dots.forEach((d, n) => {
        const active = n === index;
        d.classList.toggle('is-active', active);
        d.setAttribute('aria-selected', String(active));
      });
      runProgress();
    }

    function restart() {
      if (timer) clearInterval(timer);
      runProgress();
      if (!reduceMotion) timer = setInterval(() => goTo(index + 1), DELAY);
    }

    next.addEventListener('click', () => { goTo(index + 1); restart(); });
    prev.addEventListener('click', () => { goTo(index - 1); restart(); });

    // Pause on hover
    carousel.addEventListener('mouseenter', () => {
      if (timer) clearInterval(timer);
      const bar = bars[index];
      if (bar) bar.style.animationPlayState = 'paused';
    });
    carousel.addEventListener('mouseleave', restart);

    // Keyboard
    carousel.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { goTo(index + 1); restart(); }
      if (e.key === 'ArrowLeft')  { goTo(index - 1); restart(); }
    });

    goTo(0);
    restart();
  }

  /* ── MARQUEE — pause on reduced motion ── */
  const track = document.querySelector('.marquee-track');
  if (track && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    track.style.animation = 'none';
  }

})();
