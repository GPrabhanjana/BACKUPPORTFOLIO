/* Side B owns both the vinyl sequence and its gallery finale. */
function easeOutCubic(x) { return 1 - Math.pow(1 - x, 3); }

function buildCurvedLabel() {
  const container = document.getElementById('sideb-label');
  if (!container) return;
  const text = 'SIDE B';
  const angleStep = 13;
  const start = -angleStep * (text.length - 1) / 2;
  container.innerHTML = text.split('').map((ch, i) =>
    `<span style="transform: rotate(${start + i * angleStep}deg) translateY(-260px);">${ch === ' ' ? '&nbsp;' : ch}</span>`
  ).join('');
}

const SIDEB_PHOTOS = ['i1.jpeg', 'i10.PNG', 'i11.JPEG', 'i12.PNG', 'i13.PNG', 'i14.jpg', 'i15.PNG', 'i2.jpeg', 'i3.JPEG', 'i4.JPEG', 'i5.jpeg', 'i6.jpeg', 'i7.JPEG', 'i8.jpeg', 'i9.JPEG'];
const SIDEB_TILTS = [-2.5, 1.5, -1, 2.3, -1.8, 1.2];

function buildSideBPhoto(filename, index) {
  const card = document.createElement('figure');
  card.className = 'polaroid';
  card.style.setProperty('--tilt', `${SIDEB_TILTS[index % SIDEB_TILTS.length]}deg`);
  const frame = document.createElement('div');
  frame.className = 'polaroid__photo';
  const image = document.createElement('img');
  image.src = `assets/${filename}`;
  image.alt = 'Gallery photograph';
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

function renderSideBGallery() {
  const columns = Array.from(document.querySelectorAll('#sideb-gallery-columns .sideb__gallery-column'));
  if (columns.length !== 3 || columns[0].childElementCount) return columns;
  SIDEB_PHOTOS.forEach((photo, index) => columns[index % columns.length].append(buildSideBPhoto(photo, index)));
  return columns;
}

function initSideB() {
  const wrapper = document.getElementById('sideb-wrapper');
  const stage = document.getElementById('sideb-stage');
  const bgFade = document.getElementById('sideb-bg-fade');
  const cover = document.getElementById('sideb-cover');
  const vinyl = document.getElementById('sideb-vinyl');
  const vinylDisc = vinyl?.querySelector('.sideb__vinyl-disc');
  const tonearm = document.getElementById('sideb-tonearm');
  const tonearmArm = document.getElementById('sideb-tonearm-arm');
  const gallery = document.getElementById('sideb-gallery');
  const galleryViewport = gallery?.querySelector('.sideb__gallery-viewport');
  const galleryColumns = renderSideBGallery();
  if (!wrapper || !stage || !vinyl) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    if (cover) cover.style.display = 'none';
    vinyl.style.opacity = '1';
    if (tonearm) tonearm.style.opacity = '1';
    if (vinylDisc) vinylDisc.style.transform = 'none';
    if (gallery) gallery.classList.add('is-visible');
    return;
  }

  const BG_FADE_END = 0.09;
  const COVER_START = 0.1;
  const COVER_END = 0.26;
  const SETTLE_END = 0.3;
  const SPIN_END = 0.38;
  const ARM_DROP_START = 0.32;
  const ARM_DROP_END = 0.4;
  const SHRINK_START = 0.4;
  const SHRINK_END = 0.52;
  const GALLERY_START = SHRINK_END;
  const MINI_SCALE = 0.15;
  const MINI_X = 44;
  const MINI_Y = 42;
  let ticking = false;

  function update() {
    ticking = false;
    const total = wrapper.offsetHeight - window.innerHeight;
    const rect = wrapper.getBoundingClientRect();
    const progress = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;

    if (bgFade) bgFade.style.opacity = String(1 - easeOutCubic(Math.min(1, progress / BG_FADE_END)));
    const coverProgress = Math.min(1, Math.max(0, (progress - COVER_START) / (COVER_END - COVER_START)));
    const coverEase = easeOutCubic(coverProgress);
    // The sleeve begins lower and travels further than the record, giving
    // the handoff into Side B a layered, upward parallax entrance.
    const entryProgress = Math.min(1, progress / COVER_START);
    const entryEase = easeOutCubic(entryProgress);
    const coverY = (1 - entryEase) * 28;
    if (cover) cover.style.transform = `translate(${coverEase * 120}vw, ${coverY}vh) rotate(${coverEase * 8}deg)`;
    if (tonearm) tonearm.style.opacity = String(coverEase);

    let rotation = 0;
    if (progress > SETTLE_END) {
      const spinEase = easeOutCubic(Math.min(1, (progress - SETTLE_END) / (SPIN_END - SETTLE_END)));
      rotation = spinEase * (progress - SETTLE_END) * 540 + Math.max(0, progress - SPIN_END) * 540;
    }
    if (vinylDisc) vinylDisc.style.transform = `rotate(${rotation}deg)`;

    const shrinkEase = easeOutCubic(Math.min(1, Math.max(0, (progress - SHRINK_START) / (SHRINK_END - SHRINK_START))));
    // Keep the record concealed at first: only the sleeve gets the entrance.
    // It is revealed as that sleeve moves away.
    const vinylY = shrinkEase * MINI_Y;
    vinyl.style.transform = `translate(${shrinkEase * MINI_X}vw, ${vinylY}vh) scale(${1 - shrinkEase * (1 - MINI_SCALE)})`;
    vinyl.style.opacity = String(Math.min(1, coverProgress * 2.4));
    if (tonearmArm) {
      const dropEase = easeOutCubic(Math.min(1, Math.max(0, (progress - ARM_DROP_START) / (ARM_DROP_END - ARM_DROP_START))));
      tonearmArm.style.transform = `rotate(${-34 + dropEase * 34}deg)`;
    }

    const galleryProgress = Math.min(1, Math.max(0, (progress - GALLERY_START) / (1 - GALLERY_START)));
    if (gallery) gallery.classList.toggle('is-visible', progress >= GALLERY_START);
    if (galleryViewport && galleryColumns.length) {
      const viewHeight = galleryViewport.clientHeight;
      galleryColumns.forEach((column, index) => {
        const travel = Math.max(0, column.scrollHeight - viewHeight + 24);
        const y = index === 1 ? -travel * galleryProgress : -travel + travel * galleryProgress;
        column.style.transform = `translate3d(0, ${y}px, 0)`;
      });
    }
    stage.classList.remove('sideb__stage--light');
  }

  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
}

function safeInitSideB() {
  const wrapper = document.getElementById('sideb-wrapper');
  if (!wrapper || wrapper.dataset.initialized === 'true') return;
  buildCurvedLabel();
  renderSideBGallery();
  initSideB();
  wrapper.dataset.initialized = 'true';
}

document.addEventListener('DOMContentLoaded', safeInitSideB);
document.addEventListener('sections:ready', safeInitSideB);
