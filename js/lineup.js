// ═══════════════════════════════════════════════════════════
// PROGRAMM TAB SWITCHER
// ═══════════════════════════════════════════════════════════
const programmTabs = document.querySelectorAll('.programm-tab');
const progViews = document.querySelectorAll('.prog-view');

function activateTab(viewName) {
  const tab = document.querySelector('.programm-tab[data-view="' + viewName + '"]');
  if (!tab) return;
  programmTabs.forEach(t => t.classList.remove('active'));
  progViews.forEach(v => v.classList.remove('active-view'));
  tab.classList.add('active');
  const target = document.getElementById('prog-' + viewName);
  if (target) target.classList.add('active-view');
}

programmTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    activateTab(tab.dataset.view);
  });
});

// Activate correct tab when navigating via hash (e.g. #prog-helfen)
function handleHash() {
  const hash = window.location.hash; // e.g. "#prog-helfen"
  if (!hash) return;
  const match = hash.match(/^#prog-(.+)$/);
  if (match) {
    activateTab(match[1]);
    // Scroll to top of programme section
    const progSection = document.getElementById('programm');
    if (progSection) progSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
window.addEventListener('hashchange', handleHash);
handleHash(); // Run on page load in case hash is already set

// ─── Weather bar (Friday only, Open-Meteo) ───
const HEUMADEN_LAT = 48.74;
const HEUMADEN_LON = 9.19;
const EVENT_FRIDAY = '2026-04-24';

const weatherBar = document.getElementById('weather-bar');

async function loadFridayWeather() {
  if (!weatherBar) return;
  weatherBar.classList.add('hidden');
  weatherBar.replaceChildren();

  try {
    const url =
      'https://api.open-meteo.com/v1/forecast' +
      '?latitude=' + HEUMADEN_LAT +
      '&longitude=' + HEUMADEN_LON +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum' +
      '&timezone=Europe%2FBerlin' +
      '&start_date=' + EVENT_FRIDAY +
      '&end_date=' + EVENT_FRIDAY;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Weather API error');
    const data = await res.json();

    const idx = data.daily?.time?.indexOf(EVENT_FRIDAY) ?? -1;
    if (idx === -1) return; // event date not in forecast range

    const code = data.daily.weather_code?.[idx];
    const maxRaw = data.daily.temperature_2m_max?.[idx];
    const minRaw = data.daily.temperature_2m_min?.[idx];
    const precip = data.daily.precipitation_sum?.[idx];

    if (!Number.isFinite(maxRaw) || !Number.isFinite(minRaw)) return;

    const max = Math.round(maxRaw);
    const min = Math.round(minRaw);

    const icons = { clear: '☀️', partly: '⛅', cloudy: '☁️', fog: '🌫️', drizzle: '🌦️', rain: '🌧️', snow: '❄️', thunder: '⛈️', unknown: '🌤️' };
    const descs = {
      0: ['Klar', 'clear'], 1: ['Leicht bewölkt', 'partly'], 2: ['Bewölkt', 'cloudy'],
      3: ['Bedeckt', 'cloudy'], 45: ['Nebel', 'fog'], 48: ['Reifnebel', 'fog'],
      51: ['Leichter Niesel', 'drizzle'], 53: ['Niesel', 'drizzle'], 55: ['Starker Niesel', 'drizzle'],
      61: ['Leichter Regen', 'rain'], 63: ['Regen', 'rain'], 65: ['Starker Regen', 'rain'],
      71: ['Leichter Schnee', 'snow'], 73: ['Schnee', 'snow'], 75: ['Starker Schnee', 'snow'],
      80: ['Leichte Schauer', 'rain'], 81: ['Schauer', 'rain'], 82: ['Starke Schauer', 'rain'],
      95: ['Gewitter', 'thunder'], 96: ['Gewitter + Hagel', 'thunder'], 99: ['Gewitter + Hagel', 'thunder']
    };
    const [desc, key] = (descs[code] || ['Wetter noch offen', 'unknown']);
    const icon = icons[key] || icons.unknown;
    const precipLine = Number.isFinite(precip)
      ? (precip > 0 ? ` · ${precip.toLocaleString('de-DE', { maximumFractionDigits: 1 })} mm Regen` : ' · kein Regen')
      : '';

    const day = document.createElement('span');
    day.className = 'weather-bar-day';
    day.textContent = 'Fr · 24. Apr';

    const iconEl = document.createElement('span');
    iconEl.className = 'weather-bar-icon';
    iconEl.textContent = icon;

    const temp = document.createElement('span');
    temp.className = 'weather-bar-temp';
    temp.textContent = `${min}–${max}°C`;

    const sep = document.createElement('span');
    sep.className = 'weather-bar-sep';
    sep.textContent = '·';

    const descEl = document.createElement('span');
    descEl.className = 'weather-bar-desc';
    descEl.textContent = desc + precipLine;

    weatherBar.replaceChildren(day, iconEl, temp, sep, descEl);
    weatherBar.classList.remove('hidden');
  } catch (e) {
    // API failed or forecast is unavailable: stay hidden.
  }
}

// Load weather after page is interactive
window.setTimeout(loadFridayWeather, 1200);

// ─── Quick section jump (mobile-friendly) ───
const sectionJump = document.getElementById('section-jump');

if (sectionJump) {
  sectionJump.addEventListener('change', () => {
    const selector = sectionJump.value;
    if (!selector) return;

    const target = document.querySelector(selector);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    window.setTimeout(() => {
      sectionJump.value = '';
    }, 250);
  });
}

// ─── Support CTA helpers ───
const paypalCopyBtn = document.getElementById('paypal-copy-btn');

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const helper = document.createElement('textarea');
  helper.value = text;
  helper.setAttribute('readonly', '');
  helper.style.position = 'absolute';
  helper.style.left = '-9999px';
  document.body.appendChild(helper);
  helper.select();
  document.execCommand('copy');
  helper.remove();
}

if (paypalCopyBtn) {
  paypalCopyBtn.addEventListener('click', async () => {
    const paypalEmail = paypalCopyBtn.dataset.paypalEmail;
    const defaultLabel = paypalCopyBtn.dataset.defaultLabel || 'PayPal-Adresse kopieren';
    const successLabel = paypalCopyBtn.dataset.successLabel || 'Adresse kopiert';

    if (!paypalEmail) return;

    try {
      await copyText(paypalEmail);
      paypalCopyBtn.textContent = successLabel;
    } catch (error) {
      paypalCopyBtn.textContent = paypalEmail;
    }

    window.setTimeout(() => {
      paypalCopyBtn.textContent = defaultLabel;
    }, 1800);
  });
}

// ═══════════════════════════════════════════════════════════
// SOUNDCLOUD ARTIST CARDS
// ═══════════════════════════════════════════════════════════
const soundCloudCache = new Map();

function buildArtistProfile(act, data, scUrl) {
  const placeholder = act.querySelector('.act-avatar-placeholder');
  const existingName = act.querySelector('.act-name');
  const existingNote = act.querySelector('.act-note');
  const authorName = (data.author_name || '').trim();
  const title = (data.title || '').trim();
  const description = (data.description || '').trim();
  const authorUrl = data.author_url || scUrl;

  if (!existingName && authorName) {
    const nameEl = document.createElement('span');
    nameEl.className = 'act-name';
    nameEl.textContent = authorName;
    act.querySelector('.act-info')?.prepend(nameEl);
  }

  if (placeholder && data.thumbnail_url) {
    const avatarUrl = data.thumbnail_url.replace(/^http:\/\//, 'https://');
    placeholder.textContent = '';

    const avatar = document.createElement('img');
    avatar.src = avatarUrl;
    avatar.alt = authorName ? `${authorName} SoundCloud Profilbild` : 'SoundCloud Profilbild';
    avatar.loading = 'lazy';
    placeholder.appendChild(avatar);
  }

  let profile = act.querySelector('.act-profile');
  if (!profile) {
    profile = document.createElement('div');
    profile.className = 'act-profile';
    profile.hidden = true;
    act.appendChild(profile);
  }

  profile.replaceChildren();

  const kicker = document.createElement('div');
  kicker.className = 'act-profile-kicker';
  kicker.textContent = 'SoundCloud Selbstbeschreibung';
  profile.appendChild(kicker);

  if (title && (!existingNote || !existingNote.textContent.includes(title))) {
    const titleEl = document.createElement('div');
    titleEl.className = 'act-profile-title';
    titleEl.textContent = title;
    profile.appendChild(titleEl);
  }

  const bioEl = document.createElement('p');
  bioEl.className = 'act-profile-text';
  bioEl.textContent = description || 'Keine Profilbeschreibung auf SoundCloud hinterlegt. Profil direkt auf SoundCloud ansehen.';
  profile.appendChild(bioEl);

  const linkEl = document.createElement('a');
  linkEl.className = 'act-profile-link';
  linkEl.href = authorUrl;
  linkEl.target = '_blank';
  linkEl.rel = 'noopener';
  linkEl.textContent = 'SoundCloud-Profil öffnen';
  profile.appendChild(linkEl);

  const hintEl = document.createElement('div');
  hintEl.className = 'act-profile-hint';
  hintEl.textContent = 'Tippen zum Auf- und Zuklappen';
  if (!act.querySelector('.act-profile-hint--inline')) {
    const inlineHint = hintEl.cloneNode(true);
    inlineHint.classList.add('act-profile-hint--inline');
    act.querySelector('.act-info')?.appendChild(inlineHint);
  }

  act.classList.add('act-card--interactive');
  act.tabIndex = 0;
  act.setAttribute('role', 'button');
  act.setAttribute('aria-expanded', 'false');
  act.title = 'Tippen für SoundCloud-Bio';
}

function attachArtistToggle(act) {
  if (act.dataset.toggleBound === 'true') return;

  const toggle = () => {
    const profile = act.querySelector('.act-profile');
    if (!profile) return;

    const isOpen = !profile.hidden;
    profile.hidden = isOpen;
    act.classList.toggle('is-open', !isOpen);
    act.setAttribute('aria-expanded', String(!isOpen));
  };

  act.addEventListener('click', event => {
    if (event.target.closest('a')) return;
    toggle();
  });

  act.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    toggle();
  });

  act.dataset.toggleBound = 'true';
}

async function fetchSoundCloudProfile(scUrl) {
  if (soundCloudCache.has(scUrl)) {
    return soundCloudCache.get(scUrl);
  }

  const request = fetch(
    'https://soundcloud.com/oembed?format=json&maxwidth=160&maxheight=160&url=' + encodeURIComponent(scUrl)
  ).then(async response => {
    if (!response.ok) {
      throw new Error('SoundCloud oEmbed request failed');
    }
    return response.json();
  });

  soundCloudCache.set(scUrl, request);
  return request;
}

async function loadSoundCloudArtists() {
  const acts = document.querySelectorAll('.act-card[data-sc-url]');

  for (const act of acts) {
    const scUrl = act.dataset.scUrl;
    if (!scUrl) continue;

    try {
      const data = await fetchSoundCloudProfile(scUrl);
      buildArtistProfile(act, data, scUrl);
      attachArtistToggle(act);
    } catch (error) {
      // Network/CORS issues keep the default card visible without breaking the lineup.
    }
  }
}

if (document.querySelector('.act-card[data-sc-url]')) {
  window.setTimeout(loadSoundCloudArtists, 500);
}

// ═══════════════════════════════════════════════════════════
// EINKAUF & TOOLS
// ═══════════════════════════════════════════════════════════
const drinkTypeSelect = document.getElementById('drink-type');
const drinkCustomWrap = document.getElementById('drink-custom-wrap');
const drinkCustomInput = document.getElementById('drink-custom');
const drinkThirstInput = document.getElementById('drink-thirst');
const drinkDurationInput = document.getElementById('drink-duration');
const drinkStockInput = document.getElementById('drink-stock');
const drinkShareInput = document.getElementById('drink-share');
const drinkCalcBtn = document.getElementById('drink-calc-btn');
const drinkResult = document.getElementById('drink-result');
const smokeModeSelect = document.getElementById('smoke-mode');
const smokeTypeSelect = document.getElementById('smoke-type');
const smokePouchWrap = document.getElementById('smoke-pouch-wrap');
const smokePouchSelect = document.getElementById('smoke-pouch');
const smokeDurationSelect = document.getElementById('smoke-duration');
const smokeStockInput = document.getElementById('smoke-stock');
const smokeVapeInput = document.getElementById('smoke-vape');
const smokeAshInput = document.getElementById('smoke-ash');
const smokeCalcBtn = document.getElementById('smoke-calc-btn');
const smokeResult = document.getElementById('smoke-result');
const jointModeSelect = document.getElementById('joint-mode');
const jointLengthInput = document.getElementById('joint-length');
const jointDurationSelect = document.getElementById('joint-duration');
const jointPauseSelect = document.getElementById('joint-pause');
const jointPreparedInput = document.getElementById('joint-prepared');
const jointReserveInput = document.getElementById('joint-reserve');
const jointAvoidMixInput = document.getElementById('joint-avoid-mix');
const jointCalcBtn = document.getElementById('joint-calc-btn');
const jointResult = document.getElementById('joint-result');
const vendingPrintTimers = new WeakMap();
const vendingFeedbackTimers = new WeakMap();

function formatNumberRange(value) {
  return value.toFixed(value >= 10 ? 0 : 1).replace('.', ',');
}

function clampIntegerInput(input, fallback, min, max) {
  const value = Number.parseInt(input?.value, 10);
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function resultList(items) {
  return `<ul class="tool-result-list">${items
    .map(([label, value]) => `<li><span>${label}</span><strong>${value}</strong></li>`)
    .join('')}</ul>`;
}

function resultChips(items) {
  return `<div class="tool-result-chips">${items.map(item => `<span>${item}</span>`).join('')}</div>`;
}

function setToolResult(target, mainText, noteText, details = [], chips = [], warningText = '') {
  if (!target) return;
  const machine = target.closest('.vending-machine');
  target.classList.remove('vending-display--standby');
  machine?.classList.add('vending-machine--awake');
  target.innerHTML =
    `<p class="tool-result-main">${mainText}</p>` +
    (details.length ? resultList(details) : '') +
    (noteText ? `<p class="tool-result-note">${noteText}</p>` : '') +
    (warningText ? `<p class="tool-result-warning">${warningText}</p>` : '') +
    (chips.length ? resultChips(chips) : '');

  if (!machine) return;

  const existingTimer = vendingPrintTimers.get(machine);
  if (existingTimer) {
    window.clearTimeout(existingTimer);
  }

  machine.classList.remove('vending-machine--printing');
  target.classList.remove('vending-display--printing');
  void machine.offsetWidth;
  machine.classList.add('vending-machine--printing');
  target.classList.add('vending-display--printing');

  const timer = window.setTimeout(() => {
    machine.classList.remove('vending-machine--printing');
    target.classList.remove('vending-display--printing');
    vendingPrintTimers.delete(machine);
  }, 900);

  vendingPrintTimers.set(machine, timer);
}

function setToolPrompt(target, text) {
  if (!target) return;
  const machine = target.closest('.vending-machine');
  const existingTimer = machine ? vendingPrintTimers.get(machine) : null;
  if (existingTimer) {
    window.clearTimeout(existingTimer);
    vendingPrintTimers.delete(machine);
  }
  target.classList.add('vending-display--standby');
  target.classList.remove('vending-display--printing', 'vending-display--receipt');
  machine?.classList.remove('vending-machine--awake', 'vending-machine--printing');
  target.innerHTML = `<p class="tool-result-empty">${text}</p>`;
}

function isBlankInput(input) {
  return !input || input.value.trim() === '';
}

function formatPackRange(low, high, packSize = 20) {
  const lowPacks = Math.max(0, Math.ceil(low / packSize));
  const highPacks = Math.max(lowPacks, Math.ceil(high / packSize));
  return `${lowPacks}–${highPacks}`;
}

function describeDrinkRange(type, low, high, customText) {
  switch (type) {
    case 'bier':
      return high >= 20
        ? `${low}–${high} Bier, also grob ${formatPackRange(low, high)} Kisten/Trays`
        : `${low}–${high} Bier`;
    case 'wein': {
      const lowBottles = Math.max(1, Math.round(low / 3));
      const highBottles = Math.max(lowBottles, Math.round(high / 3));
      return `${lowBottles}–${highBottles} Flaschen Wein`;
    }
    case 'longdrink': {
      const lowBottles = Math.max(1, Math.round(low / 5));
      const highBottles = Math.max(lowBottles, Math.round(high / 4));
      return `${low}–${high} Longdrinks oder grob ${lowBottles}–${highBottles} Flaschen Basis plus Mixer`;
    }
    case 'mate':
      return high >= 12 ? 'eine halbe bis ganze Kiste Mate' : `${low}–${high} Mate`;
    case 'wasser':
      return '';
    case 'softdrink':
      return high >= 12 ? 'eine halbe bis ganze Kiste Softdrinks' : `${low}–${high} Softdrinks`;
    case 'custom': {
      const label = escapeHtml((customText || 'deines Lieblingsgetränks').trim());
      return `${low}–${high} Einheiten ${label}`;
    }
    default:
      return `${low}–${high} Getränke`;
  }
}

function getWaterRange(duration, thirst, shares, crew) {
  const baseRanges = {
    friday: [2.2, 3.1],
    saturday: [2, 2.9],
    both: [2.7, 3.9],
    overnight: [3.4, 4.8]
  };
  const thirstBoost = {
    leicht: 0,
    normal: 0.45,
    stabil: 0.85,
    eskalativ: 1.35,
    alkoholiker: 2
  };

  const range = baseRanges[duration] || baseRanges.both;
  const extra = thirstBoost[thirst] ?? 0.25;
  const shareBoost = shares ? 0.5 : 0;

  return [
    Math.max(1, (range[0] + extra + shareBoost) * crew),
    Math.max(1.5, (range[1] + extra + shareBoost) * crew)
  ];
}

function updateDrinkCalculator() {
  if (!drinkResult || !drinkTypeSelect || !drinkThirstInput || !drinkDurationInput || !drinkShareInput) {
    return;
  }
  const crew = 1;
  const thirst = drinkThirstInput.value;
  const drinkType = drinkTypeSelect.value;
  const duration = drinkDurationInput.value;
  const stock = clampIntegerInput(drinkStockInput, 0, 0, 300);
  const shares = drinkShareInput.checked;
  const customText = drinkCustomInput?.value.trim();

  if (drinkCustomWrap) {
    drinkCustomWrap.classList.toggle('hidden', drinkType !== 'custom');
  }

  const thirstBase = {
    leicht: 4,
    normal: 7,
    stabil: 10,
    eskalativ: 13,
    alkoholiker: 18
  };
  const durationMultiplier = {
    friday: 1.15,
    saturday: 1.05,
    both: 2.1,
    overnight: 2.45
  };

  const shareMultiplier = shares ? 1.18 : 1;
  const base = (thirstBase[thirst] || 5) * (durationMultiplier[duration] || 1.8) * crew * shareMultiplier;
  const low = Math.max(0, Math.round(base - stock));
  const high = Math.max(low, Math.round(base * 1.25 - stock));
  const [waterLow, waterHigh] = getWaterRange(duration, thirst, shares, crew);
  const waterText = `${formatNumberRange(waterLow)}–${formatNumberRange(waterHigh)} Liter Wasser`;

  let mainText = `Automat sagt für dich: ${describeDrinkRange(drinkType, low, high, customText)} plus mindestens ${waterText}.`;
  let noteText = 'Charmante Näherung. Wenn dein Rucksack es hergibt, lieber einen Tick zu freundlich planen.';
  let warningText = '';

  if (drinkType === 'wasser') {
    mainText = `Automat sagt für dich: ${waterText}. Elegant, hydriert, zukunftsfähig.`;
    noteText = 'Grobe Schätzung, keine Wissenschaft. Wer Wasser mitbringt, macht selten etwas falsch.';
  } else if (high <= 0) {
    mainText = `Automat sagt: Dein Vorrat reicht für dieses Getränk schon. Wasser trotzdem nicht vergessen: ${waterText}.`;
    noteText = 'Der Automat zieht deinen vorhandenen Vorrat ab und zeigt keine negativen Einkaufslisten.';
  } else if (thirst === 'alkoholiker') {
    warningText = 'Sehr großzügig geplant. Wenn das bei dir nicht nur Selbstironie ist, schau bitte auch auf die Hilfelinks direkt darunter.';
  } else if (drinkType === 'mate' || drinkType === 'softdrink') {
    noteText = 'Grobe Schätzung, keine Wissenschaft. Für Tag zwei ist ein kleines Wasserpolster trotzdem sehr schlau.';
  } else if (drinkType === 'custom' && customText) {
    noteText = `Grobe Schätzung für ${escapeHtml(customText)}. Die genaue Wahrheit kennt wie immer nur die Nacht.`;
  }

  const details = [
    ['Packziel', 'nur du'],
    ['Schon im Lager', `${stock} Einheiten`],
    ['Wasserquote', waterLow / crew >= 2.5 ? 'stabil' : 'lieber mehr']
  ];
  const chips = ['Browser-only', shares ? 'Teilpuffer' : 'Solo', drinkType === 'wasser' ? 'Hydro-Held' : 'Durst-Level'];
  setToolResult(drinkResult, mainText, noteText, details, chips, warningText);
}

function toggleCustomDrinkInput() {
  if (drinkCustomWrap && drinkTypeSelect) {
    drinkCustomWrap.classList.toggle('hidden', drinkTypeSelect.value !== 'custom');
  }
}

function toggleSmokeTypeFields() {
  if (!smokePouchWrap || !smokeTypeSelect) return;
  smokePouchWrap.classList.toggle('hidden', smokeTypeSelect.value !== 'roll');
}

function updateSmokeCalculator() {
  if (!smokeResult || !smokeModeSelect || !smokeDurationSelect || !smokeTypeSelect) {
    return;
  }
  const people = 1;
  const mode = smokeModeSelect.value;
  const type = smokeTypeSelect.value;
  const duration = smokeDurationSelect.value;
  const stock = clampIntegerInput(smokeStockInput, 0, 0, 600);
  const shareSelection = document.querySelector('input[name="smoke-share"]:checked');
  const shares = shareSelection?.value === 'share';
  const hasVape = !!smokeVapeInput?.checked;
  const hasAsh = !!smokeAshInput?.checked;
  const pouchSize = clampIntegerInput(smokePouchSelect, 40, 30, 50);

  const perDay = {
    casual: 3,
    social: 5,
    steady: 8,
    heavy: 14,
    chain: 20
  };
  const durationFactor = {
    friday: 1.15,
    saturday: 1.05,
    both: 2.1,
    overnight: 2.45
  };

  const raw = people * (perDay[mode] || 5) * (durationFactor[duration] || 2) * (shares ? 1.25 : 1) * 1.1 * (hasVape ? 0.72 : 1);
  const target = Math.max(0, Math.ceil(raw - stock));
  const low = Math.max(0, Math.floor(target * 0.85));
  const high = Math.max(low, Math.ceil(target * 1.15));
  const lighters = Math.max(1, Math.ceil(people / 3) + 1);
  const ashStations = Math.max(1, Math.ceil(people / (hasAsh ? 5 : 4)));

  let mainText = '';
  const details = [
    ['Packziel', 'nur du'],
    ['Schon im Lager', `${stock} Kippen`],
    ['Feuerzeuge', `${lighters}`],
    ['Vape', hasVape ? 'Pod/Liquid + Akku checken' : 'nicht eingeplant'],
    ['Stummelstationen', `${ashStations}${hasAsh ? ' reichen wahrscheinlich' : ' einplanen'}`]
  ];
  let noteText = 'Stummel sichtbar sammeln, Pausen machen, Wasser daneben stellen. Kippenstummel gehören nicht auf den Boden.';
  let warningText = '';

  if (target <= 0) {
    mainText = 'Automat sagt: Du bist versorgt. Kein Nachkauf nötig.';
  } else if (type === 'roll') {
    const tobaccoGram = Math.ceil(high * 0.75 * 1.1);
    const pouches = Math.max(1, Math.ceil(tobaccoGram / pouchSize));
    const papers = Math.max(1, Math.ceil(high / 50));
    const filters = Math.max(1, Math.ceil(high / 120));
    mainText = `Automat sagt: ${low}–${high} Drehkippen einplanen. Pack ${pouches} Pouch${pouches > 1 ? 'es' : ''} à ${pouchSize} g, ${papers} Paper-Pack und ${filters} Filter-Pack ein.`;
    details.push(['Drehzeug', `${tobaccoGram} g grob`]);
  } else {
    const packsLow = Math.max(1, Math.ceil(low / 20));
    const packsHigh = Math.max(packsLow, Math.ceil(high / 20));
    const cartons = packsHigh >= 10 ? `${Math.floor(packsHigh / 10)} Stange(n) + ${packsHigh % 10} Schachteln` : `${packsHigh} Schachteln`;
    mainText = `Automat sagt: ${packsLow}–${packsHigh} Schachteln à 20. Pack ${cartons} ein, wenn du nicht verhandeln willst.`;
    details.push(['Kippen', `${low}–${high}`]);
  }

  if (mode === 'heavy') {
    warningText = 'Dauerfeuer erkannt: mehr Pausen und eine sichtbare Stummelbox machen den Abend deutlich weniger chaotisch.';
  } else if (mode === 'chain') {
    warningText = 'Kettenraucher-Modus: der Automat rechnet extra großzügig und bittet dich um noch mehr Pause.';
  } else if (!hasAsh) {
    warningText = 'Keine Stummelbox markiert. Bitte irgendeine Dose, Glas oder Tasche dafür einplanen.';
  }

  setToolResult(smokeResult, mainText, noteText, details, ['Schnorrpuffer', type === 'roll' ? 'Drehtabak' : 'Schachteln', hasVape ? 'Vape-Backup' : 'Feuerzeug', 'Leave No Trace'], warningText);
}

function updateJointCalculator() {
  if (!jointResult || !jointModeSelect || !jointDurationSelect || !jointPauseSelect || !jointLengthInput) {
    return;
  }
  const people = 1;
  const mode = jointModeSelect.value;
  const duration = jointDurationSelect.value;
  const pause = jointPauseSelect.value;
  const prepared = clampIntegerInput(jointPreparedInput, 0, 0, 80);
  const jointLength = clampIntegerInput(jointLengthInput, 6, 3, 14);
  const reserve = !!jointReserveInput?.checked;
  const avoidMix = jointAvoidMixInput?.checked !== false;
  const lengthFactor = jointLength / 6;

  const durationBlocks = {
    friday: 2,
    saturday: 2,
    both: 4,
    overnight: 5
  };
  const vibeFactor = {
    mini: 0.45,
    cozy: 0.7,
    steady: 1,
    slow: 0.55
  };
  const pauseFactor = {
    short: 1.15,
    normal: 1,
    long: 0.75
  };

  const reserveFactor = reserve && mode !== 'steady' ? 1.2 : 1;
  const rawRounds = (durationBlocks[duration] || 4) *
    (vibeFactor[mode] || 0.7) *
    (pauseFactor[pause] || 1) *
    reserveFactor *
    lengthFactor;

  const plannedRounds = Math.max(1, Math.ceil(rawRounds));
  const neededRounds = Math.max(0, plannedRounds - prepared);
  const papers = Math.ceil(neededRounds * 1.25 * lengthFactor);
  const filters = Math.ceil(neededRounds * 1.25 * lengthFactor);
  const lighters = Math.max(1, Math.ceil(people / 4));
  const waterBreaks = Math.max(1, Math.ceil(people / 3));

  let mainText = neededRounds <= 0
    ? `Automat sagt: ${plannedRounds} Solo-Runde(n) wären realistisch, Jointlänge ${jointLength} cm eingeplant.`
    : `Automat sagt: ${plannedRounds} Solo-Runde(n) einplanen, davon fehlen ${neededRounds}. Jointlänge ${jointLength} cm macht den Puffer etwas größer: grob ${papers} Papers und ${filters} Filter.`;
  let noteText = 'Langsam starten, Wasser sichtbar hinstellen, Pausen ernst nehmen.';
  let warningText = '';

  if (mode === 'steady' && pause === 'short') {
    warningText = 'Tempo wirkt zu wild. Lieber größere Pausen einplanen. Weniger ist mehr.';
  } else if (!avoidMix) {
    warningText = 'Mischkonsum ist schwer planbar. Besser klar trennen oder auslassen.';
  } else if (people > 12) {
    warningText = 'Große Runde erkannt: lieber aufteilen statt alles in eine Rotation zu pressen.';
  } else if (reserve && mode === 'steady') {
    warningText = 'Reserve heißt nicht Pflichtprogramm. Der Automat erhöht bei stabilem Modus bewusst nicht weiter.';
  }

  const tempo = warningText ? 'Tempo: checken' : (mode === 'slow' || pause === 'long' ? 'Tempo: sanft' : 'Tempo: ok');
  const details = [
    ['Deine Runde', 'solo / nur du'],
    ['Jointlänge', `${jointLength} cm`],
    ['Vorbereitet', `${prepared} Runde(n)`],
    ['Feuerzeuge', `${lighters}`],
    ['Wasserbreaks', `${waterBreaks}+ sichtbar`]
  ];
  const chips = [tempo, avoidMix ? 'kein Mix' : 'Mix-Warnung', lengthFactor > 1 ? 'länger' : 'kompakt', 'keine Gramm'];

  setToolResult(jointResult, mainText, noteText, details, chips, warningText);
}

function playVendingFeedback(button, updateFn) {
  const machine = button.closest('.vending-machine');
  const display = machine?.querySelector('.vending-display');
  if (!machine || !display) {
    updateFn();
    return;
  }

  const existingTimers = vendingFeedbackTimers.get(machine);
  if (existingTimers) {
    existingTimers.forEach(timer => window.clearTimeout(timer));
  }

  machine.classList.remove('vending-machine--clack', 'vending-machine--dispensing');
  display.classList.remove('vending-display--receipt');
  button.classList.remove('tool-submit--pressed');
  void machine.offsetWidth;

  button.classList.add('tool-submit--pressed');
  machine.classList.add('vending-machine--clack');

  const printTimer = window.setTimeout(() => {
    updateFn();
    machine.classList.add('vending-machine--dispensing');
    display.classList.add('vending-display--receipt');
  }, 90);

  const cleanupTimer = window.setTimeout(() => {
    button.classList.remove('tool-submit--pressed');
    machine.classList.remove('vending-machine--clack', 'vending-machine--dispensing');
    vendingFeedbackTimers.delete(machine);
  }, 620);

  vendingFeedbackTimers.set(machine, [printTimer, cleanupTimer]);
}

function bindToolCalculator(formId, button, updateFn) {
  const form = document.getElementById(formId);
  if (!form || !button) return;
  button.addEventListener('click', () => playVendingFeedback(button, updateFn));
  form.querySelectorAll('input, select').forEach(control => {
    control.addEventListener('change', updateFn);
    control.addEventListener('change', syncVendingChoices);
    control.addEventListener('input', updateFn);
  });
}

function emitControlChange(control) {
  control.dispatchEvent(new Event('input', { bubbles: true }));
  control.dispatchEvent(new Event('change', { bubbles: true }));
}

function syncVendingChoices() {
  document.querySelectorAll('.vending-choice[data-select-target]').forEach(choice => {
    const target = document.getElementById(choice.dataset.selectTarget);
    choice.classList.toggle('is-active', !!target && target.value === choice.dataset.selectValue);
  });
  document.querySelectorAll('.vending-choice[data-check-target]').forEach(choice => {
    const target = document.getElementById(choice.dataset.checkTarget);
    choice.classList.toggle('is-active', !!target?.checked);
  });
  document.querySelectorAll('.tool-segmented-option').forEach(option => {
    const input = option.querySelector('input[type="radio"]');
    option.classList.toggle('is-active', !!input?.checked);
  });
}

function initVendingCarousel() {
  const track = document.querySelector('[data-vending-carousel]');
  if (!track) return;

  const panels = Array.from(track.querySelectorAll('[data-vending-panel]'));
  if (!panels.length) return;

  const pills = Array.from(document.querySelectorAll('.vending-carousel-pill[data-vending-target]'));
  const mobileQuery = window.matchMedia('(max-width: 699px)');
  let activeIndex = 0;
  let frame = 0;

  function clampIndex(index) {
    return Math.min(panels.length - 1, Math.max(0, index));
  }

  function scrollToPanel(index, behavior = 'smooth') {
    const panel = panels[clampIndex(index)];
    const left = panel.offsetLeft - (track.clientWidth - panel.offsetWidth) / 2;
    track.scrollTo({ left: Math.max(0, left), behavior });
  }

  function setActivePanel(index, shouldScroll = false) {
    activeIndex = clampIndex(index);
    panels.forEach((panel, panelIndex) => {
      const isActive = panelIndex === activeIndex;
      panel.classList.toggle('is-carousel-active', isActive);
      panel.setAttribute('aria-current', isActive ? 'true' : 'false');
    });
    pills.forEach(pill => {
      const isActive = Number.parseInt(pill.dataset.vendingTarget, 10) === activeIndex;
      pill.classList.toggle('is-active', isActive);
      pill.setAttribute('aria-current', isActive ? 'true' : 'false');
    });

    if (shouldScroll && mobileQuery.matches) {
      scrollToPanel(activeIndex);
    }
  }

  function updateCarouselDepth() {
    if (!mobileQuery.matches) {
      track.classList.remove('is-carousel-ready');
      panels.forEach(panel => {
        panel.style.removeProperty('--carousel-rotate');
        panel.style.removeProperty('--carousel-scale');
        panel.style.removeProperty('--carousel-opacity');
        panel.style.removeProperty('--carousel-lift');
        panel.style.removeProperty('--carousel-blur');
      });
      return;
    }

    track.classList.add('is-carousel-ready');
    const trackCenter = track.scrollLeft + track.clientWidth / 2;
    let closestIndex = activeIndex;
    let closestDistance = Number.POSITIVE_INFINITY;

    panels.forEach((panel, panelIndex) => {
      const panelCenter = panel.offsetLeft + panel.offsetWidth / 2;
      const rawDistance = (panelCenter - trackCenter) / panel.offsetWidth;
      const distance = Math.min(1.2, Math.max(-1.2, rawDistance));
      const absolute = Math.min(1, Math.abs(distance));

      panel.style.setProperty('--carousel-rotate', `${(-distance * 18).toFixed(2)}deg`);
      panel.style.setProperty('--carousel-scale', (1 - absolute * 0.16).toFixed(3));
      panel.style.setProperty('--carousel-opacity', (1 - absolute * 0.42).toFixed(3));
      panel.style.setProperty('--carousel-lift', `${(absolute * 0.48).toFixed(3)}rem`);
      panel.style.setProperty('--carousel-blur', `${(absolute * 0.85).toFixed(3)}px`);

      if (absolute < closestDistance) {
        closestDistance = absolute;
        closestIndex = panelIndex;
      }
    });

    if (closestIndex !== activeIndex) {
      setActivePanel(closestIndex);
    }
  }

  function scheduleCarouselUpdate() {
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      updateCarouselDepth();
    });
  }

  panels.forEach((panel, panelIndex) => {
    panel.addEventListener('click', event => {
      if (!mobileQuery.matches || panel.classList.contains('is-carousel-active')) return;
      event.preventDefault();
      setActivePanel(panelIndex, true);
    });
  });

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      const index = Number.parseInt(pill.dataset.vendingTarget, 10);
      setActivePanel(index, true);
    });
  });

  track.addEventListener('scroll', scheduleCarouselUpdate, { passive: true });
  window.addEventListener('resize', scheduleCarouselUpdate);

  if (mobileQuery.addEventListener) {
    mobileQuery.addEventListener('change', () => {
      setActivePanel(activeIndex);
      window.requestAnimationFrame(() => {
        if (mobileQuery.matches) scrollToPanel(activeIndex, 'auto');
        updateCarouselDepth();
      });
    });
  }

  setActivePanel(0);
  window.requestAnimationFrame(() => {
    if (mobileQuery.matches) scrollToPanel(0, 'auto');
    updateCarouselDepth();
  });
}

