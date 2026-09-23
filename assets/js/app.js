/* Batis app.js - see full in repo after push; placeholder to unblock */
console.log('app.js loading');
// Full file will be updated in next commit
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const data = await window.DataAPI.loadAll();
    console.log('loaded', data);
    document.getElementById('loader').style.display = 'none';
    document.getElementById('heroTitle').textContent = data.site.heroTitle;
    document.getElementById('heroLead').textContent = data.site.heroLead;
    document.getElementById('stats').textContent = data.items.length + ' حرکت';
  } catch(e) { console.error(e); }
});
