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

        const hasAudio = item.audioBefore || item.audioAfter;
        const audioHtml = hasAudio ? `
          <div class="audio-comparison" data-audio-before="${esc(item.audioBefore || '')}" data-audio-after="${esc(item.audioAfter || '')}" data-id="${esc(item.id)}">
            <div class="audio-comparison-label">Audio Comparison</div>
            <div class="audio-controls">
              <button type="button" class="audio-play-btn" data-action="play" aria-label="Play">&#9654;</button>
              <button type="button" class="audio-toggle-btn" data-action="toggle">Prima</button>
              <span class="audio-source-label">Before</span>
              <div class="audio-progress-wrap">
                <input type="range" class="audio-progress" min="0" max="100" value="0" step="0.1">
                <span class="audio-time">0:00</span>
              </div>
            </div>
          </div>
        ` : '';

        return `
          <article class="comparison-entry" id="${esc(item.id)}">
            <h3>${esc(item.title)}</h3>
            <div class="comparison-horn">${esc(item.horn)}</div>
            <p class="comparison-desc">${esc(item.description)}</p>
            <div class="compare-pair">
              ${beforeImg}
              ${afterImg}
            </div>
            ${audioHtml}
          </article>
        `;
      }).join('');

      // Initialize audio players
      initAudioPlayers();
    })
    .catch(() => {
      container.innerHTML = '<p class="bench-note">Could not load comparisons.</p>';
    });

  function esc(s) {
    const el = document.createElement('span');
    el.textContent = s || '';
    return el.innerHTML;
  }

  function formatTime(sec) {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function initAudioPlayers() {
    document.querySelectorAll('.audio-comparison').forEach(widget => {
      const beforeSrc = widget.dataset.audioBefore;
      const afterSrc = widget.dataset.audioAfter;

      if (!beforeSrc && !afterSrc) return;

      const audioBefore = beforeSrc ? new Audio(beforeSrc) : null;
      const audioAfter = afterSrc ? new Audio(afterSrc) : null;

      // Preload
      if (audioBefore) audioBefore.preload = 'metadata';
      if (audioAfter) audioAfter.preload = 'metadata';

      let showingBefore = true; // "Prima" = before
      let isPlaying = false;

      const playBtn = widget.querySelector('[data-action="play"]');
      const toggleBtn = widget.querySelector('[data-action="toggle"]');
      const sourceLabel = widget.querySelector('.audio-source-label');
      const progress = widget.querySelector('.audio-progress');
      const timeDisplay = widget.querySelector('.audio-time');

      function activeAudio() {
        return showingBefore ? audioBefore : audioAfter;
      }

      function inactiveAudio() {
        return showingBefore ? audioAfter : audioBefore;
      }

      // Play / Pause
      playBtn.addEventListener('click', () => {
        const audio = activeAudio();
        if (!audio) return;

        if (isPlaying) {
          audio.pause();
          if (inactiveAudio()) inactiveAudio().pause();
          isPlaying = false;
          playBtn.innerHTML = '&#9654;';
          playBtn.classList.remove('playing');
        } else {
          audio.play();
          isPlaying = true;
          playBtn.innerHTML = '&#9646;&#9646;';
          playBtn.classList.add('playing');
        }
      });

      // Toggle Prima / Dopo
      toggleBtn.addEventListener('click', () => {
        const currentAudio = activeAudio();
        const currentTime = currentAudio ? currentAudio.currentTime : 0;

        // Pause current
        if (currentAudio) currentAudio.pause();

        showingBefore = !showingBefore;
        toggleBtn.textContent = showingBefore ? 'Prima' : 'Dopo';
        toggleBtn.classList.toggle('active-dopo', !showingBefore);
        sourceLabel.textContent = showingBefore ? 'Before' : 'After';

        // Sync position and resume if was playing
        const nextAudio = activeAudio();
        if (nextAudio) {
          nextAudio.currentTime = currentTime;
          if (isPlaying) nextAudio.play();
        }
      });

      // Progress bar seeking
      progress.addEventListener('input', () => {
        const audio = activeAudio();
        if (audio && audio.duration) {
          const seekTime = (progress.value / 100) * audio.duration;
          audio.currentTime = seekTime;
          // Sync the other track too
          const other = inactiveAudio();
          if (other) other.currentTime = seekTime;
        }
      });

      // Update progress during playback
      function updateProgress() {
        const audio = activeAudio();
        if (audio && audio.duration) {
          progress.value = (audio.currentTime / audio.duration) * 100;
          timeDisplay.textContent = formatTime(audio.currentTime);
        }
        requestAnimationFrame(updateProgress);
      }
      requestAnimationFrame(updateProgress);

      // Handle ended
      [audioBefore, audioAfter].forEach(audio => {
        if (!audio) return;
        audio.addEventListener('ended', () => {
          isPlaying = false;
          playBtn.innerHTML = '&#9654;';
          playBtn.classList.remove('playing');
          progress.value = 0;
          timeDisplay.textContent = '0:00';
        });
      });
    });
  }
})();
