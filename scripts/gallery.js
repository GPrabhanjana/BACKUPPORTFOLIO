const PHOTOS = [
  { src: 'assets/i1.jpeg',  alt: 'Portrait photograph', ratio: '3297 / 5861' },
  { src: 'assets/i10.PNG',  alt: 'Landscape photograph', ratio: '1147 / 927' },
  { src: 'assets/i11.JPEG', alt: 'Landscape photograph', ratio: '3936 / 2624' },
  { src: 'assets/i12.PNG',  alt: 'Landscape photograph', ratio: '1145 / 774' },
  { src: 'assets/i13.PNG',  alt: 'Landscape photograph', ratio: '1179 / 930' },
  { src: 'assets/i14.jpg',  alt: 'Portrait photograph', ratio: '3944 / 4930' },
  { src: 'assets/i15.PNG',  alt: 'Landscape photograph', ratio: '1179 / 781' },
  { src: 'assets/i2.jpeg',  alt: 'Portrait photograph', ratio: '1440 / 1799' },
  { src: 'assets/i3.JPEG',  alt: 'Portrait photograph', ratio: '2433 / 4325' },
  { src: 'assets/i4.JPEG',  alt: 'Landscape photograph', ratio: '6216 / 3942' },
  { src: 'assets/i5.jpeg',  alt: 'Portrait photograph', ratio: '3072 / 4092' },
  { src: 'assets/i6.jpeg',  alt: 'Landscape photograph', ratio: '1600 / 900' },
  { src: 'assets/i7.JPEG',  alt: 'Portrait photograph', ratio: '2978 / 5292' },
  { src: 'assets/i8.jpeg',  alt: 'Portrait photograph', ratio: '3712 / 5568' },
  { src: 'assets/i9.JPEG',  alt: 'Landscape photograph', ratio: '3936 / 2624' },
];

const TILTS = [-2.5, 1.5, -1, 2.3, -1.8, 1.2];

function buildPolaroid(photo, index) {
  const card = document.createElement('figure');
  card.className = 'polaroid';
  card.style.setProperty('--tilt', `${TILTS[index % TILTS.length]}deg`);

  const frame = document.createElement('div');
  frame.className = 'polaroid__photo';
  frame.style.setProperty('--ratio', photo.ratio);

  const image = document.createElement('img');
  image.src = photo.src;
  image.alt = photo.alt;
  image.loading = 'lazy';
  image.decoding = 'async';

  const fallback = document.createElement('span');
  fallback.className = 'polaroid__photo-fallback';
  fallback.textContent = 'Image unavailable';
  image.onerror = () => { image.hidden = true; fallback.style.display = 'grid'; };

  frame.append(image, fallback);
  card.append(frame);
  return card;
}

function initGallery() {
  const gallery = document.getElementById('gallery-photos');
  const screen = gallery?.querySelector('.gallery__screen');
  const columns = Array.from(gallery?.querySelectorAll('.gallery__column') || []);
  if (!gallery || !screen || columns.length !== 3 || gallery.dataset.initialized) return;

  PHOTOS.forEach((photo, index) => columns[index % columns.length].append(buildPolaroid(photo, index)));
  gallery.dataset.initialized = 'true';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame;

  function update() {
    frame = undefined;
    if (reduceMotion.matches) {
      columns.forEach(column => { column.style.transform = ''; });
      return;
    }

    const rect = gallery.getBoundingClientRect();
    const distance = gallery.offsetHeight - window.innerHeight;
    const progress = distance > 0 ? Math.min(1, Math.max(0, -rect.top / distance)) : 0;
    const viewportHeight = screen.clientHeight;

    columns.forEach((column, index) => {
      const travel = Math.max(0, column.scrollHeight - viewportHeight + 24);
      // The centre rail moves up with the page. Outer rails start at their
      // lower edge and travel down, producing the opposing scroll motion.
      const y = index === 1 ? -travel * progress : -travel + travel * progress;
      column.style.transform = `translate3d(0, ${y}px, 0)`;
    });
  }

  function requestUpdate() {
    if (!frame) frame = requestAnimationFrame(update);
  }

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  window.addEventListener('load', requestUpdate, { once: true });
  requestUpdate();
}

document.addEventListener('DOMContentLoaded', initGallery);
document.addEventListener('sections:ready', initGallery);
