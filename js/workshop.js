// Workshop log — loads entries from data/workshops.json and renders two columns grouped by horn
(function () {
  const container = document.getElementById('workshop-entries');
  if (!container) return;

  fetch('data/workshops.json')
    .then(r => r.json())
    .then(entries => {
      if (!entries.length) {
        container.innerHTML = '<p class="bench-note">No entries yet. Check back soon.</p>';
        return;
      }

      // Group by horn, preserving first-seen horn order
      const groups = new Map();
      entries.forEach(entry => {
        const key = entry.horn || 'Unsorted';
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(entry);
      });

      // Sort each column newest-first
      for (const list of groups.values()) {
        list.sort((a, b) => b.date.localeCompare(a.date));
      }

      const columnsHtml = Array.from(groups.entries()).map(([horn, list]) => {
        const entriesHtml = list.map(entry => {
          const dateStr = new Date(entry.date + 'T00:00:00').toLocaleDateString('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric'
          });

          const photos = (entry.photos || []).map(p =>
            `<img src="${esc(p)}" alt="${esc(entry.title)}" class="workshop-photo" loading="lazy">`
          ).join('');

          const bodyHtml = (entry.body || '').split('\n\n').map(p =>
            `<p>${esc(p)}</p>`
          ).join('');

          return `
            <article class="workshop-entry" id="${esc(entry.id)}">
              <div class="workshop-date">${esc(dateStr)}</div>
              <h3>${esc(entry.title)}</h3>
              <div class="prose">${bodyHtml}</div>
              ${photos ? `<div class="workshop-photos">${photos}</div>` : ''}
            </article>
          `;
        }).join('');

        return `
          <div class="workshop-column">
            <h2 class="workshop-column-title">${esc(horn)}</h2>
            ${entriesHtml}
          </div>
        `;
      }).join('');

      container.innerHTML = `<div class="workshop-columns">${columnsHtml}</div>`;
    })
    .catch(() => {
      container.innerHTML = '<p class="bench-note">Could not load workshop entries.</p>';
    });

  function esc(s) {
    const el = document.createElement('span');
    el.textContent = s || '';
    return el.innerHTML;
  }
})();
