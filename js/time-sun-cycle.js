(function () {
  'use strict';

  var ROOT = document.documentElement;
  var STATE_CLASS_SUNRISE = 'is-sunrise-window';
  var STATE_CLASS_SUNSET = 'is-sunset-window';
  var PARAM_NAME = 'sunEffect';
  var OVERLAY_CLASS = 'sun-cycle-overlay';
  var GLOBAL_KEY = '__heumadenSunCycle';
  var CHECK_INTERVAL_MS = 60 * 1000;

  function minutesFromMidnight(date) {
    return date.getHours() * 60 + date.getMinutes();
  }

  function isWithin(minutes, startHour, startMinute, endHour, endMinute) {
    var start = startHour * 60 + startMinute;
    var end = endHour * 60 + endMinute;
    return minutes >= start && minutes < end;
  }

  function forcedStateFromUrl() {
    try {
      var forced = new URLSearchParams(window.location.search).get(PARAM_NAME);
      if (!forced) return null;

      forced = forced.toLowerCase();
      if (forced === 'sunrise' || forced === 'sunset') return forced;
    } catch (error) {
      return null;
    }

    return null;
  }

  function resolveState(now) {
    var forced = forcedStateFromUrl();
    if (forced) return forced;

    var minutes = minutesFromMidnight(now || new Date());
    if (isWithin(minutes, 5, 0, 8, 30)) return 'sunrise';
    if (isWithin(minutes, 17, 30, 21, 30)) return 'sunset';

    return null;
  }

  function ensureLayer(overlay, modifierClass) {
    var selector = '.sun-cycle-layer--' + modifierClass;
    var layer = overlay.querySelector(selector);
    if (layer) return layer;

    layer = document.createElement('span');
    layer.className = 'sun-cycle-layer sun-cycle-layer--' + modifierClass;
    overlay.appendChild(layer);
    return layer;
  }

  function ensureOverlay() {
    if (!document.body) return null;

    var overlay = document.querySelector('.' + OVERLAY_CLASS);
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = OVERLAY_CLASS;
      document.body.appendChild(overlay);
    }

    overlay.setAttribute('aria-hidden', 'true');
    ensureLayer(overlay, 'sky');
    ensureLayer(overlay, 'horizon');
    ensureLayer(overlay, 'rays');

    return overlay;
  }

  function applyState() {
    var state = resolveState(new Date());
    var isSunrise = state === 'sunrise';
    var isSunset = state === 'sunset';

    ROOT.classList.toggle(STATE_CLASS_SUNRISE, isSunrise);
    ROOT.classList.toggle(STATE_CLASS_SUNSET, isSunset);

    if (state) {
      ROOT.setAttribute('data-sun-effect', state);
      ensureOverlay();
    } else {
      ROOT.removeAttribute('data-sun-effect');
    }
  }

  function init() {
    if (window[GLOBAL_KEY] && window[GLOBAL_KEY].timer) {
      window.clearInterval(window[GLOBAL_KEY].timer);
    }

    applyState();

    window[GLOBAL_KEY] = {
      apply: applyState,
      timer: window.setInterval(applyState, CHECK_INTERVAL_MS)
    };

    window.addEventListener('popstate', applyState);
  }

  if (document.body) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  }
}());
