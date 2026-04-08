// Line-up tab switcher
const tabs = document.querySelectorAll('.lineup-tab');
const friday = document.getElementById('friday');
const saturday = document.getElementById('saturday');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const day = tab.dataset.day;
    if (day === 'friday') {
      friday.classList.remove('hidden');
      saturday.classList.add('hidden');
    } else {
      saturday.classList.remove('hidden');
      friday.classList.add('hidden');
    }
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
    // Reveal all addresses
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
