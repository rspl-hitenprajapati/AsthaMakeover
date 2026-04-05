(() => {
  const header = document.querySelector(".site-header");
  const hero = document.querySelector(".js-hero");
  const nav = document.querySelector("#primary-nav");
  const toggle = document.querySelector("#nav-toggle");
  const year = document.querySelector("#year");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (year) year.textContent = new Date().getFullYear().toString();

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const updateHeaderState = () => {
    if (!header) return;
    if (!hero) {
      header.classList.add("nav--solid");
      return;
    }
    const trigger = hero.offsetHeight * 0.25;
    if (window.scrollY > trigger) {
      header.classList.add("nav--solid");
    } else {
      header.classList.remove("nav--solid");
    }
  };

  updateHeaderState();
  window.addEventListener("scroll", updateHeaderState, { passive: true });
  window.addEventListener("resize", updateHeaderState);

  const legacyRevealItems = document.querySelectorAll(".reveal");
  if (legacyRevealItems.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    legacyRevealItems.forEach((item) => io.observe(item));
  }

  if (!reducedMotion) {
    const motionTargets = document.querySelectorAll(
      "main section, .card, .service-card, .home-v2-service-card, .map-card, .media-spot, .contact-item, .hero-card"
    );
    if (motionTargets.length) {
      motionTargets.forEach((item, index) => {
        item.setAttribute("data-motion", "reveal");
        item.style.setProperty("--motion-delay", `${Math.min((index % 8) * 60, 360)}ms`);
      });

      const motionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              motionObserver.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
      );

      motionTargets.forEach((item) => motionObserver.observe(item));
    }
  } else {
    document.querySelectorAll("main section, .card, .service-card, .home-v2-service-card, .map-card, .media-spot, .contact-item, .hero-card")
      .forEach((item) => item.classList.add("is-visible"));
  }

  const marquee = document.querySelector(".home-v2-marquee");
  if (marquee && marquee.children.length) {
    const clone = marquee.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    marquee.parentElement?.appendChild(clone);
  }

  const parallaxItems = document.querySelectorAll(".js-parallax");
  if (parallaxItems.length) {
    const updateParallax = () => {
      const y = window.scrollY;
      parallaxItems.forEach((item) => {
        const speed = Number(item.getAttribute("data-speed") || "0.08");
        item.style.transform = `translateY(${Math.max(-16, Math.min(16, y * speed * 0.12))}px)`;
      });
    };
    updateParallax();
    window.addEventListener("scroll", updateParallax, { passive: true });
  }
})();
