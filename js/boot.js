/*
 * boot.js - runs in <head>, before first paint.
 * Turns on the intro state (content stays hidden until js/intro.js reveals it).
 * Skipped for users who prefer reduced motion. A timer removes the state
 * after 14 s so the page can never stay hidden if something fails.
 */
try {
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var root = document.documentElement;
    root.classList.add('js-intro');
    history.scrollRestoration = 'manual';
    scrollTo(0, 0);
    setTimeout(function () {
      root.classList.remove('js-intro');
    }, 14000);
  }
} catch (e) {}
