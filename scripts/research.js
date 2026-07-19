/* ============================================================
   RESEARCH DATA
   Add a new entry by pushing an object here — the timeline,
   sway animation, and expand/collapse all pick it up automatically.
   Entries render in the order listed, alternating left/right.
   `links` accepts as many entries as you want (paper, code, slides).
   `icon` is optional: 'doc' | 'github' | 'link'.
   ============================================================ */
const RESEARCH = [
  {
    year: '2025',
    venue: 'Working paper',
    title: 'Research Note One',
    abstract: 'A longer-form abstract goes here — this is where you can write a real paragraph or two about the question, method, and finding. It collapses to a preview by default so the timeline stays scannable, and expands on click.',
    tags: ['Statistics', 'Time Series'],
    links: [
      { label: 'Paper', url: '#', icon: 'doc' },
      { label: 'Code', url: '#', icon: 'github' },
    ],
  },
  {
    year: '2024',
    venue: 'Course project',
    title: 'Research Note Two',
    abstract: 'Swap in the real write-up whenever this one is ready. Keep the first sentence strong since it is the part visible before "read more" is pressed.',
    tags: ['Machine Learning', 'NLP'],
    links: [
      { label: 'Paper', url: '#', icon: 'doc' },
    ],
  },
  {
    year: '2023',
    venue: 'Independent study',
    title: 'Research Note Three',
    abstract: 'Another placeholder abstract. Replace with a description of the question you investigated, what you tried, and what you found.',
    tags: ['Risk Modeling'],
    links: [
      { label: 'Slides', url: '#', icon: 'link' },
      { label: 'Code', url: '#', icon: 'github' },
    ],
  },
  // add more research entries here
];

const RESEARCH_ICONS = {
  github: '<svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55v-2.15c-3.2.7-3.87-1.36-3.87-1.36-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 015.8 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.07.78 2.16v3.2c0 .3.21.66.79.55A10.51 10.51 0 0023.5 12C23.5 5.65 18.35.5 12 .5z"/></svg>',
  link: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14L20 4"/><path d="M14 4h6v6"/><path d="M20 14v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h6"/></svg>',
  doc: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z"/><path d="M14 3v5h5"/></svg>',
};

const CLIP_SVG = `
  <svg viewBox="0 0 22 26" width="22" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M11 2v16a4 4 0 01-8 0V7a2.5 2.5 0 015 0v11" />
  </svg>
`;

const CHEVRON_SVG = `
  <svg class="research__toggle-icon" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 9l6 6 6-6"/>
  </svg>
`;

function renderResearch() {
  const timeline = document.getElementById('research-timeline');
  if (!timeline) return;

  timeline.innerHTML = RESEARCH.map((r, i) => {
    const sway = (1 + (i % 3) * 0.4).toFixed(2); // subtle, varies slightly per card

    const linksHtml = r.links.map(l => `
      <a class="research__link" href="${l.url}" target="_blank" rel="noopener">
        <span class="research__link-icon">${RESEARCH_ICONS[l.icon] || RESEARCH_ICONS.link}</span>
        ${l.label}
      </a>
    `).join('');

    const tagsHtml = r.tags.map(t => `<span class="research__tag">${t}</span>`).join('');

    return `
      <div class="research__entry" style="--delay:${i * 110}ms;">
        <div class="research__year-badge">${r.year}</div>
        <div class="research__card" style="--sway:${sway}deg; animation-delay:${i * 250}ms;">
          <span class="research__clip">${CLIP_SVG}</span>
          <div class="research__venue">${r.venue}</div>
          <h3 class="research__title">${r.title}</h3>
          <div class="research__abstract-wrap">
            <p class="research__abstract">${r.abstract}</p>
          </div>
          <button class="research__toggle" type="button" aria-expanded="false">
            <span class="research__toggle-label">Read more</span>
            ${CHEVRON_SVG}
          </button>
          <div class="research__tags">${tagsHtml}</div>
          <div class="research__links">${linksHtml}</div>
        </div>
      </div>
    `;
  }).join('');

  attachToggleHandlers();
  observeEntries();
}

function attachToggleHandlers() {
  document.querySelectorAll('.research__toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.research__card');
      const expanded = card.classList.toggle('expanded');
      btn.setAttribute('aria-expanded', expanded);
      btn.querySelector('.research__toggle-label').textContent = expanded ? 'Show less' : 'Read more';
    });
  });
}

function observeEntries() {
  const entries = document.querySelectorAll('.research__entry');
  const observer = new IntersectionObserver((observed) => {
    observed.forEach(entry => {
      entry.target.classList.toggle('visible', entry.isIntersecting);
    });
  }, { threshold: 0.15 });

  entries.forEach(entry => observer.observe(entry));
}

function safeRenderResearch() {
  const timeline = document.getElementById('research-timeline');
  if (!timeline || timeline.dataset.rendered === 'true') return;
  renderResearch();
  timeline.dataset.rendered = 'true';
}

document.addEventListener('DOMContentLoaded', safeRenderResearch);
document.addEventListener('sections:ready', safeRenderResearch);