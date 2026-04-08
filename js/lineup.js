// ═══════════════════════════════════════════════════════════
// PROGRAMM TAB SWITCHER
// ═══════════════════════════════════════════════════════════
const programmTabs = document.querySelectorAll('.programm-tab');
const progViews = document.querySelectorAll('.prog-view');

programmTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    programmTabs.forEach(t => t.classList.remove('active'));
    progViews.forEach(v => v.classList.remove('active-view'));
    tab.classList.add('active');
    const view = tab.dataset.view;
    const target = document.getElementById('prog-' + view);
    if (target) target.classList.add('active-view');
  });
});

// ─── Weather bar (Friday only, Open-Meteo) ───
const HEUMADEN_LAT = 48.74;
const HEUMADEN_LON = 9.19;
const EVENT_FRIDAY = '2026-04-24';

const weatherBar = document.getElementById('weather-bar');

async function loadFridayWeather() {
  if (!weatherBar) return;
  try {
    const url =
      'https://api.open-meteo.com/v1/forecast' +
      '?latitude=' + HEUMADEN_LAT +
      '&longitude=' + HEUMADEN_LON +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum' +
      '&timezone=Europe%2FBerlin&forecast_days=17';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Weather API error');
    const data = await res.json();

    const idx = data.daily.time.indexOf(EVENT_FRIDAY);
    if (idx === -1) return; // event date not in forecast range

    const code = data.daily.weather_code[idx];
    const max = Math.round(data.daily.temperature_2m_max[idx]);
    const min = Math.round(data.daily.temperature_2m_min[idx]);
    const precip = data.daily.precipitation_sum[idx];

    const icons = { clear: '☀️', partly: '⛅', cloudy: '☁️', fog: '🌫️', drizzle: '🌦️', rain: '🌧️', snow: '❄️', thunder: '⛈️', unknown: '?' };
    const descs = {
      0: ['Klar', 'clear'], 1: ['Leicht bewölkt', 'partly'], 2: ['Bewölkt', 'cloudy'],
      3: ['Bedeckt', 'cloudly'], 45: ['Nebel', 'fog'], 48: ['Reifnebel', 'fog'],
      51: ['Leichter Niesel', 'drizzle'], 53: ['Niesel', 'drizzle'], 55: ['Starker Niesel', 'drizzle'],
      61: ['Leichter Regen', 'rain'], 63: ['Regen', 'rain'], 65: ['Starker Regen', 'rain'],
      71: ['Leichter Schnee', 'snow'], 73: ['Schnee', 'snow'], 75: ['Starker Schnee', 'snow'],
      95: ['Gewitter', 'thunder'], 96: ['Gewitter + Hagel', 'thunder'], 99: ['Gewitter + Hagel', 'thunder']
    };
    const [desc, key] = (descs[code] || ['???', 'unknown']);
    const icon = icons[key] || '?';
    const precipLine = precip > 0 ? ` · ${precip}mm Regen` : ' · kein Regen';

    weatherBar.innerHTML =
      '<span class="weather-bar-day">Fr · 24. Apr</span>' +
      '<span class="weather-bar-icon">' + icon + '</span>' +
      '<span class="weather-bar-temp">' + min + '–' + max + '°C</span>' +
      '<span class="weather-bar-sep">·</span>' +
      '<span class="weather-bar-desc">' + desc + precipLine + '</span>';
    weatherBar.classList.remove('hidden');
  } catch (e) {
    // API failed — stay hidden
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

// ─── Address Gate ───
// Password: Mitja Ziegler (full name, case-insensitive)
const CORRECT_PASSWORD = 'mitja ziegler';
const CORRECT_ALT = 'MitjaZiegler';

const gate = document.getElementById('addr-gate');
const passwordInput = document.getElementById('addr-password');
const unlockBtn = document.getElementById('addr-unlock-btn');
const errorMsg = document.getElementById('addr-error');

const lockedFri = document.getElementById('addr-fri-lock');
const realFri = document.getElementById('addr-fri-real');
const detailFriLock = document.getElementById('detail-fri-lock');
const detailFriReal = document.getElementById('detail-fri-real');
const btnFri = document.getElementById('btn-fri');

const lockedSat = document.getElementById('addr-sat-lock');
const realSat = document.getElementById('addr-sat-real');
const detailSatLock = document.getElementById('detail-sat-lock');
const detailSatReal = document.getElementById('detail-sat-real');
const btnSat = document.getElementById('btn-sat');

function unlock() {
  const val = passwordInput.value.trim().toLowerCase();
  if (val === CORRECT_PASSWORD || val === CORRECT_ALT.toLowerCase()) {
    [lockedFri, lockedSat, detailFriLock, detailSatLock].forEach(el =>
      el.classList.add('hidden')
    );
    [realFri, realSat, detailFriReal, detailSatReal, btnFri, btnSat].forEach(el =>
      el.classList.remove('hidden')
    );
    gate.classList.add('unlocked');
    gate.querySelector('.addr-gate-label').textContent = '✓ Adresse freigeschaltet';
    gate.querySelector('.addr-gate-hint').textContent = 'Viel Spaß am Wochenende!';
    errorMsg.classList.add('hidden');
    passwordInput.value = '';
    passwordInput.blur();
  } else {
    errorMsg.classList.remove('hidden');
    passwordInput.classList.add('shake');
    setTimeout(() => passwordInput.classList.remove('shake'), 400);
  }
}

unlockBtn.addEventListener('click', unlock);
passwordInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') unlock();
});

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
const drinkShareInput = document.getElementById('drink-share');
const drinkResult = document.getElementById('drink-result');

