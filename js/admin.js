// OhMySax Admin — commits JSON data + photos + audio to GitHub via Contents API
(function () {
  const REPO = 'alevm/OhMySax';
  const BRANCH = 'main';
  const API = 'https://api.github.com';

  // --- Token persistence (localStorage, never leaves the browser except to GitHub) ---
  const tokenInput = document.getElementById('gh-token');
  tokenInput.value = localStorage.getItem('ohmysax-gh-token') || '';
  tokenInput.addEventListener('input', () => {
    localStorage.setItem('ohmysax-gh-token', tokenInput.value);
  });

  function getToken() {
    return tokenInput.value.trim();
  }

  // --- Tab switching ---
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.admin-panel').forEach(p => p.hidden = true);
      tab.classList.add('active');
      document.getElementById('panel-' + tab.dataset.tab).hidden = false;
    });
  });

  // --- GitHub API helpers ---
  async function ghGet(path) {
    const res = await fetch(`${API}/repos/${REPO}/contents/${path}?ref=${BRANCH}`, {
      headers: { Authorization: `token ${getToken()}`, Accept: 'application/vnd.github.v3+json' }
    });
    if (!res.ok) throw new Error(`GitHub GET ${path}: ${res.status}`);
    return res.json();
  }

  async function ghPut(path, content, message, sha) {
    const body = { message, content: btoa(unescape(encodeURIComponent(content))), branch: BRANCH };
    if (sha) body.sha = sha;
    const res = await fetch(`${API}/repos/${REPO}/contents/${path}`, {
      method: 'PUT',
      headers: { Authorization: `token ${getToken()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`GitHub PUT ${path}: ${res.status} — ${err.message || ''}`);
    }
    return res.json();
  }

  async function ghPutBinary(path, base64Content, message, sha) {
    const body = { message, content: base64Content, branch: BRANCH };
    if (sha) body.sha = sha;
    const res = await fetch(`${API}/repos/${REPO}/contents/${path}`, {
      method: 'PUT',
      headers: { Authorization: `token ${getToken()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`GitHub PUT ${path}: ${res.status} — ${err.message || ''}`);
    }
    return res.json();
  }

  function showStatus(id, msg, ok) {
    const el = document.getElementById(id);
    el.className = 'admin-status ' + (ok ? 'ok' : 'err');
    el.textContent = msg;
  }

  function slugify(s) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  // --- Workshop steps management ---
  let stepCount = 0;
  const stepsList = document.getElementById('ws-steps-list');

  document.getElementById('ws-add-step').addEventListener('click', () => {
    stepCount++;
    const block = document.createElement('div');
    block.className = 'step-block';
    block.dataset.stepIdx = stepCount;
    block.innerHTML = `
      <button type="button" class="step-remove" title="Remove step">&times;</button>
      <label>Stage</label>
      <select class="step-stage">
        <option value="inspection">Inspection</option>
        <option value="disassembly">Disassembly</option>
        <option value="diagnosis">Diagnosis</option>
        <option value="repair">Repair</option>
        <option value="reassembly">Reassembly</option>
        <option value="testing">Testing</option>
        <option value="planning">Planning</option>
        <option value="complete">Complete</option>
      </select>
      <label>Date</label>
      <input type="date" class="step-date">
      <label>Description</label>
      <textarea class="step-desc" rows="2"></textarea>
      <label>Photo path (optional)</label>
      <input type="text" class="step-photo" placeholder="images/workshop/step-photo.jpg">
    `;
    block.querySelector('.step-remove').addEventListener('click', () => block.remove());
    stepsList.appendChild(block);
  });

  function collectSteps() {
    const steps = [];
    stepsList.querySelectorAll('.step-block').forEach(block => {
      const stage = block.querySelector('.step-stage').value;
      const date = block.querySelector('.step-date').value;
      const description = block.querySelector('.step-desc').value.trim();
      const photo = block.querySelector('.step-photo').value.trim();
      if (description) {
        steps.push({ stage, date, description, photo });
      }
    });
    return steps;
  }

  // --- Workshop entry ---
  document.getElementById('form-workshop').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!getToken()) return showStatus('status-workshop', 'Set your GitHub token first.', false);

    const entry = {
      id: slugify(document.getElementById('ws-date').value + '-' + document.getElementById('ws-title').value).slice(0, 60),
      date: document.getElementById('ws-date').value,
      title: document.getElementById('ws-title').value,
      horn: document.getElementById('ws-horn').value,
      summary: document.getElementById('ws-summary').value,
      body: document.getElementById('ws-body').value,
      photos: document.getElementById('ws-photos').value.split(',').map(s => s.trim()).filter(Boolean),
      steps: collectSteps()
    };

    try {
      showStatus('status-workshop', 'Fetching current data...', true);
      const file = await ghGet('data/workshops.json');
      const existing = JSON.parse(atob(file.content));
      existing.push(entry);
      const content = JSON.stringify(existing, null, 2);
      await ghPut('data/workshops.json', content, `Add workshop entry: ${entry.title}`, file.sha);
      showStatus('status-workshop', 'Published! Deploy will trigger automatically.', true);
      e.target.reset();
      stepsList.innerHTML = '';
      stepCount = 0;
    } catch (err) {
      showStatus('status-workshop', err.message, false);
    }
  });

  // --- Comparison entry (with audio fields) ---
  document.getElementById('form-comparison').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!getToken()) return showStatus('status-comparison', 'Set your GitHub token first.', false);

    const entry = {
      id: slugify(document.getElementById('cmp-title').value).slice(0, 60),
      title: document.getElementById('cmp-title').value,
      horn: document.getElementById('cmp-horn').value,
      description: document.getElementById('cmp-desc').value,
      before: document.getElementById('cmp-before').value.trim(),
      after: document.getElementById('cmp-after').value.trim(),
      audioBefore: document.getElementById('cmp-audio-before').value.trim(),
      audioAfter: document.getElementById('cmp-audio-after').value.trim(),
      date: document.getElementById('cmp-date').value
    };

    try {
      showStatus('status-comparison', 'Fetching current data...', true);
      const file = await ghGet('data/comparisons.json');
      const existing = JSON.parse(atob(file.content));
      existing.push(entry);
      const content = JSON.stringify(existing, null, 2);
      await ghPut('data/comparisons.json', content, `Add comparison: ${entry.title}`, file.sha);
      showStatus('status-comparison', 'Published! Deploy will trigger automatically.', true);
      e.target.reset();
    } catch (err) {
      showStatus('status-comparison', err.message, false);
    }
  });

  // --- Photo upload ---
  const dropArea = document.getElementById('photo-drop');
  const fileInput = document.getElementById('photo-file');
  const preview = document.getElementById('photo-preview');
  let selectedFile = null;

  dropArea.addEventListener('click', () => fileInput.click());
  dropArea.addEventListener('dragover', (e) => { e.preventDefault(); dropArea.style.borderColor = 'var(--patina)'; });
  dropArea.addEventListener('dragleave', () => { dropArea.style.borderColor = ''; });
  dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.style.borderColor = '';
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', () => {
    if (fileInput.files.length) handleFile(fileInput.files[0]);
  });

  function handleFile(file) {
    selectedFile = file;
    preview.innerHTML = '';
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    preview.appendChild(img);
    const pathInput = document.getElementById('photo-path');
    if (!pathInput.value) {
      pathInput.value = 'images/' + file.name;
    }
  }

  document.getElementById('form-photo').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!getToken()) return showStatus('status-photo', 'Set your GitHub token first.', false);
    if (!selectedFile) return showStatus('status-photo', 'Select a photo first.', false);

    const path = document.getElementById('photo-path').value.trim();
    if (!path) return showStatus('status-photo', 'Enter a destination path.', false);

    try {
      showStatus('status-photo', 'Reading file...', true);
      const base64 = await fileToBase64(selectedFile);

      let sha;
      try {
        const existing = await ghGet(path);
        sha = existing.sha;
      } catch (ignore) { /* file doesn't exist yet */ }

      showStatus('status-photo', 'Uploading to GitHub...', true);
      await ghPutBinary(path, base64, `Add photo: ${path}`, sha);
      showStatus('status-photo', `Uploaded ${path}. Deploy will trigger automatically.`, true);
      selectedFile = null;
      preview.innerHTML = '';
      e.target.reset();
    } catch (err) {
      showStatus('status-photo', err.message, false);
    }
  });

  // --- Audio upload ---
  const audioDropArea = document.getElementById('audio-drop');
  const audioFileInput = document.getElementById('audio-file');
  const audioPreview = document.getElementById('audio-preview');
  let selectedAudioFile = null;

  audioDropArea.addEventListener('click', () => audioFileInput.click());
  audioDropArea.addEventListener('dragover', (e) => { e.preventDefault(); audioDropArea.style.borderColor = 'var(--patina)'; });
  audioDropArea.addEventListener('dragleave', () => { audioDropArea.style.borderColor = ''; });
  audioDropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    audioDropArea.style.borderColor = '';
    if (e.dataTransfer.files.length) handleAudioFile(e.dataTransfer.files[0]);
  });
  audioFileInput.addEventListener('change', () => {
    if (audioFileInput.files.length) handleAudioFile(audioFileInput.files[0]);
  });

  function handleAudioFile(file) {
    selectedAudioFile = file;
    audioPreview.textContent = `Selected: ${file.name} (${(file.size / 1024).toFixed(0)} KB)`;
    const pathInput = document.getElementById('audio-path');
    if (!pathInput.value) {
      pathInput.value = 'audio/' + file.name;
    }
  }

  document.getElementById('form-audio').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!getToken()) return showStatus('status-audio', 'Set your GitHub token first.', false);
    if (!selectedAudioFile) return showStatus('status-audio', 'Select an audio file first.', false);

    const path = document.getElementById('audio-path').value.trim();
    if (!path) return showStatus('status-audio', 'Enter a destination path.', false);

    try {
      showStatus('status-audio', 'Reading file...', true);
      const base64 = await fileToBase64(selectedAudioFile);

      let sha;
      try {
        const existing = await ghGet(path);
        sha = existing.sha;
      } catch (ignore) { /* file doesn't exist yet */ }

      showStatus('status-audio', 'Uploading to GitHub...', true);
      await ghPutBinary(path, base64, `Add audio: ${path}`, sha);
      showStatus('status-audio', `Uploaded ${path}. Deploy will trigger automatically.`, true);
      selectedAudioFile = null;
      audioPreview.textContent = '';
      e.target.reset();
    } catch (err) {
      showStatus('status-audio', err.message, false);
    }
  });

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
})();