document.querySelectorAll('.vending-choice[data-select-target]').forEach(choice => {
  choice.addEventListener('click', () => {
    const target = document.getElementById(choice.dataset.selectTarget);
    if (!target) return;
    target.value = choice.dataset.selectValue;
    emitControlChange(target);
    syncVendingChoices();
  });
});

document.querySelectorAll('.vending-choice[data-check-target]').forEach(choice => {
  choice.addEventListener('click', () => {
    const target = document.getElementById(choice.dataset.checkTarget);
    if (!target) return;
    target.checked = !target.checked;
    emitControlChange(target);
    syncVendingChoices();
  });
});

if (drinkResult) {
  if (drinkTypeSelect) {
    drinkTypeSelect.addEventListener('change', toggleCustomDrinkInput);
  }
  toggleCustomDrinkInput();
  bindToolCalculator('drink-calculator', drinkCalcBtn, updateDrinkCalculator);
}

if (smokeResult) {
  if (smokeTypeSelect) {
    smokeTypeSelect.addEventListener('change', toggleSmokeTypeFields);
  }
  toggleSmokeTypeFields();
  bindToolCalculator('smoke-calculator', smokeCalcBtn, updateSmokeCalculator);
}

if (jointResult) {
  bindToolCalculator('joint-calculator', jointCalcBtn, updateJointCalculator);
}

