// Carousel autoplay with controls and focus-aware pausing

(function initCarousel(){
  const track = document.getElementById('carousel-track');
  if (!track) return;
  const slides = Array.from(track.children);
  const prev = document.getElementById('carousel-prev');
  const next = document.getElementById('carousel-next');
  const dotsWrap = document.getElementById('carousel-dots');
  let index = 0, timer = null;

  function renderDots() {
    dotsWrap.innerHTML = '';
    slides.forEach((_, i) => {
      const b = document.createElement('button');
      b.setAttribute('aria-label', `Go to slide ${i+1}`);
      if (i === index) b.classList.add('active');
      b.addEventListener('click', () => go(i));
      dotsWrap.appendChild(b);
    });
  }

  function go(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    renderDots();
  }

  function start() {
    stop();
    timer = setInterval(() => go(index + 1), 4000);
  }

  function stop() { if (timer) clearInterval(timer); }

  prev?.addEventListener('click', () => { go(index - 1); start(); });
  next?.addEventListener('click', () => { go(index + 1); start(); });
  track.addEventListener('mouseenter', stop);
  track.addEventListener('mouseleave', start);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else start(); });

  renderDots();
  go(0);
  start();
})();