function formatNumberRange(value) {
  return value.toFixed(value >= 10 ? 0 : 1).replace('.', ',');
}

function formatIntegerRange(value) {
  return Math.max(1, Math.round(value));
}

function describeDrinkRange(type, low, high, customText) {
  switch (type) {
    case 'bier':
      return `${low}–${high} Bier`;
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
      const label = (customText || 'deines Lieblingsgetränks').trim();
      return `${low}–${high} Einheiten ${label}`;
    }
    default:
      return `${low}–${high} Getränke`;
  }
}

function getWaterRange(duration, thirst, shares) {
  const baseRanges = {
    friday: [1.5, 2.2],
    saturday: [1.5, 2.2],
    both: [2.4, 3.6],
    overnight: [3, 4.6]
  };
  const thirstBoost = {
    leicht: 0,
    normal: 0.25,
    stabil: 0.6,
    eskalativ: 1
  };

  const range = baseRanges[duration] || baseRanges.both;
  const extra = thirstBoost[thirst] || 0.25;
  const shareBoost = shares ? 0.5 : 0;

  return [
    Math.max(1, range[0] + extra + shareBoost),
    Math.max(1.5, range[1] + extra + shareBoost)
  ];
}

function updateDrinkCalculator() {
  if (!drinkResult || !drinkTypeSelect || !drinkThirstInput || !drinkDurationInput || !drinkShareInput) {
    return;
  }

  const thirst = drinkThirstInput.value;
  const drinkType = drinkTypeSelect.value;
  const duration = drinkDurationInput.value;
  const shares = drinkShareInput.checked;
  const customText = drinkCustomInput?.value.trim();

  if (drinkCustomWrap) {
    drinkCustomWrap.classList.toggle('hidden', drinkType !== 'custom');
  }

  const thirstBase = {
    leicht: 3,
    normal: 5,
    stabil: 7,
    eskalativ: 9
  };
  const durationMultiplier = {
    friday: 1,
    saturday: 0.95,
    both: 1.8,
    overnight: 2.15
  };

  const shareMultiplier = shares ? 1.18 : 1;
  const base = (thirstBase[thirst] || 5) * (durationMultiplier[duration] || 1.8) * shareMultiplier;
  const low = formatIntegerRange(base);
  const high = Math.max(low + 1, formatIntegerRange(base * 1.25));
  const [waterLow, waterHigh] = getWaterRange(duration, thirst, shares);
  const waterText = `${formatNumberRange(waterLow)}–${formatNumberRange(waterHigh)} Liter Wasser`;

  let mainText = `Für deinen Vibe: ${describeDrinkRange(drinkType, low, high, customText)} plus mindestens ${waterText}.`;
  let noteText = 'Charmante Näherung. Wenn der Kofferraum es hergibt, lieber einen Tick zu freundlich planen.';

  if (drinkType === 'wasser') {
    mainText = `Für deinen Vibe: ${waterText}. Elegant, hydriert, zukunftsfähig.`;
    noteText = 'Grobe Schätzung, keine Wissenschaft. Wer Wasser mitbringt, macht selten etwas falsch.';
  } else if (drinkType === 'mate' || drinkType === 'softdrink') {
    noteText = 'Grobe Schätzung, keine Wissenschaft. Für Tag zwei ist ein kleines Wasserpolster trotzdem sehr schlau.';
  } else if (drinkType === 'custom' && customText) {
    noteText = `Grobe Schätzung für ${customText}. Die genaue Wahrheit kennt wie immer nur die Nacht.`;
  }

  drinkResult.innerHTML =
    `<p class="tool-result-main">${mainText}</p>` +
    `<p class="tool-result-note">${noteText}</p>`;
}

if (drinkResult) {
  [drinkTypeSelect, drinkCustomInput, drinkThirstInput, drinkDurationInput, drinkShareInput].forEach(input => {
    if (!input) return;
    input.addEventListener('input', updateDrinkCalculator);
    input.addEventListener('change', updateDrinkCalculator);
  });
  updateDrinkCalculator();
}

const bacWeightInput = document.getElementById('bac-weight');
const bacFactorInput = document.getElementById('bac-factor');
const bacDrinkTypeInput = document.getElementById('bac-drink-type');
const bacCountInput = document.getElementById('bac-count');
const bacHoursInput = document.getElementById('bac-hours');
const bacResult = document.getElementById('bac-result');

