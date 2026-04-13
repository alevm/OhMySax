// Before/After comparisons — loads from data/comparisons.json
(function () {
  const container = document.getElementById('comparison-entries');
  if (!container) return;

  fetch('data/comparisons.json')
    .then(r => r.json())
    .then(items => {
      if (!items.length) {
        container.innerHTML = '<p class="bench-note">No comparisons yet. Check back soon.</p>';
        return;
      }

      // Sort newest first
      items.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

      container.innerHTML = items.map(item => {
        const beforeImg = item.before
          ? `<div class="compare-side"><div class="compare-label">Before</div><img src="${esc(item.before)}" alt="Before: ${esc(item.title)}" loading="lazy"></div>`
          : `<div class="compare-side"><div class="compare-label">Before</div><div class="compare-placeholder">Photo pending</div></div>`;

        const afterImg = item.after
          ? `<div class="compare-side"><div class="compare-label">After</div><img src="${esc(item.after)}" alt="After: ${esc(item.title)}" loading="lazy"></div>`
          : `<div class="compare-side"><div class="compare-label">After</div><div class="compare-placeholder">Photo pending</div></div>`;

        return `
          <article class="comparison-entry" id="${esc(item.id)}">
            <h3>${esc(item.title)}</h3>
            <div class="comparison-horn">${esc(item.horn)}</div>
            <p class="comparison-desc">${esc(item.description)}</p>
            <div class="compare-pair">
              ${beforeImg}
              ${afterImg}
            </div>
          </article>
        `;
      }).join('');
    })
    .catch(() => {
      container.innerHTML = '<p class="bench-note">Could not load comparisons.</p>';
    });

  function esc(s) {
    const el = document.createElement('span');
    el.textContent = s || '';
    return el.innerHTML;
  }
})();
