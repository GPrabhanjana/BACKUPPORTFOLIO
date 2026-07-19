(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var section = document.getElementById('extras');
  var bg = section.querySelector('.extras__parallax-bg');
  var content = section.querySelector('.extras__content');
  var cards = section.querySelectorAll('.extras__card');

  if (reduceMotion) return;

  /* Scroll-linked parallax: background drifts slower than the content */
  var ticking = false;

  function updateParallax() {
    var rect = section.getBoundingClientRect();
    var vh = window.innerHeight;

    // progress: -1 (section below viewport) to 1 (section above viewport)
    var progress = (rect.top - vh) / (vh + rect.height);

    bg.style.transform = 'translateY(' + (progress * -60) + 'px)';
    content.style.transform = 'translateY(' + (progress * 24) + 'px)';

    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });

  updateParallax();

  /* Cursor-follow tilt + spotlight per card */
  cards.forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var px = x / rect.width;
      var py = y / rect.height;

      var rx = (py - 0.5) * -6;
      var ry = (px - 0.5) * 6;

      card.style.setProperty('--rx', ry.toFixed(2) + 'deg');
      card.style.setProperty('--ry', rx.toFixed(2) + 'deg');
      card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
      card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
    });

    card.addEventListener('mouseleave', function () {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
})();
