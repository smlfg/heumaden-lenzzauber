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
