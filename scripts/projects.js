/* Add, remove, or reorder objects in this array to update the projects rail. */
const PROJECTS = [
  {
  title: 'OralGuard – AI-Based Oral Cancer Detection System',
  year: '2026',
  type: 'Project',
  description: 'Built a MobileNetV2-based CBIR pipeline for AI-assisted oral cancer image retrieval and clinical decision support.',
  tags: ['Python', 'FastAPI', 'Flutter', 'Docker', 'CBIR'],
  links: [{ label: 'GitHub', url: 'https://github.com/theyrshetty/Oral-Cancer-Detection---Seed-Money-Project', icon: '↗' }]
},
  {title: 'Lok Sabha Political Speech Analysis',
  year: '2025',
  type: 'Project',
  description: 'Developed IndicBERT-based multilingual NLP models for classifying 25K+ Lok Sabha speech segments by topic and scope.',
  tags: ['Python', 'R', 'Transformers', 'Hugging Face', 'NLP'],
  links: [{ label: 'GitHub', url: 'https://github.com/theyrshetty/Indo-German-Research-Internship', icon: '↗' }]
},
 {
  title: 'AI Stock Predictor',
  year: '2025',
  type: 'Project',
  description: 'Built an LSTM-based stock market forecasting pipeline with interactive visualizations.',
  tags: ['Python', 'TensorFlow', 'LSTM', 'Scikit-learn', 'Yahoo Finance'],
  links: [{ label: 'GitHub', url: 'https://github.com/theyrshetty/AI-Stock-Predictor', icon: '↗' }]
},
  { title: 'Project Four', year: 'xxxx', type: 'Project', description: 'Coming Soon...', tags: ['', ''], links: [{ label: 'GitHub', url: '', icon: '↗' }] },
  { title: 'Project Five', year: 'xxxx', type: 'Project', description: 'Coming Soon...', tags: [' ', ''], links: [{ label: 'Demo', url: '', icon: '↗' }] },
  { title: 'Research', year: 'Selected work', type: 'Research', description: 'Find papers, working notes, and research updates on ResearchGate.', tags: ['ResearchGate'], links: [{ label: 'Visit ResearchGate', url: 'https://www.researchgate.net/profile/Yashas-Shetty-2/research', icon: '↗' }], research: true },
];

const CLIP = '<svg viewBox="0 0 22 26" width="22" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 2v16a4 4 0 01-8 0V7a2.5 2.5 0 015 0v11" /></svg>';

function renderProjects() {
  const rail = document.getElementById('projects-grid');
  if (!rail || rail.dataset.rendered) return;
  PROJECTS.forEach((project, index) => {
    const card = document.createElement('article');
    card.className = `projects__card${project.research ? ' projects__card--research' : ''}`;
    const tilts = ['0deg', '-1.8deg', '1.8deg'];
    card.style.setProperty('--tilt', tilts[Math.floor(Math.random() * tilts.length)]);
    card.style.setProperty('--sway-duration', `${(4.5 + Math.random() * 2.5).toFixed(2)}s`);
    const tags = project.tags.map((tag) => `<span class="projects__tag">${tag}</span>`).join('');
    const links = project.links.map((link) => link.url
      ? `<a class="projects__link" href="${link.url}" target="_blank" rel="noreferrer">${link.label} <span aria-hidden="true">${link.icon}</span></a>`
      : `<span class="projects__link" aria-disabled="true">${link.label} <span aria-hidden="true">${link.icon}</span></span>`).join('');
    card.innerHTML = `<span class="projects__clip" aria-hidden="true">${CLIP}</span><p class="projects__meta">${project.type} · ${project.year}</p><h3 class="projects__title">${project.title}</h3><p class="projects__description">${project.description}</p><div class="projects__tags">${tags}</div><div class="projects__links">${links}</div>`;
    rail.appendChild(card);
  });
  rail.dataset.rendered = 'true';
  initProjectScroll(rail);
}

function initProjectScroll(rail) {
  const section = document.getElementById('projects');
  const viewport = section?.querySelector('.projects__viewport');
  if (!section || !viewport || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let ticking = false;
  function update() {
    ticking = false;
    const distance = section.offsetHeight - window.innerHeight;
    const progress = distance > 0 ? Math.min(1, Math.max(0, -section.getBoundingClientRect().top / distance)) : 0;
    const travel = Math.max(0, rail.scrollWidth - viewport.clientWidth);
    rail.style.transform = `translate3d(${-travel * progress}px, 0, 0)`;
  }
  function requestUpdate() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  window.addEventListener('load', requestUpdate, { once: true });
  requestUpdate();
}

document.addEventListener('DOMContentLoaded', renderProjects);
document.addEventListener('sections:ready', renderProjects);
