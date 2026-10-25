const video = document.querySelector('[data-hero-video]');

if (video) {
  const reveal = () => {
    video.classList.add('is-ready');
    video.play().catch(() => {});
  };

  if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
    reveal();
  } else {
    video.addEventListener('canplay', reveal, { once: true });
  }
}
