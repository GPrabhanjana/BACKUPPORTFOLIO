/**
 * main.js
 */

document.addEventListener('sections:ready', () => {

  // ── Footer year ──────────────────────────────────────────
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ── Section fade-in (adds .in-view so CSS animation runs) ──
  const sections = document.querySelectorAll('.section');
  sections.forEach(s => s.classList.add('in-view'));

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    },
    { threshold: 0.05 }
  );
  sections.forEach(s => sectionObserver.observe(s));

  // ── Active nav highlight on scroll ───────────────────────
  const navLinks = document.querySelectorAll('.nav a[href^="#"]');
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            link.classList.toggle(
              'active',
              link.getAttribute('href') === `#${entry.target.id}`
            );
          });
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );
  sections.forEach(s => navObserver.observe(s));

  // ── Scroll-reveal for cards ───────────────────────────────
  const revealEls = document.querySelectorAll('.card, .timeline-item, .skill-chip');
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  revealEls.forEach(el => revealObserver.observe(el));

  // ── Side B / montage lightbox ─────────────────────────────
  initMontage();

});

document.querySelector('.footer__back-to-top')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

function initMontage() {
  const grid = document.querySelector('.montage-grid');
  if (!grid) return;

  const overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.innerHTML = `
    <button class="lightbox__close" aria-label="Close">&times;</button>
    <img class="lightbox__img" src="" alt="" />
    <p class="lightbox__caption"></p>
  `;
  document.body.appendChild(overlay);

  const lbImg     = overlay.querySelector('.lightbox__img');
  const lbCaption = overlay.querySelector('.lightbox__caption');
  const lbClose   = overlay.querySelector('.lightbox__close');

  function openLightbox(src, caption) {
    lbImg.src = src;
    lbImg.alt = caption;
    lbCaption.textContent = caption;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function closeLightbox() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  lbClose.addEventListener('click', closeLightbox);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeLightbox(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

  grid.querySelectorAll('.montage-item').forEach(item => {
    const img = item.querySelector('img');
    if (!img) return;
    item.addEventListener('click', () => openLightbox(img.src, img.alt));
    item.setAttribute('tabindex', '0');
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') openLightbox(img.src, img.alt);
    });
  });
}
