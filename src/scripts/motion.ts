import Lenis from 'lenis';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let lenis: Lenis | null = null;

/* ---------- Smooth scroll (Lenis) ---------- */
function initSmoothScroll() {
  if (reduceMotion) return;
  lenis = new Lenis({
    lerp: 0.07,
    wheelMultiplier: 0.9,
    smoothWheel: true,
    syncTouch: true,
    touchMultiplier: 1.4,
  });

  function raf(time: number) {
    lenis!.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Anchor links -> smooth scroll
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        lenis!.scrollTo(target as HTMLElement, { offset: -70 });
      }
    });
  });
}

/* ---------- Reveal on scroll ---------- */
function initReveal() {
  const items = document.querySelectorAll<HTMLElement>(
    '[data-reveal], [data-reveal-group], .reveal-line'
  );
  if (reduceMotion) {
    items.forEach((el) => {
      el.classList.add('is-visible');
      el.querySelectorAll<HTMLElement>('[data-reveal-child]').forEach((k) =>
        k.classList.add('is-visible')
      );
    });
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          // staggered children
          if (el.dataset.revealGroup !== undefined) {
            const kids = el.querySelectorAll<HTMLElement>('[data-reveal-child]');
            kids.forEach((kid, i) => {
              kid.style.setProperty('--reveal-delay', `${i * 90}ms`);
              kid.classList.add('is-visible');
            });
          }
          el.classList.add('is-visible');
          io.unobserve(el);
        }
      });
    },
    { threshold: 0.01, rootMargin: '0px 0px -8% 0px' }
  );

  // Reveal anything already in (or near) the viewport on load — e.g. the hero.
  const vh = window.innerHeight;
  items.forEach((el) => {
    if (el.getBoundingClientRect().top < vh * 0.92) {
      if (el.dataset.revealGroup !== undefined) {
        el.querySelectorAll<HTMLElement>('[data-reveal-child]').forEach((kid, i) => {
          kid.style.setProperty('--reveal-delay', `${i * 90}ms`);
          kid.classList.add('is-visible');
        });
      }
      el.classList.add('is-visible');
    } else {
      io.observe(el);
    }
  });
}

/* ---------- Mobile menu (burger) ---------- */
function initMenu() {
  const burger = document.querySelector<HTMLButtonElement>('[data-burger]');
  const menu = document.querySelector<HTMLElement>('[data-menu]');
  if (!burger || !menu) return;

  const setOpen = (open: boolean) => {
    document.documentElement.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    menu.toggleAttribute('inert', !open);
    if (lenis) open ? lenis.stop() : lenis.start();
  };

  burger.addEventListener('click', () =>
    setOpen(!document.documentElement.classList.contains('menu-open'))
  );
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });
  setOpen(false);
}

/* ---------- FAQ accordions ---------- */
function initFaq() {
  const items = document.querySelectorAll<HTMLElement>('[data-faq-item]');
  const setHeight = (item: HTMLElement, open: boolean) => {
    const panel = item.querySelector<HTMLElement>('[data-faq-panel]');
    if (panel) panel.style.maxHeight = open ? `${panel.scrollHeight}px` : '0px';
  };

  items.forEach((item) => {
    const btn = item.querySelector<HTMLButtonElement>('[data-faq-trigger]');
    if (!btn) return;
    if (item.classList.contains('is-open')) setHeight(item, true);
    btn.addEventListener('click', () => {
      const open = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
      setHeight(item, open);
    });
  });

  // Recompute open panel heights on resize (content reflow) — debounced.
  let t: number | undefined;
  window.addEventListener('resize', () => {
    clearTimeout(t);
    t = window.setTimeout(() => {
      items.forEach((item) => {
        if (item.classList.contains('is-open')) setHeight(item, true);
      });
    }, 150);
  });
}

/* ---------- Count-up numbers ---------- */
function initCounters() {
  const nums = document.querySelectorAll<HTMLElement>('[data-count]');
  if (!nums.length) return;
  const run = (el: HTMLElement) => {
    const target = parseFloat(el.dataset.count || '0');
    if (reduceMotion) { el.textContent = String(target); return; }
    const dur = 1400;
    let start: number | null = null;
    const step = (t: number) => {
      if (start === null) start = t;
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = String(target);
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { run(e.target as HTMLElement); io.unobserve(e.target); }
    });
  }, { threshold: 0.6 });
  nums.forEach((n) => io.observe(n));
}

function boot() {
  initSmoothScroll();
  initReveal();
  initMenu();
  initFaq();
  initCounters();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
