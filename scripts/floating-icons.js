/* floating-icons.js
   Injects a subtle floating layer of your instrument SVGs into any
   section marked with [data-floating-icons], with a mouse-parallax
   interaction. Skips anything you don't mark (e.g. gallery, sideb).

   Usage:
   1. Add data-floating-icons to the root element of about.html,
      contact.html, experience.html, extras.html, projects.html,
      research.html. Do NOT add it to gallery.html or sideb.html.
   2. Include this script + floating-icons.css on the page.
   3a. If your sections are already in the DOM on page load, it will
       auto-run on DOMContentLoaded.
   3b. If sections are fetched/injected dynamically (looks like your
       main.js loads sections/*.html on demand), call
       window.initFloatingIcons(containerEl) right after you insert
       the new section's HTML into the page.
*/

(function () {
  // Adjust the path prefix if your pages sit in a subfolder.
  const ICONS = [
    'assets/guitar-amp-svgrepo-com.svg',
    'assets/guitar-instrument-electric-flying-v-svgrepo-com.svg',
    'assets/guitar-pedal-1-svgrepo-com.svg',
    'assets/guitar-pedal-2-svgrepo-com.svg',
    'assets/guitar-svgrepo-com (1).svg',
    'assets/guitar-svgrepo-com.svg',
    'assets/piano-svgrepo-com.svg',
    'assets/saxophone-svgrepo-com.svg',
    'assets/vinyl-svgrepo-com.svg',
    'assets/violin-2-svgrepo-com.svg',
    'assets/drums-rhythm-loud-play-band-svgrepo-com.svg',
  ];

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function createLayer(section) {
    if (!section || section.querySelector(':scope > .floating-icons-layer')) return;

    const layer = document.createElement('div');
    layer.className = 'floating-icons-layer';

    // Jittered grid: pick a grid roomy enough for the icon count, then
    // place one icon per cell with a random offset so coverage is even
    // instead of clumping in random spots.
    const count = Math.floor(rand(40, 50));
    const cols = Math.ceil(Math.sqrt(count * (16 / 9))); // bias wider than tall
    const rows = Math.ceil(count / cols);
    const cellW = 100 / cols;
    const cellH = 100 / rows;

    const cells = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        cells.push({ c, r });
      }
    }
    // Shuffle so which cells get skipped (if cells > count) is random.
    for (let i = cells.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cells[i], cells[j]] = [cells[j], cells[i]];
    }

    const icons = [];

    for (let i = 0; i < count; i++) {
      const src = ICONS[Math.floor(Math.random() * ICONS.length)];
      const cell = cells[i];

      // Random position within the cell, with a small margin so icons
      // don't sit flush against the cell edge.
      const left = cell.c * cellW + rand(cellW * 0.15, cellW * 0.85);
      const top = cell.r * cellH + rand(cellH * 0.15, cellH * 0.85);

      const wrap = document.createElement('div');
      wrap.className = 'floating-icon';
      wrap.style.left = left + '%';
      wrap.style.top = top + '%';

      const img = document.createElement('img');
      img.src = src;
      img.alt = '';
      img.className = 'floating-icon-img';
      img.style.setProperty('--size', rand(28, 64) + 'px');
      img.style.setProperty('--opacity', rand(0.04, 0.1));
      img.style.setProperty('--duration', rand(6, 12) + 's');
      img.style.setProperty('--delay', rand(0, 5) + 's');

      wrap.appendChild(img);
      layer.appendChild(wrap);

      icons.push({
        el: wrap,
        depth: rand(0.02, 0.09), // how strongly this icon reacts to the cursor
        tx: 0,
        ty: 0,
      });
    }

    const computed = getComputedStyle(section);
    if (computed.position === 'static') {
      section.style.position = 'relative';
    }
    section.insertBefore(layer, section.firstChild);

    let targetX = 0;
    let targetY = 0;
    let active = false;

    section.addEventListener('mousemove', (e) => {
      const rect = section.getBoundingClientRect();
      targetX = e.clientX - rect.left - rect.width / 2;
      targetY = e.clientY - rect.top - rect.height / 2;
      active = true;
    });

    section.addEventListener('mouseleave', () => {
      active = false;
      targetX = 0;
      targetY = 0;
    });

    function tick() {
      icons.forEach((icon) => {
        const goalX = active ? targetX * icon.depth : 0;
        const goalY = active ? targetY * icon.depth : 0;
        icon.tx += (goalX - icon.tx) * 0.06;
        icon.ty += (goalY - icon.ty) * 0.06;
        icon.el.style.transform = `translate3d(${icon.tx.toFixed(2)}px, ${icon.ty.toFixed(2)}px, 0)`;
      });
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function initFloatingIcons(root) {
    const scope = root || document;
    // If root itself is a marked section, wire it up directly.
    if (scope.matches && scope.matches('[data-floating-icons]')) {
      createLayer(scope);
    }
    scope.querySelectorAll('[data-floating-icons]').forEach(createLayer);
  }

  window.initFloatingIcons = initFloatingIcons;

  document.addEventListener('sections:ready', () => {
    initFloatingIcons(document);
  });

  document.addEventListener('DOMContentLoaded', () => initFloatingIcons());
})();