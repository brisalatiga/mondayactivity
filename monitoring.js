const SHEET_JSON_URL = 'https://spreadsheets.google.com/feeds/list/1OMkPWfwNyQFk2cGXQirquIYaDT_G6q6wL2WWhGGfwvg/od6/public/values?alt=json';

async function loadData() {
  const res = await fetch(SHEET_JSON_URL);
  const data = await res.json();
  const entries = data.feed.entry || [];
  const dashboard = document.getElementById('dashboard');

  entries.reverse().forEach(e => {
    const photo = e.gsx$fotourl?.$t;
    const activity = e.gsx$activity?.$t;
    const pekerja = e.gsx$pekerja?.$t;
    const nasabah = e.gsx$nasabah?.$t;
    const lat = e.gsx$latitude?.$t;
    const lng = e.gsx$longitude?.$t;

    if (!photo) return;

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${photo}" alt="Foto Aktivitas">
      <div class="info">
        <p><strong>${activity}</strong></p>
        <p>${pekerja}</p>
        <p>${nasabah}</p>
        ${lat && lng ? `<a target="_blank" class="view-location" href="https://www.google.com/maps?q=${lat},${lng}">📍 View Loc</a>` : ''}
      </div>
    `;
    dashboard.appendChild(card);
  });
}

window.addEventListener('DOMContentLoaded', loadData);
