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
