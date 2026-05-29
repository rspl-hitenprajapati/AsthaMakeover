(() => {
  /* ============================================================
     Astha Makeover — main.js
     GSAP + ScrollTrigger for home page.
     IntersectionObserver fallback for all other pages.
     ============================================================ */

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isHome = document.body.classList.contains('home-page');
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

  /* ---- Footer year ---- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Mobile nav toggle ---- */
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('primary-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('click', e => {
      if (!e.target.closest('#primary-nav') && !e.target.closest('#nav-toggle')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---- Sticky header solid state ---- */
  const header = document.querySelector('.site-header');
  const heroEl = document.querySelector('.js-hero');
  const updateHeader = () => {
    if (!header) return;
    const threshold = heroEl ? heroEl.offsetHeight * 0.2 : 80;
    header.classList.toggle('nav--solid', window.scrollY > threshold);
  };
  if (header) {
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  /* ---- Home: expose header height so the dark hero can sit behind it ---- */
  if (isHome && header) {
    const setHeaderH = () => {
      document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
    };
    setHeaderH();
    window.addEventListener('resize', setHeaderH);
    window.addEventListener('load', setHeaderH);
  }

  /* ---- Marquee clone (infinite loop needs a duplicate) ---- */
  const marquee = document.querySelector('.home-v2-marquee');
  if (marquee) {
    const clone = marquee.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    marquee.parentElement.appendChild(clone);
  }

  /* ============================================================
     HERO CANVAS — animated dot-wave grid + particle network
     Deep plum base, pink/gold glowing dots. Seamless loop.
     Reacts to pointer/touch. Pauses off-screen + on reduced motion.
     ============================================================ */
  function initHeroCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const hero = canvas.closest('.aurora-hero') || canvas.parentElement;

    const PINK = [236, 72, 153];
    const GOLD = [245, 185, 66];

    let w = 0, h = 0, dpr = 1;
    let spacing = 36, cols = 0, rows = 0, amp = 8;
    let particles = [];
    let t = 0, raf = null, running = false;
    const pointer = { x: -9999, y: -9999, active: false };

    const lerp = (a, b, n) => a + (b - a) * n;

    function buildParticles() {
      const target = Math.round((w * h) / 21000);
      const max = w < 600 ? 32 : 64;
      const n = Math.max(16, Math.min(target, max));
      particles = [];
      for (let i = 0; i < n; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.32,
          vy: (Math.random() - 0.5) * 0.32,
          r: Math.random() * 1.5 + 1.2,
          gold: Math.random() < 0.28
        });
      }
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      spacing = w < 600 ? 30 : 38;
      amp = spacing * 0.26;
      cols = Math.ceil(w / spacing) + 2;
      rows = Math.ceil(h / spacing) + 2;
      buildParticles();
    }

    function render(animated) {
      ctx.clearRect(0, 0, w, h);

      /* 1) Wave dot grid */
      for (let i = 0; i < cols; i++) {
        const x = i * spacing;
        for (let j = 0; j < rows; j++) {
          const y = j * spacing;
          const wave = Math.sin(x * 0.018 + t * 1.05) + Math.cos(y * 0.02 + t * 0.85);
          const b = (wave + 2) / 4; /* 0..1 */
          const py = y + wave * amp;
          const radius = 0.5 + b * 1.9;
          const alpha = 0.10 + b * 0.5;
          const col = [
            Math.round(lerp(PINK[0], GOLD[0], b * 0.55)),
            Math.round(lerp(PINK[1], GOLD[1], b * 0.55)),
            Math.round(lerp(PINK[2], GOLD[2], b * 0.55))
          ];
          ctx.beginPath();
          ctx.fillStyle = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + alpha + ')';
          ctx.arc(x, py, radius, 0, 6.2832);
          ctx.fill();
        }
      }

      /* 2) Move particles */
      for (const p of particles) {
        if (animated) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
          if (pointer.active) {
            const dx = pointer.x - p.x;
            const dy = pointer.y - p.y;
            const d = Math.hypot(dx, dy);
            if (d < 150 && d > 0.5) {
              p.x -= (dx / d) * 0.6;
              p.y -= (dy / d) * 0.6;
            }
          }
        }
      }

      /* 3) Connection lines between nearby particles */
      const maxD = 124;
      for (let a = 0; a < particles.length; a++) {
        for (let b2 = a + 1; b2 < particles.length; b2++) {
          const dx = particles[a].x - particles[b2].x;
          const dy = particles[a].y - particles[b2].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < maxD * maxD) {
            const al = (1 - Math.sqrt(d2) / maxD) * 0.22;
            ctx.strokeStyle = 'rgba(236,72,153,' + al + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b2].x, particles[b2].y);
            ctx.stroke();
          }
        }
      }

      /* 4) Pointer connection lines (gold) */
      if (pointer.active) {
        for (const p of particles) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const d = Math.hypot(dx, dy);
          if (d < 165) {
            const al = (1 - d / 165) * 0.4;
            ctx.strokeStyle = 'rgba(245,185,66,' + al + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(pointer.x, pointer.y);
            ctx.stroke();
          }
        }
      }

      /* 5) Glowing particle dots */
      for (const p of particles) {
        const col = p.gold ? GOLD : PINK;
        ctx.beginPath();
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',0.85)';
        ctx.fillStyle = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',0.92)';
        ctx.arc(p.x, p.y, p.r, 0, 6.2832);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    function loop() {
      t += 0.016;
      render(true);
      raf = requestAnimationFrame(loop);
    }

    function start() {
      if (running) return;
      running = true;
      loop();
    }
    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = null;
    }

    /* Pointer interaction (mouse + touch) */
    const setPointer = e => {
      const rect = canvas.getBoundingClientRect();
      const pt = e.touches ? e.touches[0] : e;
      pointer.x = pt.clientX - rect.left;
      pointer.y = pt.clientY - rect.top;
      pointer.active = true;
    };
    hero.addEventListener('pointermove', setPointer, { passive: true });
    hero.addEventListener('pointerleave', () => { pointer.active = false; });

    /* Resize handling (debounced) */
    let rt = null;
    window.addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(resize, 150);
    });

    resize();

    if (reducedMotion) {
      render(false); /* single static frame */
      return;
    }

    /* Pause when hero scrolls out of view, and when tab hidden */
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => (e.isIntersecting ? start() : stop()));
    }, { threshold: 0 });
    io.observe(hero);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else if (isInView(hero)) start();
    });

    function isInView(el) {
      const r = el.getBoundingClientRect();
      return r.bottom > 0 && r.top < window.innerHeight;
    }

    start();
  }

  initHeroCanvas();

  /* ============================================================
     HOME PAGE — GSAP CINEMATIC ANIMATIONS
     ============================================================ */
  if (isHome && hasGSAP && !reducedMotion) {
    gsap.registerPlugin(ScrollTrigger);

    /* -- Hero: word-by-word reveal -- */
    const words = document.querySelectorAll('.sw');
    if (words.length) {
      gsap.from(words, {
        y: 80,
        opacity: 0,
        skewY: 4,
        duration: 0.85,
        stagger: 0.13,
        ease: 'power4.out',
        delay: 0.15
      });
    }

    /* -- Hero: sub, CTA, trust pills stagger in -- */
    const heroExtras = document.querySelectorAll('.aurora-sub, .js-hero-cta, .js-trust-row');
    if (heroExtras.length) {
      gsap.from(heroExtras, {
        y: 30,
        opacity: 0,
        duration: 0.75,
        stagger: 0.14,
        ease: 'power3.out',
        delay: 0.85
      });
    }

    /* -- Bento: images scale + fade in with spring feel -- */
    const bentoItems = document.querySelectorAll('[data-bento]');
    if (bentoItems.length) {
      gsap.from(bentoItems, {
        scale: 0.88,
        opacity: 0,
        y: 50,
        duration: 1,
        stagger: 0.18,
        ease: 'power3.out',
        delay: 0.4
      });
    }

    /* -- ScrollTrigger: generic reveal for [data-motion="reveal"] -- */
    document.querySelectorAll('[data-motion="reveal"]').forEach(el => {
      const rawDelay = el.style.getPropertyValue('--motion-delay') || '0ms';
      const delay = parseFloat(rawDelay) / 1000;
      gsap.fromTo(el,
        { y: 55, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          delay,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            once: true
          }
        }
      );
    });

    /* -- Counter animation -- */
    document.querySelectorAll('.counter[data-target]').forEach(el => {
      const target = parseInt(el.dataset.target, 10);
      const obj = { val: 0 };
      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          gsap.to(obj, {
            val: target,
            duration: 1.8,
            ease: 'power2.out',
            onUpdate() { el.textContent = Math.round(obj.val); }
          });
        }
      });
    });

    /* -- Process steps: slide in from left -- */
    document.querySelectorAll('.process-steps li').forEach((li, i) => {
      gsap.from(li, {
        x: -40,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        delay: i * 0.1,
        scrollTrigger: {
          trigger: li,
          start: 'top 90%',
          once: true
        }
      });
    });

    /* -- Parallax on .js-parallax images -- */
    document.querySelectorAll('.js-parallax').forEach(el => {
      const speed = parseFloat(el.dataset.speed || '0.1');
      gsap.to(el, {
        yPercent: speed * -80,
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('section') || el.parentElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    });

    /* -- Horizontal gallery: desktop GSAP pin, mobile uses CSS scroll-snap -- */
    const galleryOuter = document.querySelector('.js-gallery');
    if (galleryOuter && window.innerWidth >= 960) {
      const track = galleryOuter.querySelector('.gallery-track');
      if (track) {
        /* Make track a real flex row (CSS has display:contents on mobile) */
        track.style.display = 'flex';
        track.style.gap = '0.85rem';

        const getDistance = () => {
          const total = Array.from(track.children).reduce((w, card) => {
            return w + card.offsetWidth + 14;
          }, 0);
          return total - window.innerWidth + 120;
        };

        let dist = getDistance();
        if (dist > 0) {
          gsap.to(track, {
            x: () => -getDistance(),
            ease: 'none',
            scrollTrigger: {
              trigger: '.gallery-section',
              start: 'top top',
              end: () => `+=${getDistance()}`,
              pin: true,
              scrub: 1,
              invalidateOnRefresh: true
            }
          });
        }
      }
    }

    /* -- Card 3D tilt (desktop non-touch only) -- */
    if (!isTouch) {
      const tiltTargets = document.querySelectorAll('.svc-bento-card, .testi-card');
      tiltTargets.forEach(card => {
        card.addEventListener('mousemove', e => {
          const r = card.getBoundingClientRect();
          const x = ((e.clientX - r.left) / r.width - 0.5) * 14;
          const y = ((e.clientY - r.top) / r.height - 0.5) * -14;
          gsap.to(card, {
            rotateY: x,
            rotateX: y,
            duration: 0.35,
            ease: 'power2.out',
            transformPerspective: 900,
            transformOrigin: 'center center'
          });
        });
        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            rotateX: 0,
            rotateY: 0,
            duration: 0.6,
            ease: 'elastic.out(1, 0.45)'
          });
        });
      });

      /* -- Bento image magnetic hover -- */
      document.querySelectorAll('.aurora-bento article').forEach(card => {
        card.addEventListener('mousemove', e => {
          const r = card.getBoundingClientRect();
          const x = ((e.clientX - r.left) / r.width - 0.5) * 10;
          const y = ((e.clientY - r.top) / r.height - 0.5) * -10;
          gsap.to(card, {
            rotateY: x,
            rotateX: y,
            scale: 1.02,
            duration: 0.4,
            ease: 'power2.out',
            transformPerspective: 700
          });
        });
        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            rotateX: 0,
            rotateY: 0,
            scale: 1,
            duration: 0.55,
            ease: 'elastic.out(1, 0.5)'
          });
        });
      });
    }

    /* -- Stats bar: number scramble on enter -- */
    ScrollTrigger.create({
      trigger: '.stats-bar',
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.from('.stat-item', {
          y: 30,
          opacity: 0,
          duration: 0.65,
          stagger: 0.12,
          ease: 'power3.out'
        });
      }
    });

    /* -- Testimonials: stagger with scale -- */
    ScrollTrigger.create({
      trigger: '.testi-grid',
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.from('.testi-card', {
          y: 40,
          scale: 0.95,
          opacity: 0,
          duration: 0.75,
          stagger: 0.14,
          ease: 'power3.out'
        });
      }
    });

  }

  /* ============================================================
     ALL PAGES — CSS-BASED SCROLL REVEAL FALLBACK
     (used when not home page, or GSAP unavailable)
     ============================================================ */
  if (!isHome || !hasGSAP || reducedMotion) {
    /* Mark [data-motion="reveal"] visible immediately if reduced motion */
    if (reducedMotion) {
      document.querySelectorAll('[data-motion="reveal"]').forEach(el => {
        el.classList.add('is-visible');
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    } else {
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });

      document.querySelectorAll('[data-motion="reveal"]').forEach(el => io.observe(el));
    }

    /* Legacy .reveal class support for older sections */
    const legacyItems = document.querySelectorAll('.reveal');
    if (legacyItems.length) {
      const legacyIO = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            legacyIO.unobserve(e.target);
          }
        });
      }, { threshold: 0.12 });
      legacyItems.forEach(el => legacyIO.observe(el));
    }
  }

})();
