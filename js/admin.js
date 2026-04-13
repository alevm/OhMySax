// OhMySax Admin — commits JSON data + photos to GitHub via Contents API
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
      photos: document.getElementById('ws-photos').value.split(',').map(s => s.trim()).filter(Boolean)
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
    } catch (err) {
      showStatus('status-workshop', err.message, false);
    }
  });

  // --- Comparison entry ---
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
    // Auto-fill path if empty
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

      // Check if file already exists (to get sha)
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

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
})();
