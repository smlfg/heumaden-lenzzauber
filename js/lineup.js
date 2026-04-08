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

// ─── Line-up sub-tabs (Fr / Sa) ───
const lineupSubTabs = document.querySelectorAll('.lineup-sub-tab');
const lineupDays = document.querySelectorAll('.lineup-day');

lineupSubTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    lineupSubTabs.forEach(t => t.classList.remove('active'));
    lineupDays.forEach(d => d.classList.add('hidden'));
    tab.classList.add('active');
    const day = tab.dataset.day;
    const target = document.getElementById(day);
    if (target) target.classList.remove('hidden');
  });
});

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
// SOUNDCLOUD AVATARS
// ═══════════════════════════════════════════════════════════
async function loadSCAvatars() {
  const acts = document.querySelectorAll('.act-card[data-sc-url]');
  for (const act of acts) {
    const scUrl = act.dataset.scUrl;
    try {
      const res = await fetch(
        'https://soundcloud.com/oembed?url=' + encodeURIComponent(scUrl) + '&format=json&maxwidth=88&maxheight=88'
      );
      if (!res.ok) continue;
      const data = await res.json();
      const tmp = document.createElement('div');
      tmp.innerHTML = data.html;
      const img = tmp.querySelector('img');
      if (img) {
        const placeholder = act.querySelector('.act-avatar-placeholder');
        placeholder.innerHTML = '';
        const avatar = img.cloneNode();
        avatar.className = 'act-avatar';
        avatar.loading = 'lazy';
        avatar.style.width = '100%';
        avatar.style.height = '100%';
        placeholder.appendChild(avatar);
      }
    } catch (e) {
      // CORS blocked or network error — placeholder emoji stays
    }
  }
}

// Load avatars after a short delay so page renders first
if (document.querySelector('.act-card[data-sc-url]')) {
  setTimeout(loadSCAvatars, 800);
}
