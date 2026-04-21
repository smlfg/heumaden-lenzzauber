(function () {
  'use strict';

  var CHECK_INTERVAL_MS = 30 * 1000;
  var STATE_CLASSES = ['is-memento-past', 'is-memento-now', 'is-memento-upcoming'];
  var STATUS_LABELS = {
    past: 'abgelaufen',
    current: 'läuft gerade'
  };

  var PROGRAM_SLOTS = [
    ['.day-card--friday .slot', 0, '2026-04-24T12:00:00+02:00', '2026-04-24T15:00:00+02:00'],
    ['.day-card--friday .slot', 1, '2026-04-24T15:00:00+02:00', '2026-04-24T19:30:00+02:00'],
    ['.day-card--friday .slot', 2, '2026-04-24T17:30:00+02:00', '2026-04-24T19:30:00+02:00'],
    ['.day-card--friday .slot', 3, '2026-04-24T19:30:00+02:00', '2026-04-24T20:00:00+02:00'],
    ['.day-card--friday .slot', 4, '2026-04-24T20:00:00+02:00', '2026-04-24T20:30:00+02:00'],
    ['.day-card--friday .slot', 5, '2026-04-24T20:00:00+02:00', '2026-04-25T07:00:00+02:00'],
    ['.day-card--friday .slot', 6, '2026-04-24T20:00:00+02:00', '2026-04-25T07:30:00+02:00'],
    ['.day-card--saturday .slot', 0, '2026-04-25T08:00:00+02:00', '2026-04-25T11:00:00+02:00'],
    ['.day-card--saturday .slot', 1, '2026-04-25T11:00:00+02:00', '2026-04-25T14:00:00+02:00'],
    ['.day-card--saturday .slot', 2, '2026-04-25T14:00:00+02:00', '2026-04-25T18:00:00+02:00'],
    ['.day-card--saturday .slot', 3, '2026-04-25T18:00:00+02:00', '2026-04-25T20:00:00+02:00'],
    ['.day-card--saturday .slot', 4, '2026-04-25T20:00:00+02:00', '2026-04-26T08:00:00+02:00']
  ];

  var LINEUP_BASES = {
    friday: '2026-04-24',
    saturday: '2026-04-25'
  };

  var LINEUP_OPEN_ENDS = {
    friday: '2026-04-25T12:00:00+02:00',
    saturday: '2026-04-26T10:00:00+02:00'
  };

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
      return;
    }

    fn();
  }

  function parseForcedDate(value) {
    var normalized = String(value || '').trim().replace(/ (\d{2}:\d{2})$/, '+$1');
    var date = new Date(normalized);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function getNow() {
    try {
      var params = new URLSearchParams(window.location.search);
      var forced = params.get('partyNow') || params.get('mementoNow');
      if (forced) {
        var forcedDate = parseForcedDate(forced);
        if (forcedDate) return forcedDate;
      }
    } catch (error) {
      // Bad URLSearchParams support should fall back to real browser time.
    }

    return new Date();
  }

  function addDays(date, days) {
    var next = new Date(date.getTime());
    next.setDate(next.getDate() + days);
    return next;
  }

  function dateFromBaseAndMinutes(baseDate, dayOffset, minutes) {
    var date = addDays(baseDate, dayOffset);
    date.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
    return date;
  }

  function parseTimeToMinutes(value) {
    var match = String(value || '').match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;

    var hours = Number(match[1]);
    var minutes = Number(match[2]);
    if (hours > 23 || minutes > 59) return null;

    return hours * 60 + minutes;
  }

  function parseRange(value) {
    var normalized = String(value || '').trim().replace(/\s+/g, '');
    var match = normalized.match(/^(\d{1,2}:\d{2})[–-](END|\d{1,2}:\d{2})$/i);
    if (!match) return null;

    return {
      startMinutes: parseTimeToMinutes(match[1]),
      endMinutes: match[2].toUpperCase() === 'END' ? null : parseTimeToMinutes(match[2]),
      isOpenEnd: match[2].toUpperCase() === 'END'
    };
  }

  function getState(now, start, end) {
    if (now >= end) return 'past';
    if (now >= start && now < end) return 'current';
    return 'upcoming';
  }

  function ensureStateLabel(item) {
    var existing = item.querySelector(':scope > .memento-state');
    if (existing) return existing;

    var label = document.createElement('span');
    label.className = 'memento-state';
    item.appendChild(label);
    return label;
  }

  function applyState(item, state, start, end) {
    item.classList.remove.apply(item.classList, STATE_CLASSES);
    item.classList.add(state === 'past' ? 'is-memento-past' : state === 'current' ? 'is-memento-now' : 'is-memento-upcoming');
    item.dataset.mementoState = state;
    item.dataset.mementoStart = start.toISOString();
    item.dataset.mementoEnd = end.toISOString();

    var label = ensureStateLabel(item);
    if (state === 'past' || state === 'current') {
      label.textContent = STATUS_LABELS[state];
      label.hidden = false;
    } else {
      label.textContent = '';
      label.hidden = true;
    }
  }

  function applyProgramStates(now) {
    PROGRAM_SLOTS.forEach(function (slotDef) {
      var items = document.querySelectorAll(slotDef[0]);
      var item = items[slotDef[1]];
      if (!item) return;

      applyState(item, getState(now, new Date(slotDef[2]), new Date(slotDef[3])), new Date(slotDef[2]), new Date(slotDef[3]));
    });
  }

  function collectLineupItems(now) {
    var items = [];

    Object.keys(LINEUP_BASES).forEach(function (dayKey) {
      var container = document.getElementById(dayKey);
      if (!container) return;

      var base = new Date(LINEUP_BASES[dayKey] + 'T00:00:00+02:00');
      var cards = Array.from(container.querySelectorAll('.act-card'));
      var dayOffset = 0;
      var previousStart = null;

      cards.forEach(function (card) {
        var timeEl = card.querySelector('.act-time');
        var range = timeEl ? parseRange(timeEl.textContent) : null;
        if (!range || range.startMinutes === null) return;

        if (previousStart !== null && range.startMinutes < previousStart) {
          dayOffset += 1;
        }

        var start = dateFromBaseAndMinutes(base, dayOffset, range.startMinutes);
        var end = range.isOpenEnd
          ? new Date(LINEUP_OPEN_ENDS[dayKey])
          : dateFromBaseAndMinutes(base, dayOffset + (range.endMinutes <= range.startMinutes ? 1 : 0), range.endMinutes);

        previousStart = range.startMinutes;

        applyState(card, getState(now, start, end), start, end);
        items.push(card);
      });
    });

    return items;
  }

  function updateMementoTimeline() {
    var now = getNow();

    applyProgramStates(now);
    collectLineupItems(now);
  }

  ready(function () {
    updateMementoTimeline();
    window.setInterval(updateMementoTimeline, CHECK_INTERVAL_MS);
    window.HeumadenMementoTimeline = {
      update: updateMementoTimeline,
      getNow: getNow
    };
  });
}());
