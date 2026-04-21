(function () {
  'use strict';

  const ROOT_CLASS = 'is-dj-transition';
  const OVERLAY_CLASS = 'dj-transition-overlay';
  const LINEUP_TAB_SELECTOR = '.programm-tab[data-view="lineup-fr"], .programm-tab[data-view="lineup-sa"]';
  const ACT_CARD_SELECTOR = '.act-card';
  const MOTION_QUERY = '(prefers-reduced-motion: reduce)';
  const FULL_DURATION = 560;
  const REDUCED_DURATION = 180;
  const COOLDOWN = 520;

  let overlay;
  let resetTimer;
  let lastTrigger = 0;

  function getRoot() {
    return document.documentElement;
  }

  function prefersReducedMotion() {
    return Boolean(window.matchMedia && window.matchMedia(MOTION_QUERY).matches);
  }

  function ensureOverlay() {
    if (overlay && document.body.contains(overlay)) return overlay;
    if (!document.body) return null;

    overlay = document.createElement('div');
    overlay.className = OVERLAY_CLASS;
    overlay.setAttribute('aria-hidden', 'true');

    const pulse = document.createElement('span');
    pulse.className = OVERLAY_CLASS + '__pulse';

    const glitch = document.createElement('span');
    glitch.className = OVERLAY_CLASS + '__glitch';

    const fader = document.createElement('span');
    fader.className = OVERLAY_CLASS + '__fader';

    overlay.append(pulse, glitch, fader);
    document.body.appendChild(overlay);
    return overlay;
  }

  function retriggerAnimations(node) {
    node.style.animation = 'none';
    for (const child of node.children) {
      child.style.animation = 'none';
    }

    void node.offsetWidth;

    node.style.animation = '';
    for (const child of node.children) {
      child.style.animation = '';
    }
  }

  function triggerDjTransition(reason) {
    const now = Date.now();
    if (now - lastTrigger < COOLDOWN) return;

    const node = ensureOverlay();
    if (!node) return;

    lastTrigger = now;
    node.dataset.djReason = reason || 'manual';
    retriggerAnimations(node);

    const root = getRoot();
    root.classList.add(ROOT_CLASS);

    window.clearTimeout(resetTimer);
    resetTimer = window.setTimeout(() => {
      root.classList.remove(ROOT_CLASS);
      if (overlay) {
        delete overlay.dataset.djReason;
      }
    }, prefersReducedMotion() ? REDUCED_DURATION : FULL_DURATION);
  }

  function handleClick(event) {
    const lineupTab = event.target.closest(LINEUP_TAB_SELECTOR);
    if (lineupTab) {
      triggerDjTransition('lineup-tab');
      return;
    }

    const actCard = event.target.closest(ACT_CARD_SELECTOR);
    if (actCard) {
      triggerDjTransition('act-card-click');
    }
  }

  function handleFocus(event) {
    if (event.target.closest(ACT_CARD_SELECTOR)) {
      triggerDjTransition('act-card-focus');
    }
  }

  function runUrlDemo() {
    let enabled = false;

    try {
      enabled = new URLSearchParams(window.location.search).get('djEffect') === '1';
    } catch (error) {
      enabled = window.location.search.indexOf('djEffect=1') !== -1;
    }

    if (!enabled) return;

    window.setTimeout(() => {
      triggerDjTransition('url-demo');
    }, prefersReducedMotion() ? 120 : 420);
  }

  function initDjTransition() {
    ensureOverlay();
    document.addEventListener('click', handleClick, true);
    document.addEventListener('focusin', handleFocus, true);
    runUrlDemo();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDjTransition, { once: true });
  } else {
    initDjTransition();
  }

  window.djTransitionEffect = Object.freeze({
    trigger: triggerDjTransition,
    rootClass: ROOT_CLASS,
    overlayClass: OVERLAY_CLASS
  });
})();
