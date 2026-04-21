(function () {
  'use strict';

  var EVENT_START = new Date('2026-04-24T12:00:00+02:00');
  var STORAGE_KEY = 'heumaden.countdownFireworks.v1';
  var COMPLETE_CLASS = 'is-countdown-complete';
  var OVERLAY_CLASS = 'fireworks-overlay';
  var TEST_PARAM = 'fireworks';
  var COMPLETE_MESSAGE = 'Der Lenzzauber ist los.';
  var CHECK_INTERVAL_MS = 1000;
  var TEST_TRIGGER_DELAY_MS = 450;
  var OVERLAY_LIFETIME_MS = 5200;
  var COLORS = ['#39ff14', '#00f5ff', '#bf00ff', '#ff9500', '#fff7a8', '#ff3fb4'];

  var hasTriggered = false;
  var completionTimer = null;
  var messageTimer = null;

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
      return;
    }

    fn();
  }

  function isTestMode() {
    try {
      return new URLSearchParams(window.location.search).get(TEST_PARAM) === '1';
    } catch (error) {
      return false;
    }
  }

  function parseForcedDate(value) {
    var normalized = String(value || '').trim().replace(/ (\d{2}:\d{2})$/, '+$1');
    var date = new Date(normalized);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function getForcedNow() {
    try {
      var params = new URLSearchParams(window.location.search);
      var forced = params.get('partyNow') || params.get('mementoNow');
      return forced ? parseForcedDate(forced) : null;
    } catch (error) {
      return null;
    }
  }

  function hasReducedMotion() {
    return window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function hasStoredCompletion() {
    try {
      return window.localStorage.getItem(STORAGE_KEY) === 'done';
    } catch (error) {
      return false;
    }
  }

  function storeCompletion() {
    try {
      window.localStorage.setItem(STORAGE_KEY, 'done');
    } catch (error) {
      // Private browsing or blocked storage should not break the effect.
    }
  }

  function setCountdownCompleteText() {
    var digits = document.getElementById('hc-digits');
    if (digits) {
      digits.textContent = COMPLETE_MESSAGE;
    }
  }

  function markComplete() {
    document.documentElement.classList.add(COMPLETE_CLASS);
    setCountdownCompleteText();

    if (!messageTimer) {
      messageTimer = window.setInterval(setCountdownCompleteText, 1200);
    }
  }

  function ensureStylesheet() {
    var existing = document.querySelector('link[href$="css/countdown-fireworks.css"]');
    if (existing) return;

    var currentScript = document.currentScript;
    var href = 'css/countdown-fireworks.css';

    if (currentScript && currentScript.src) {
      href = new URL('../css/countdown-fireworks.css', currentScript.src).href;
    }

    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function randomInt(min, max) {
    return Math.floor(randomBetween(min, max + 1));
  }

  function colorAt(index) {
    return COLORS[index % COLORS.length];
  }

  function createOverlay() {
    var oldOverlay = document.querySelector('.' + OVERLAY_CLASS);
    if (oldOverlay) oldOverlay.remove();

    var overlay = document.createElement('div');
    overlay.className = OVERLAY_CLASS;
    overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlay);
    return overlay;
  }

  function createBurst(overlay, index, reducedMotion) {
    var burst = document.createElement('div');
    var sparkCount = reducedMotion ? 10 : randomInt(22, 34);
    var x = randomBetween(12, 88);
    var y = randomBetween(16, 58);

    burst.className = 'fireworks-burst';
    burst.style.setProperty('--fireworks-x', x.toFixed(2) + 'vw');
    burst.style.setProperty('--fireworks-y', y.toFixed(2) + 'vh');
    burst.style.animationDelay = (index * 165).toFixed(0) + 'ms';

    for (var i = 0; i < sparkCount; i += 1) {
      var spark = document.createElement('i');
      var angle = (360 / sparkCount) * i + randomBetween(-8, 8);
      var distance = reducedMotion ? randomBetween(3.5, 6) : randomBetween(5.5, 15);
      var duration = reducedMotion ? 900 : randomInt(1100, 1780);
      var delay = index * 155 + randomInt(0, 180);

      spark.className = 'fireworks-spark';
      spark.style.setProperty('--spark-angle', angle.toFixed(2) + 'deg');
      spark.style.setProperty('--spark-distance', distance.toFixed(2) + 'rem');
      spark.style.setProperty('--spark-duration', duration + 'ms');
      spark.style.setProperty('--spark-delay', delay + 'ms');
      spark.style.setProperty('--spark-scale', randomBetween(0.72, 1.28).toFixed(2));
      spark.style.setProperty('--spark-end-scale', randomBetween(0.08, 0.26).toFixed(2));
      spark.style.setProperty('--spark-color', colorAt(i + index));
      burst.appendChild(spark);
    }

    overlay.appendChild(burst);
  }

  function createConfetti(overlay, reducedMotion) {
    var confettiCount = reducedMotion ? 16 : 72;

    for (var i = 0; i < confettiCount; i += 1) {
      var piece = document.createElement('i');
      var x = randomBetween(2, 98);
      var drift = randomBetween(-18, 18);
      var delay = reducedMotion ? 0 : randomInt(250, 1700);
      var duration = reducedMotion ? 900 : randomInt(2200, 3900);

      piece.className = 'fireworks-confetti';
      piece.style.setProperty('--confetti-x', x.toFixed(2) + 'vw');
      piece.style.setProperty('--confetti-drift', drift.toFixed(2) + 'vw');
      piece.style.setProperty('--confetti-delay', delay + 'ms');
      piece.style.setProperty('--confetti-duration', duration + 'ms');
      piece.style.setProperty('--confetti-rotate', randomInt(0, 360) + 'deg');
      piece.style.setProperty('--confetti-spin', randomInt(360, 1080) + 'deg');
      piece.style.setProperty('--confetti-w', randomBetween(0.24, 0.58).toFixed(2) + 'rem');
      piece.style.setProperty('--confetti-h', randomBetween(0.46, 1.05).toFixed(2) + 'rem');
      piece.style.setProperty('--confetti-color', colorAt(i));
      overlay.appendChild(piece);
    }
  }

  function launchFireworks(options) {
    var settings = options || {};
    var testMode = settings.testMode === true;

    if (hasTriggered && !testMode) return;
    hasTriggered = true;

    if (!testMode) {
      storeCompletion();
    }

    markComplete();

    var reducedMotion = hasReducedMotion();
    var overlay = createOverlay();
    var burstCount = reducedMotion ? 2 : 6;

    for (var i = 0; i < burstCount; i += 1) {
      createBurst(overlay, i, reducedMotion);
    }

    createConfetti(overlay, reducedMotion);

    window.setTimeout(function () {
      overlay.remove();
    }, reducedMotion ? 1200 : OVERLAY_LIFETIME_MS);
  }

  function checkCountdown(testMode) {
    var forcedNow = getForcedNow();
    var isComplete = (forcedNow || new Date()).getTime() >= EVENT_START.getTime();

    if (!isComplete) return;

    markComplete();

    if (completionTimer) {
      window.clearInterval(completionTimer);
      completionTimer = null;
    }

    if (forcedNow && !testMode) return;
    if (!testMode && hasStoredCompletion()) return;

    launchFireworks({ testMode: testMode });
  }

  function init() {
    var testMode = isTestMode();

    ensureStylesheet();

    if (testMode) {
      window.setTimeout(function () {
        launchFireworks({ testMode: true });
      }, TEST_TRIGGER_DELAY_MS);
      return;
    }

    checkCountdown(false);

    if (!completionTimer && !getForcedNow() && Date.now() < EVENT_START.getTime()) {
      completionTimer = window.setInterval(function () {
        checkCountdown(false);
      }, CHECK_INTERVAL_MS);
    }
  }

  window.HeumadenCountdownFireworks = {
    launch: function () {
      launchFireworks({ testMode: true });
    },
    markComplete: markComplete,
    storageKey: STORAGE_KEY
  };

  ready(init);
}());