syncVendingChoices();
initVendingCarousel();

if (document.querySelector('.act-card[data-sc-url]')) {
  window.setTimeout(loadSoundCloudArtists, 500);
}

// ═══════════════════════════════════════════════════════════
// HERO BACKGROUND DAMPED FADE
// ═══════════════════════════════════════════════════════════
function animateHeroBackgroundFade() {
  const heroBg = document.querySelector('.hero-bg--ritual');
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  if (!heroBg || reduceMotion || !window.requestAnimationFrame) return;

  const duration = 10000;
  const target = 0.35;
  const amplitude = 0.65;
  const decay = 2.85;
  const frequency = 7.75 * Math.PI;
  const minOpacity = 0.3;
  const maxOpacity = 1;
  const start = performance.now();

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const damping = Math.exp(-decay * progress);
    const wave = Math.cos(frequency * progress);
    const opacity = clamp(target + amplitude * damping * wave, minOpacity, maxOpacity);

    heroBg.style.opacity = opacity.toFixed(3);

    if (progress < 1) {
      window.requestAnimationFrame(tick);
      return;
    }

    heroBg.style.opacity = String(target);
  }

  window.requestAnimationFrame(tick);
}

animateHeroBackgroundFade();

// ═══════════════════════════════════════════════════════════
// HERO COUNTDOWN
// ═══════════════════════════════════════════════════════════
const EVENT_START = new Date('2026-04-24T12:00:00+02:00');
const hcDigits = document.getElementById('hc-digits');
const COUNTDOWN_COMPLETE_MESSAGE = 'Der Lenzzauber ist los.';

