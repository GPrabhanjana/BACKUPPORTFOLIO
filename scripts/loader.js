/**
 * loader.js
 * Fetches each section's HTML from /sections/ and injects it
 * into the placeholder divs in index.html.
 * Call order matches the visual order on the page.
 */

const SECTIONS = [
  { id: 'section-about',        file: 'about.html' },
  { id: 'section-experience',   file: 'experience.html' },
  { id: 'section-projects',     file: 'projects.html' },
  { id: 'section-sideb',        file: 'sideb.html' },
  { id: 'section-extras',       file: 'extras.html' },
  { id: 'section-contact',      file: 'contact.html' },
];

const PHOTO_ASSETS = [
  'assets/portrait.jpeg',
  'assets/babitha.jpeg',
  'assets/i1.jpeg', 'assets/i2.jpeg', 'assets/i3.JPEG', 'assets/i4.JPEG',
  'assets/i5.jpeg', 'assets/i6.jpeg', 'assets/i7.JPEG', 'assets/i8.jpeg',
  'assets/i9.JPEG', 'assets/i10.PNG', 'assets/i11.JPEG', 'assets/i12.PNG',
  'assets/i13.PNG', 'assets/i14.jpg', 'assets/i15.PNG',
];

async function loadSection(id, file) {
  try {
    const res = await fetch(`sections/${file}`);
    if (!res.ok) throw new Error(`Failed to load ${file}: ${res.status}`);
    const html = await res.text();
    const el = document.getElementById(id);
    if (el) {
    el.innerHTML = html;
    console.log(`Loaded ${file}:`, html.substring(0, 100));
    }
  } catch (err) {
    console.warn(`[loader] ${err.message}`);
  }
}

function waitForImage(image) {
  const imageLoaded = image.complete
    ? Promise.resolve()
    : new Promise(resolve => {
        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', resolve, { once: true });
      });
  return imageLoaded.then(() => image.decode?.().catch(() => {}));
}

function preloadPhoto(src) {
  const image = new Image();
  image.src = src;
  return waitForImage(image);
}

async function finishPageLoad() {
  const pageLoaded = document.readyState === 'complete'
    ? Promise.resolve()
    : new Promise(resolve => window.addEventListener('load', resolve, { once: true }));
  const imagesLoaded = Promise.all([...document.images].map(waitForImage));
  const photosLoaded = Promise.all(PHOTO_ASSETS.map(preloadPhoto));
  await Promise.all([pageLoaded, imagesLoaded, photosLoaded, document.fonts?.ready || Promise.resolve()]);
  document.body.classList.remove('is-loading');
  document.body.classList.add('is-loaded');
  window.setTimeout(() => document.querySelector('.site-loader')?.remove(), 600);
}

// Load all sections in parallel, then fire a custom event
// so main.js knows the DOM is ready for scripts to attach.
Promise.all(SECTIONS.map(s => loadSection(s.id, s.file)))
  .then(async () => {
    document.dispatchEvent(new CustomEvent('sections:ready'));
    await finishPageLoad();
  });
