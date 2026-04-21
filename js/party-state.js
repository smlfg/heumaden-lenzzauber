(function () {
  'use strict';

  var ROOT = document.documentElement;
  var CHECK_INTERVAL_MS = 30 * 1000;
  var FOCUS_CLASS = 'party-focus';
  var STATUS_CLASS = 'party-state-chip';
  var TRANCE_OVERLAY_CLASS = 'trance-overlay';
  var lastFocusKey = '';
  var PHASE_CLASSES = [
    'is-party-pre',
    'is-party-live',
    'is-party-afterparty',
    'is-party-setup',
    'is-party-workshops',
    'is-party-music-dj',
    'is-party-no-music-faq',
    'is-party-teardown'
  ];

  var WINDOWS = {
    start: new Date('2026-04-24T12:00:00+02:00'),
    setupEnd: new Date('2026-04-24T15:00:00+02:00'),
    workshopsEnd: new Date('2026-04-24T19:30:00+02:00'),
    fridayMusicEnd: new Date('2026-04-25T07:30:00+02:00'),
    saturdayMusicStart: new Date('2026-04-25T20:00:00+02:00'),
    saturdayMusicEnd: new Date('2026-04-26T10:00:00+02:00')
  };

  var STATE_LABELS = {
    'pre-party': {
      title: 'Pre-Party',
      text: 'Einladung, Packliste und Vorfreude sind jetzt die Hauptbühne.'
    },
    setup: {
      title: 'Live: Aufbau',
      text: 'Gerade zählt Ankommen, Aufbau und jede helfende Hand.'
    },
    workshops: {
      title: 'Live: Workshops',
      text: 'Workshopfenster läuft. Das Programm darf jetzt nach vorne.'
    },
    'music-dj-friday': {
      title: 'Live: Waldfloor',
      text: 'Musik läuft. Line-up und aktueller Slot sind jetzt im Fokus.'
    },
    'music-dj-saturday': {
      title: 'Live: Trance',
      text: 'Samstag Nacht ist offen, heller und im Trance-Modus.'
    },
    'no-music-faq': {
      title: 'Live: Pause',
      text: 'Keine Musikphase. Infos, FAQ, Community und Erholung sind relevant.'
    },
    teardown: {
      title: 'Afterparty',
      text: 'Abbau, Rückkehr und Abschlussmodus sind jetzt vorne.'
    }
  };

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
      return;
    }

    fn();
  }

  function getSearchParams() {
    try {
      return new URLSearchParams(window.location.search);
    } catch (error) {
      return null;
    }
  }

  function getParam(name) {
    var params = getSearchParams();
    if (params) return params.get(name);

    var match = window.location.search.match(new RegExp('[?&]' + name + '=([^&]+)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  function parseForcedDate(value) {
    var normalized = String(value || '').trim().replace(/ (\d{2}:\d{2})$/, '+$1');
    var date = new Date(normalized);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function getNow() {
    var forced = getParam('partyNow') || getParam('mementoNow');
    if (forced) {
      var forcedDate = parseForcedDate(forced);
      if (forcedDate) return forcedDate;
    }

    return new Date();
  }

  function isTranceForced() {
    var value = String(getParam('trance') || '').toLowerCase();
    return value === '1' || value === 'true' || value === 'yes';
  }

  function resolveState(now) {
    var forcedPhase = getParam('partyPhase');
    var forcedSubphase = getParam('partySubphase');

    if (forcedPhase) {
      return {
        phase: forcedPhase,
        subphase: forcedSubphase || null,
        musicDay: forcedSubphase === 'music-dj' ? 'saturday' : null,
        isTrance: isTranceForced()
      };
    }

    if (now < WINDOWS.start) {
      return { phase: 'pre-party', subphase: null, musicDay: null, isTrance: isTranceForced() };
    }

    if (now < WINDOWS.setupEnd) {
      return { phase: 'live', subphase: 'setup', musicDay: null, isTrance: isTranceForced() };
    }

    if (now < WINDOWS.workshopsEnd) {
      return { phase: 'live', subphase: 'workshops', musicDay: null, isTrance: isTranceForced() };
    }

    if (now < WINDOWS.fridayMusicEnd) {
      return { phase: 'live', subphase: 'music-dj', musicDay: 'friday', isTrance: isTranceForced() };
    }

    if (now < WINDOWS.saturdayMusicStart) {
      return { phase: 'live', subphase: 'no-music-faq', musicDay: null, isTrance: isTranceForced() };
    }

    if (now < WINDOWS.saturdayMusicEnd) {
      return { phase: 'live', subphase: 'music-dj', musicDay: 'saturday', isTrance: true };
    }

    return { phase: 'afterparty', subphase: 'teardown', musicDay: null, isTrance: isTranceForced() };
  }

  function statusKey(state) {
    if (state.phase === 'pre-party') return 'pre-party';
    if (state.subphase === 'music-dj') return state.musicDay === 'saturday' ? 'music-dj-saturday' : 'music-dj-friday';
    return state.subphase || state.phase;
  }

  function ensureStatusChip() {
    var hero = document.getElementById('hero');
    if (!hero) return null;

    var chip = hero.querySelector('.' + STATUS_CLASS);
    if (chip) return chip;

    chip = document.createElement('div');
    chip.className = STATUS_CLASS;
    chip.setAttribute('aria-live', 'polite');

    var title = document.createElement('span');
    title.className = STATUS_CLASS + '__title';

    var text = document.createElement('span');
    text.className = STATUS_CLASS + '__text';

    chip.append(title, text);

    var countdown = document.getElementById('hero-countdown');
    if (countdown) {
      countdown.after(chip);
    } else {
      hero.appendChild(chip);
    }

    return chip;
  }

  function updateStatusChip(state) {
    var chip = ensureStatusChip();
    if (!chip) return;

    var label = STATE_LABELS[statusKey(state)] || STATE_LABELS['pre-party'];
    chip.querySelector('.' + STATUS_CLASS + '__title').textContent = label.title;
    chip.querySelector('.' + STATUS_CLASS + '__text').textContent = label.text;
  }

  function clearFocus() {
    document.querySelectorAll('.' + FOCUS_CLASS).forEach(function (node) {
      node.classList.remove(FOCUS_CLASS);
    });
  }

  function focusSelector(selector) {
    document.querySelectorAll(selector).forEach(function (node) {
      node.classList.add(FOCUS_CLASS);
    });
  }

  function focusSlot(selector, index) {
    var item = document.querySelectorAll(selector)[index];
    if (item) item.classList.add(FOCUS_CLASS);
  }

  function openSection(id) {
    var section = document.getElementById(id);
    if (!section || !window.setCollapsibleState) return;
    window.setCollapsibleState(section, true, { exclusive: false });
  }

  function applyFocus(state) {
    var focusKey = state.phase + ':' + (state.subphase || 'none') + ':' + (state.musicDay || 'none');
    var shouldOpenSections = focusKey !== lastFocusKey;
    lastFocusKey = focusKey;

    clearFocus();

    if (state.phase === 'pre-party') {
      focusSelector('#hero, #support, #einkauf');
      if (shouldOpenSections) openSection('einkauf');
      return;
    }

    if (state.subphase === 'setup') {
      focusSelector('#programm, #prog-helfen, .programm-tab[data-view="helfen"]');
      focusSlot('.day-card--friday .slot', 0);
      return;
    }

    if (state.subphase === 'workshops') {
      focusSelector('#programm, #prog-workshops, #prog-workshop-timetable, .programm-tab[data-view="workshops"], .programm-tab[data-view="workshop-timetable"]');
      focusSlot('.day-card--friday .slot', 1);
      focusSlot('.day-card--friday .slot', 2);
      return;
    }

    if (state.subphase === 'music-dj') {
      var lineupSelector = state.musicDay === 'saturday' ? '#saturday' : '#friday';
      var tabSelector = state.musicDay === 'saturday'
        ? '.programm-tab[data-view="lineup-sa"]'
        : '.programm-tab[data-view="lineup-fr"]';

      focusSelector('#programm, ' + lineupSelector + ', ' + tabSelector + ', .act-card.is-memento-now');
      return;
    }

    if (state.subphase === 'no-music-faq') {
      focusSelector('#faq, #infos, #community, .programm-tab[data-view="ablauf"], .day-card--saturday');
      if (shouldOpenSections) {
        openSection('faq');
        openSection('infos');
      }
      return;
    }

    if (state.phase === 'afterparty' || state.subphase === 'teardown') {
      focusSelector('#programm, #prog-helfen, .programm-tab[data-view="helfen"], #community');
      if (shouldOpenSections) openSection('community');
    }
  }

  function ensureTranceOverlay() {
    if (!document.body) return null;

    var overlay = document.querySelector('.' + TRANCE_OVERLAY_CLASS);
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = TRANCE_OVERLAY_CLASS;
      overlay.setAttribute('aria-hidden', 'true');
      overlay.innerHTML = '<span class="trance-overlay__horizon"></span><span class="trance-overlay__rings"></span><span class="trance-overlay__rays"></span>';
      document.body.appendChild(overlay);
    }

    return overlay;
  }

  function applyRootState(state) {
    PHASE_CLASSES.forEach(function (className) {
      ROOT.classList.remove(className);
    });

    ROOT.dataset.partyPhase = state.phase;
    ROOT.classList.add('is-party-' + (state.phase === 'pre-party' ? 'pre' : state.phase));

    if (state.subphase) {
      ROOT.dataset.partySubphase = state.subphase;
      ROOT.classList.add('is-party-' + state.subphase);
    } else {
      delete ROOT.dataset.partySubphase;
    }

    if (state.musicDay) {
      ROOT.dataset.partyMusicDay = state.musicDay;
    } else {
      delete ROOT.dataset.partyMusicDay;
    }

    ROOT.classList.toggle('is-trance-mode', Boolean(state.isTrance));

    if (state.isTrance) {
      ROOT.dataset.partySkin = 'trance';
      ensureTranceOverlay();
    } else {
      delete ROOT.dataset.partySkin;
    }
  }

  function updatePartyState() {
    var now = getNow();
    var state = resolveState(now);
    state.now = now;

    applyRootState(state);
    updateStatusChip(state);
    applyFocus(state);

    window.dispatchEvent(new CustomEvent('heumaden:party-state', { detail: state }));
    return state;
  }

  ready(function () {
    var state = updatePartyState();
    window.setInterval(updatePartyState, CHECK_INTERVAL_MS);

    window.HeumadenPartyState = {
      getNow: getNow,
      update: updatePartyState,
      current: function () {
        return resolveState(getNow());
      },
      windows: WINDOWS
    };

    if (window.HeumadenMementoTimeline && typeof window.HeumadenMementoTimeline.update === 'function') {
      window.HeumadenMementoTimeline.update();
    }

    window.dispatchEvent(new CustomEvent('heumaden:party-state-ready', { detail: state }));
  });
}());