function updateBacCalculator() {
  if (
    !bacResult ||
    !bacWeightInput ||
    !bacFactorInput ||
    !bacDrinkTypeInput ||
    !bacCountInput ||
    !bacHoursInput
  ) {
    return;
  }

  const weight = Number.parseFloat(bacWeightInput.value);
  const factor = Number.parseFloat(bacFactorInput.value);
  const count = Number.parseFloat(bacCountInput.value);
  const hours = Number.parseFloat(bacHoursInput.value);

  if (!Number.isFinite(weight) || !Number.isFinite(factor) || !Number.isFinite(count) || !Number.isFinite(hours)) {
    return;
  }

  const gramsPerDrink = {
    beer: 20,
    wine: 19,
    longdrink: 16,
    shot: 13
  };

  const gramsAlcohol = count * (gramsPerDrink[bacDrinkTypeInput.value] || 16);
  const rawPromille = gramsAlcohol / (weight * factor);
  const reducedPromille = Math.max(0, rawPromille - (0.15 * hours));
  const uncertainty = Math.max(0.08, reducedPromille * 0.15 + 0.05);
  const low = Math.max(0, reducedPromille - uncertainty);
  const high = reducedPromille + uncertainty;

  let mainText = `Sehr grob geschätzt: etwa ${formatNumberRange(low)}–${formatNumberRange(high)} ‰.`;

  if (reducedPromille < 0.05) {
    mainText = 'Sehr grob geschätzt: irgendwo um 0,0 ‰ herum.';
  }

  bacResult.innerHTML =
    `<p class="tool-result-main">${mainText}</p>` +
    '<p class="tool-result-note">Bitte nur als Näherung lesen. Schlaf, Essen, Tempo, Tagesform und Ausschankrealität machen die Lage notorisch komplizierter.</p>';
}

if (bacResult) {
  [bacWeightInput, bacFactorInput, bacDrinkTypeInput, bacCountInput, bacHoursInput].forEach(input => {
    if (!input) return;
    input.addEventListener('input', updateBacCalculator);
    input.addEventListener('change', updateBacCalculator);
  });
  updateBacCalculator();
}

// ═══════════════════════════════════════════════════════════
// COUNTDOWN OVERLAY
// ═══════════════════════════════════════════════════════════
const EVENT_START = new Date('2026-04-24T18:00:00+02:00');
const overlay = document.getElementById('c-overlay');
const enterBtn = document.getElementById('c-enter');
const timerEl = document.getElementById('c-timer');
const subEl = document.getElementById('c-sub');

function pad(n) { return String(n).padStart(2, '0'); }

function updateCountdown() {
  const now = new Date();
  const diff = EVENT_START - now;

  if (diff <= 0) {
    timerEl.innerHTML = '<span class="c-time-val">00</span><span class="c-time-unit">Tag</span> <span class="c-time-val">00</span><span class="c-time-unit">Std</span> <span class="c-time-val">00</span><span class="c-time-unit">Min</span>';
    subEl.textContent = 'Es ist soweit. Komm zu Hauf.';
    return;
  }

  const totalSec = Math.floor(diff / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  // Show days only if ≥ 1
  if (days > 0) {
    timerEl.innerHTML =
      '<span class="c-time-val">' + pad(days) + '</span><span class="c-time-unit">Tag' + (days !== 1 ? 'e' : '') + '</span> ' +
      '<span class="c-time-val">' + pad(hours) + '</span><span class="c-time-unit">Std</span> ' +
      '<span class="c-time-val">' + pad(minutes) + '</span><span class="c-time-unit">Min</span>';
    subEl.textContent = 'Noch ' + days + ' Tag' + (days !== 1 ? 'e' : '') + ' bis zum Lenzzauber.';
  } else {
    timerEl.innerHTML =
      '<span class="c-time-val">' + pad(hours) + '</span><span class="c-time-unit">Std</span> ' +
      '<span class="c-time-val">' + pad(minutes) + '</span><span class="c-time-unit">Min</span> ' +
      '<span class="c-time-val">' + pad(seconds) + '</span><span class="c-time-unit">Sek</span>';
    subEl.textContent = 'Der Countdown läuft. Bald bricht er los.';
  }
}

if (overlay && enterBtn) {
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // already entered this session → skip overlay entirely
  if (sessionStorage.getItem('lenzzauber-entert')) {
    overlay.classList.add('faded');
    overlay.setAttribute('aria-hidden', 'true');
  } else {
    // auto-fade: wait for page + images to load, max 3 s
    let faded = false;
    const doFade = () => {
      if (faded) return;
      faded = true;
      overlay.classList.add('faded');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
      sessionStorage.setItem('lenzzauber-entert', '1');
    };

    if (document.readyState === 'complete') {
      setTimeout(doFade, 1000);
    } else {
      window.addEventListener('load', () => setTimeout(doFade, 1000));
      setTimeout(doFade, 3000); // safety max 3 s
    }

    enterBtn.addEventListener('click', () => { doFade(); });
  }
}