function pad(n) { return String(n).padStart(2, '0'); }

function parseForcedCountdownDate(value) {
  const normalized = String(value || '').trim().replace(/ (\d{2}:\d{2})$/, '+$1');
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getCountdownNow() {
  try {
    const params = new URLSearchParams(window.location.search);
    const forced = params.get('partyNow') || params.get('mementoNow');
    if (forced) {
      const forcedDate = parseForcedCountdownDate(forced);
      if (forcedDate) return forcedDate;
    }
  } catch (error) {
    // Invalid query parsing falls back to real browser time.
  }

  return new Date();
}

function updateHeroCountdown() {
  const now = getCountdownNow();
  const diff = EVENT_START - now;

  if (!hcDigits) return;

  if (document.documentElement.classList.contains('is-countdown-complete')) {
    hcDigits.textContent = COUNTDOWN_COMPLETE_MESSAGE;
    return;
  }

  if (diff <= 0) {
    hcDigits.textContent = COUNTDOWN_COMPLETE_MESSAGE;
    return;
  }

  const totalSec = Math.floor(diff / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  if (days > 0) {
    hcDigits.textContent = days + ' Tag' + (days !== 1 ? 'e' : '') + ' ' + pad(hours) + ' Std ' + pad(minutes) + ' Min';
  } else {
    hcDigits.textContent = pad(hours) + ' Std ' + pad(minutes) + ' Min ' + pad(seconds) + ' Sek';
  }
}

if (hcDigits) {
  updateHeroCountdown();
  setInterval(updateHeroCountdown, 1000);
}
