/* =========================================================
   Svetlana Sirunyan · Portfolio — JS
   - Mobile menu toggle
   - Nav background on scroll
   - Fade-in reveal on scroll (IntersectionObserver)
   - Slideshow: autoplay, prev/next, ticks, keyboard, swipe
   - Auto year in footer
   ========================================================= */

(function () {
  'use strict';

  /* =======================
     1. Nav + reveal + year
     ======================= */

  const nav       = document.getElementById('nav');
  const toggle    = document.querySelector('.nav__toggle');
  const menuLinks = document.querySelectorAll('.nav__menu a');
  const reveals   = document.querySelectorAll('.reveal');
  const yearEl    = document.getElementById('year');

  // Footer year
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile menu toggle
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('nav--open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    menuLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (nav.classList.contains('nav--open')) {
          nav.classList.remove('nav--open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  // Nav shadow on scroll
  const onScroll = () => {
    if (!nav) return;
    if (window.scrollY > 40) nav.classList.add('nav--scrolled');
    else                     nav.classList.remove('nav--scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Reveal on scroll
  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-visible'));
  }


  /* =======================
     2. Slideshow
     ======================= */

  const slideshow = document.getElementById('slideshow');
  if (!slideshow) return;

  const slides    = slideshow.querySelectorAll('.slide');
  const frame     = slideshow.querySelector('.slideshow__frame');
  const btnPrev   = slideshow.querySelector('.slideshow__nav--prev');
  const btnNext   = slideshow.querySelector('.slideshow__nav--next');
  const elCurrent = slideshow.querySelector('.slideshow__current');
  const elTotal   = slideshow.querySelector('.slideshow__total');
  const ticksWrap = slideshow.querySelector('.slideshow__ticks');

  let current = 0;
  const total = slides.length;
  const AUTOPLAY_MS = 5000;
  let autoplayId = null;
  let isInView = false;

  // Format counter with leading zero (01, 02, ...)
  const pad = (n) => String(n).padStart(2, '0');

  // Set total in footer
  if (elTotal) elTotal.textContent = pad(total);

  // Build tick indicators
  if (ticksWrap) {
    slides.forEach((_, i) => {
      const t = document.createElement('button');
      t.className = 'tick';
      t.type      = 'button';
      t.setAttribute('role', 'tab');
      t.setAttribute('aria-label', `Перейти к фото ${i + 1}`);
      t.addEventListener('click', () => goTo(i, true));
      ticksWrap.appendChild(t);
    });
  }

  const ticks = ticksWrap ? ticksWrap.querySelectorAll('.tick') : [];

  // Go to a specific slide
  function goTo(index, userInitiated) {
    current = (index + total) % total;

    slides.forEach((el, i) => el.classList.toggle('is-active', i === current));
    ticks.forEach ((el, i) => el.classList.toggle('is-active', i === current));

    if (elCurrent) elCurrent.textContent = pad(current + 1);

    if (userInitiated) restartAutoplay();
  }

  const next = () => goTo(current + 1, true);
  const prev = () => goTo(current - 1, true);

  if (btnNext) btnNext.addEventListener('click', next);
  if (btnPrev) btnPrev.addEventListener('click', prev);

  // Keyboard navigation (only when slideshow is in viewport)
  document.addEventListener('keydown', (e) => {
    if (!isInView) return;
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft')  prev();
  });

  // Touch / pointer swipe
  let startX = 0, deltaX = 0, swiping = false;
  const SWIPE_THRESHOLD = 50;

  frame.addEventListener('pointerdown', (e) => {
    swiping = true;
    startX  = e.clientX;
    deltaX  = 0;
    try { frame.setPointerCapture(e.pointerId); } catch(_) {}
  });

  frame.addEventListener('pointermove', (e) => {
    if (!swiping) return;
    deltaX = e.clientX - startX;
  });

  const endSwipe = () => {
    if (!swiping) return;
    swiping = false;
    if (deltaX >  SWIPE_THRESHOLD) prev();
    if (deltaX < -SWIPE_THRESHOLD) next();
    deltaX = 0;
  };
  frame.addEventListener('pointerup',     endSwipe);
  frame.addEventListener('pointercancel', endSwipe);
  frame.addEventListener('pointerleave',  endSwipe);

  // Autoplay control
  function startAutoplay() {
    stopAutoplay();
    autoplayId = setInterval(() => goTo(current + 1, false), AUTOPLAY_MS);
  }
  function stopAutoplay() {
    if (autoplayId) { clearInterval(autoplayId); autoplayId = null; }
  }
  function restartAutoplay() {
    if (isInView) startAutoplay();
  }

  // Pause when user hovers the slideshow
  slideshow.addEventListener('mouseenter', stopAutoplay);
  slideshow.addEventListener('mouseleave', restartAutoplay);

  // Pause when tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAutoplay();
    else                 restartAutoplay();
  });

  // Only autoplay while slideshow is visible in viewport
  if ('IntersectionObserver' in window) {
    const ioSlide = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isInView = entry.isIntersecting;
        if (isInView) startAutoplay();
        else          stopAutoplay();
      });
    }, { threshold: 0.2 });
    ioSlide.observe(slideshow);
  } else {
    isInView = true;
    startAutoplay();
  }

  // Respect prefers-reduced-motion: don't autoplay
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    stopAutoplay();
    slideshow.removeEventListener('mouseleave', restartAutoplay);
  }

  // Initialize first slide state
  goTo(0, false);
})();
