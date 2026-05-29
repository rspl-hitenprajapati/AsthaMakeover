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

  /* ---- Marquee clone (infinite loop needs a duplicate) ---- */
  const marquee = document.querySelector('.home-v2-marquee');
  if (marquee) {
    const clone = marquee.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    marquee.parentElement.appendChild(clone);
  }

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
