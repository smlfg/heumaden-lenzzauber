// Wetter-Daten für Heumaden · 24.–26. April 2026
// Wetter-API: Open-Meteo (kostenlos, keine API-Key nötig)

const HEUMADEN = { lat: 48.74, lon: 9.22 };
const DAYS = ['fri', 'sat', 'sun'];
const DAY_LABELS = { fri: 'Fr · 24. Apr', sat: 'Sa · 25. Apr', sun: 'So · 26. Apr' };

const ICON_MAP = {
  0: '☀️',  1: '🌤️',  2: '⛅',  3: '☁️',
  45: '🌫️', 48: '🌫️',
  51: '🌦️', 53: '🌦️', 55: '🌧️',
  61: '🌧️', 63: '🌧️', 65: '🌧️',
  71: '🌨️', 73: '🌨️', 75: '❄️',
  80: '🌦️', 81: '🌧️', 82: '⛈️',
  95: '⛈️', 96: '⛈️', 99: '⛈️',
};

function getIcon(code) {
  return ICON_MAP[code] || '🌤️';
}

function formatTemp(val) {
  if (val === null || val === undefined) return '—';
  return Math.round(val) + '°';
}

function celsiusToFahrenheit(val) {
  if (val === null || val === undefined) return null;
  return Math.round(val * 9/5 + 32);
}

async function fetchWeather() {
  const dates = ['2026-04-24', '2026-04-25', '2026-04-26'];
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${HEUMADEN.lat}&longitude=${HEUMADEN.lon}&daily=temperature_2m_max,temperature_2m_min,weathercode,windspeed_10m_max,precipitation_sum&timezone=Europe%2FBerlin&start_date=2026-04-24&end_date=2026-04-26`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('API error ' + res.status);
    const data = await res.json();

    DAYS.forEach((day, i) => {
      const maxTemp = data.daily.temperature_2m_max[i];
      const minTemp = data.daily.temperature_2m_min[i];
      const code = data.daily.weathercode[i];
      const wind = data.daily.windspeed_10m_max[i];
      const prec = data.daily.precipitation_sum[i];

      document.getElementById(`temp-${day}`).textContent =
        `${formatTemp(minTemp)} / ${formatTemp(maxTemp)}`;
      document.getElementById(`icon-${day}`).textContent = getIcon(code);
      document.getElementById(`desc-${day}`).textContent = getDesc(code);
      document.getElementById(`detail-${day}`).textContent =
        `${wind > 0 ? '💨 ' + Math.round(wind) + ' km/h' : ''}${prec > 0 ? ' · ' + prec + ' mm' : ''}`;
    });
  } catch (e) {
    DAYS.forEach(day => {
      document.getElementById(`desc-${day}`).textContent = 'Offline';
      document.getElementById(`detail-${day}`).textContent = '';
    });
  }
}

function getDesc(code) {
  const m = {
    0: 'Klarer Himmel', 1: 'Fast klar', 2: 'Teilweise bewölkt',
    3: 'Bedeckt', 45: 'Nebel', 48: 'Reifnebel',
    51: 'Leichter Nieselregen', 53: 'Nieselregen', 55: 'Nieselregen',
    61: 'Leichter Regen', 63: 'Regen', 65: 'Starker Regen',
    71: 'Leichter Schneefall', 73: 'Schneefall', 75: 'Starker Schneefall',
    80: 'Leichte Schauer', 81: 'Schauer', 82: 'Starke Schauer',
    95: 'Gewitter', 96: 'Gewitter mit Hagel', 99: 'Starkes Gewitter mit Hagel',
  };
  return m[code] || 'Wechselhaft';
}

fetchWeather();
