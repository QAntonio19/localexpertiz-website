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

  /* ── SCROLL REVEAL ── */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    // Hero reveals immediately on load
    revealEls.forEach(el => {
      if (el.closest('.hero')) {
        setTimeout(() => el.classList.add('visible'), 100);
      } else {
        io.observe(el);
      }
    });
  }

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
  document.querySelectorAll('.service-card[data-href]').forEach(card => {
    card.addEventListener('click', () => {
      window.location.href = card.dataset.href;
    });
    card.setAttribute('role', 'link');
    card.setAttribute('tabindex', '0');
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') window.location.href = card.dataset.href;
    });
  });

  /* ── NAV — hide/show on scroll ── */
  const nav = document.querySelector('.nav');
  if (nav) {
    let lastY = 0;
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          if (y > 80) {
            nav.style.transform = y > lastY ? 'translateY(-110%)' : 'translateY(0)';
          } else {
            nav.style.transform = 'translateY(0)';
          }
          nav.style.transition = 'transform 0.3s ease';
          lastY = y;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
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

  /* ── MARQUEE — pause on reduced motion ── */
  const track = document.querySelector('.marquee-track');
  if (track && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    track.style.animation = 'none';
  }

})();
