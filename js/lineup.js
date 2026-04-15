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
const drinkShareInput = document.getElementById('drink-share');
const drinkCalcBtn = document.getElementById('drink-calc-btn');
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
    Math.max(1, range[0] + extra + shareBoost),
    Math.max(1.5, range[1] + extra + shareBoost)
  ];
}

function updateDrinkCalculator() {
  console.log('[DrinkCalc] called', {
    drinkResult: !!drinkResult,
    drinkTypeSelect: !!drinkTypeSelect,
    drinkThirstInput: !!drinkThirstInput,
    drinkDurationInput: !!drinkDurationInput,
    drinkShareInput: !!drinkShareInput,
    drinkCustomInput: !!drinkCustomInput,
    drinkCustomWrap: !!drinkCustomWrap
  });

  if (!drinkResult || !drinkTypeSelect || !drinkThirstInput || !drinkDurationInput || !drinkShareInput) {
    console.log('[DrinkCalc] early return — missing elements');
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

  const shareMultiplier = shares ? 1.28 : 1;
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
  } else if (thirst === 'alkoholiker') {
    noteText = 'Sehr großzügig geplant. Wenn das bei dir nicht nur Selbstironie ist, schau bitte auch auf die Hilfelinks direkt über dem Rechner.';
  } else if (drinkType === 'mate' || drinkType === 'softdrink') {
    noteText = 'Grobe Schätzung, keine Wissenschaft. Für Tag zwei ist ein kleines Wasserpolster trotzdem sehr schlau.';
  } else if (drinkType === 'custom' && customText) {
    noteText = `Grobe Schätzung für ${customText}. Die genaue Wahrheit kennt wie immer nur die Nacht.`;
  }

  drinkResult.innerHTML =
    `<p class="tool-result-main">${mainText}</p>` +
    `<p class="tool-result-note">${noteText}</p>`;
}

function toggleCustomDrinkInput() {
  if (drinkCustomWrap && drinkTypeSelect) {
    drinkCustomWrap.classList.toggle('hidden', drinkTypeSelect.value !== 'custom');
  }
}

if (drinkResult) {
  if (drinkTypeSelect) {
    drinkTypeSelect.addEventListener('change', toggleCustomDrinkInput);
  }
  if (drinkCalcBtn) {
    drinkCalcBtn.addEventListener('click', updateDrinkCalculator);
  }
  toggleCustomDrinkInput();
}

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
const EVENT_START = new Date('2026-04-24T18:00:00+02:00');
const hcDigits = document.getElementById('hc-digits');

function pad(n) { return String(n).padStart(2, '0'); }

function updateHeroCountdown() {
  const now = new Date();
  const diff = EVENT_START - now;

  if (!hcDigits) return;

  if (diff <= 0) {
    hcDigits.textContent = '00 Tage 00 Std 00 Min';
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
