function initContactCopyButton() {
  var btn = document.getElementById('contact-copy-btn');
  if (!btn) return;
  if (btn.dataset.copyReady === 'true') return;
  btn.dataset.copyReady = 'true';

  var resetTimer;

  btn.addEventListener('click', function () {
    var email = btn.getAttribute('data-email');

    function markCopied() {
      btn.setAttribute('data-copied', 'true');
      clearTimeout(resetTimer);
      resetTimer = setTimeout(function () {
        btn.setAttribute('data-copied', 'false');
      }, 1800);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(markCopied).catch(function () {
        fallbackCopy(email);
        markCopied();
      });
    } else {
      fallbackCopy(email);
      markCopied();
    }
  });

  function fallbackCopy(text) {
    var temp = document.createElement('textarea');
    temp.value = text;
    temp.style.position = 'fixed';
    temp.style.opacity = '0';
    document.body.appendChild(temp);
    temp.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(temp);
  }
}

if (document.getElementById('contact-copy-btn')) {
  initContactCopyButton();
} else {
  document.addEventListener('sections:ready', initContactCopyButton, { once: true });
}

const track = document.querySelector(".contact__marquee-track");
if (track) track.innerHTML += track.innerHTML;
