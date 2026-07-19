/* ============================================
   Side Nav — "Ink Track" scroll-spy navigation
   Builds itself, no HTML markup changes needed.
   Edit the SECTIONS array below to add/remove
   entries (e.g. add 'section-sideb' if you want
   it in the nav).
   ============================================ */

(function () {
  const SECTIONS = [
    { id: 'section-about', label: 'About', color: '#b5533c' },        // terracotta
    { id: 'section-experience', label: 'Experience', color: '#3c6e71' }, // deep teal
    { id: 'section-projects', label: 'Projects', color: '#2f5f8c' },     // navy
    { id: 'section-sideb', label: 'B Side', color: '#c1572f' },          // record / gallery
    { id: 'section-extras', label: 'Extras', color: '#d9a441' },        // cream
    { id: 'section-education', label: 'Education', color: '#c99a2e' },  // amber/mustard
    { id: 'section-skills', label: 'Skills', color: '#6a4c93' },        // plum
    { id: 'section-publications', label: 'Publications', color: '#4a6fa5' }, // slate blue
    { id: 'section-honors', label: 'Honors', color: '#a63446' },        // ruby
    { id: 'section-contact', label: 'Contact', color: '#4d724d' },      // olive green
  ];

  const HERO_ID = 'top';

  function init() {
    const items = SECTIONS
      .map((s) => ({ ...s, el: document.getElementById(s.id) }))
      .filter((s) => s.el);

    if (items.length === 0) return;

    // ---- build markup ----
    const nav = document.createElement('nav');
    nav.className = 'side-nav';
    nav.setAttribute('aria-label', 'Section navigation');

    const track = document.createElement('div');
    track.className = 'side-nav__track';
    const fill = document.createElement('div');
    fill.className = 'side-nav__fill';
    track.appendChild(fill);

    const list = document.createElement('ul');
    list.className = 'side-nav__list';

    items.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'side-nav__item';
      li.dataset.target = item.id;
      li.style.setProperty('--dot-color', item.color || 'var(--sn-ink)');

      const label = document.createElement('span');
      label.className = 'side-nav__label';
      label.textContent = item.label;

      const dot = document.createElement('a');
      dot.className = 'side-nav__dot';
      dot.href = `#${item.id}`;
      dot.setAttribute('aria-label', item.label);
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        item.el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });

      li.appendChild(label);
      li.appendChild(dot);
      list.appendChild(li);
    });

    nav.appendChild(track);
    nav.appendChild(list);
    document.body.appendChild(nav);

    const navItems = Array.from(list.querySelectorAll('.side-nav__item'));
    const heroEl = document.getElementById(HERO_ID);

    let ticking = false;

    function update() {
      ticking = false;

      // visibility: show once we've scrolled roughly past the hero
      const heroHeight = heroEl ? heroEl.offsetHeight : 0;
      nav.classList.toggle('is-visible', window.scrollY > heroHeight * 0.6);

      // active section: whichever section's top has crossed the
      // vertical midpoint of the viewport (with a slight offset)
      const midY = window.innerHeight * 0.5;
      let activeIndex = 0;
      items.forEach((item, i) => {
        const rect = item.el.getBoundingClientRect();
        if (rect.top - 80 <= midY) activeIndex = i;
      });
      navItems.forEach((li, i) => {
        li.classList.toggle('is-active', i === activeIndex);
      });

      // fill progress across the span of tracked sections
      const first = items[0].el;
      const last = items[items.length - 1].el;
      const total =
        last.getBoundingClientRect().top +
        window.scrollY +
        last.offsetHeight -
        (first.getBoundingClientRect().top + window.scrollY);
      const scrolled =
        window.scrollY +
        window.innerHeight / 2 -
        (first.getBoundingClientRect().top + window.scrollY);
      const pct = Math.min(100, Math.max(0, (scrolled / total) * 100));
      fill.style.height = `${pct}%`;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
