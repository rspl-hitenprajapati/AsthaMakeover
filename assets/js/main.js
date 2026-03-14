(() => {
  const header = document.querySelector(".site-header");
  const hero = document.querySelector(".js-hero");
  const nav = document.querySelector("#primary-nav");
  const toggle = document.querySelector("#nav-toggle");
  const year = document.querySelector("#year");

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

  const revealItems = document.querySelectorAll(".reveal");
  if (revealItems.length) {
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
    revealItems.forEach((item) => io.observe(item));
  }
})();
