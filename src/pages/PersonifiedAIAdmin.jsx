import { useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function PersonifiedAIAdmin() {
  const didInit = useRef(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    const m = document.createElement('meta');
    m.name = 'robots';
    m.content = 'noindex,nofollow';
    document.head.appendChild(m);
    return () => {
      try { document.head.removeChild(m); } catch { /* noop */ }
    };
  }, []);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    const root = document.getElementById('personified-ai-admin');
    if (!root) return;
    const $ = (sel) => root.querySelector(sel);
    const $$ = (sel) => root.querySelectorAll(sel);

    let settings = { model: 'claude-sonnet-4-6', brands: [] };
    let editingId = null;
    let adminPassword = sessionStorage.getItem('adminPass') || '';

    function escHtml(s) {
      return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    function escAttr(s) {
      return String(s).replace(/"/g, '&quot;');
    }

    const ALL_MODELS = [
      { value: 'claude-opus-4-7', label: 'Claude Opus 4.7' },
      { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
      { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5' },
      { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
      { value: 'gpt-4o', label: 'GPT-4o' },
      { value: 'gpt-4o-mini', label: 'GPT-4o mini' },
      { value: 'o3-mini', label: 'o3 mini' },
    ];

    function modelOptions(selected) {
      return ALL_MODELS.map(
        (m) =>
          `<option value="${m.value}"${m.value === selected ? ' selected' : ''}>${m.label}</option>`
      ).join('');
    }

    async function tryLogin(password, silent = false) {
      try {
        const res = await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'verify', password }),
        });
        if (res.ok) {
          adminPassword = password;
          sessionStorage.setItem('adminPass', password);
          $('#gate').style.display = 'none';
          $('#admin').style.display = 'block';
          loadSettings();
        } else {
          if (!silent) $('#gate-error').textContent = 'Wrong password';
        }
      } catch {
        if (!silent) $('#gate-error').textContent = 'Connection error';
      }
    }

    async function loadSettings() {
      const res = await fetch('/api/settings');
      settings = await res.json();
      const radio = root.querySelector(`input[name="model"][value="${settings.model}"]`);
      if (radio) radio.checked = true;
      renderBrandList();
    }

    function renderBrandList() {
      const list = $('#brands-list');
      list.innerHTML = settings.brands
        .map(
          (b, i) => `
            <div class="brand-item-row">
              <button class="brand-item${b.id === editingId ? ' active' : ''}" data-id="${b.id}" style="${b.hidden ? 'opacity:0.45' : ''}">${escHtml(b.name)}${b.hidden ? ' <span style="font-size:10px;opacity:0.7">(hidden)</span>' : ''}</button>
              <div class="reorder-btns">
                <button class="reorder-btn" data-id="${b.id}" data-dir="-1" ${i === 0 ? 'disabled' : ''}>▲</button>
                <button class="reorder-btn" data-id="${b.id}" data-dir="1" ${i === settings.brands.length - 1 ? 'disabled' : ''}>▼</button>
              </div>
            </div>
          `
        )
        .join('');
      list.querySelectorAll('.brand-item').forEach((btn) => {
        btn.addEventListener('click', () => editBrand(btn.dataset.id));
      });
      list.querySelectorAll('.reorder-btn:not([disabled])').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          const dir = parseInt(btn.dataset.dir);
          const idx = settings.brands.findIndex((b) => b.id === id);
          const newIdx = idx + dir;
          if (newIdx < 0 || newIdx >= settings.brands.length) return;
          [settings.brands[idx], settings.brands[newIdx]] = [
            settings.brands[newIdx],
            settings.brands[idx],
          ];
          renderBrandList();
          saveToServer();
        });
      });
    }

    function getPresets() {
      return [...root.querySelectorAll('#preset-inputs .preset-input')].map((i) => i.value);
    }

    function renderPresetInputs(presets) {
      const container = $('#preset-inputs');
      if (!container) return;
      container.innerHTML = presets
        .map(
          (p, i) => `
            <div class="preset-input-row" data-index="${i}">
              <input class="preset-input" value="${escAttr(p)}" placeholder="Preset ${i + 1}">
              <div class="preset-reorder-btns">
                <button class="preset-reorder-btn" data-dir="-1" ${i === 0 ? 'disabled' : ''}>▲</button>
                <button class="preset-reorder-btn" data-dir="1" ${i === presets.length - 1 ? 'disabled' : ''}>▼</button>
              </div>
              <button class="preset-remove-btn" title="Remove">✕</button>
            </div>
          `
        )
        .join('');
      container.querySelectorAll('.preset-reorder-btn:not([disabled])').forEach((btn) => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.closest('.preset-input-row').dataset.index);
          const dir = parseInt(btn.dataset.dir);
          const vals = getPresets();
          [vals[idx], vals[idx + dir]] = [vals[idx + dir], vals[idx]];
          renderPresetInputs(vals);
        });
      });
      container.querySelectorAll('.preset-remove-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.closest('.preset-input-row').dataset.index);
          const vals = getPresets();
          vals.splice(idx, 1);
          renderPresetInputs(vals);
        });
      });
    }

    function editBrand(id) {
      editingId = id;
      const brand = settings.brands.find((b) => b.id === id);
      const presets = (brand.presets || []).filter((p) => p);
      const editor = $('#brand-editor');
      editor.innerHTML = `
        <div class="editor-header">
          <input class="brand-name-input" id="edit-name" value="${escAttr(brand.name)}" placeholder="Brand name">
          <button class="delete-btn" id="delete-btn">Delete brand</button>
        </div>
        <div class="editor-section" style="display:flex;align-items:center;gap:10px;margin-bottom:1rem">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-family:var(--pai-font-body);font-size:13px;color:var(--pai-text-sec)">
            <input type="checkbox" id="edit-hidden" ${brand.hidden ? 'checked' : ''} style="accent-color:var(--pai-primary);width:15px;height:15px">
            Hidden – don't show on public website
          </label>
        </div>
        <div class="editor-section">
          <label class="editor-label">Description <span style="opacity:0.5;font-style:italic;text-transform:none;letter-spacing:0">(shown on website)</span></label>
          <textarea class="desc-input" id="edit-desc" rows="2">${escHtml(brand.description || '')}</textarea>
        </div>
        <div class="editor-section">
          <label class="editor-label">Voice &amp; Tone guide</label>
          <textarea class="brand-vt-input" id="edit-guide">${escHtml(brand.guide)}</textarea>
        </div>
        <div class="editor-section">
          <label class="editor-label">Preset prompts <span style="opacity:0.5;font-style:italic;text-transform:none;letter-spacing:0">(shown as quick options)</span></label>
          <div class="preset-inputs" id="preset-inputs"></div>
          <button class="add-preset-btn" id="add-preset-btn">+ Add prompt</button>
        </div>
        <button class="apply-btn" id="apply-btn">Apply changes</button>

        <div class="preview-section">
          <label class="editor-label">Preview</label>
          <div class="preview-controls">
            <textarea id="preview-prompt" placeholder="Type a prompt to preview…"></textarea>
            <div style="display:flex;flex-direction:column;gap:8px">
              <select class="model-select" id="preview-model">${modelOptions(settings.model)}</select>
              <button class="preview-run-btn" id="preview-run-btn">Run</button>
            </div>
          </div>
          <div class="preview-col" id="preview-col">
            <div class="preview-col-head">
              <span>With V&amp;T guide</span>
              <span class="preview-token-count" id="preview-tokens"></span>
            </div>
            <div class="preview-col-body" id="preview-guided">–</div>
          </div>
        </div>
      `;
      renderPresetInputs(presets);
      $('#apply-btn').addEventListener('click', () => applyEdit(id));
      $('#delete-btn').addEventListener('click', () => deleteBrand(id));
      $('#preview-run-btn').addEventListener('click', () => runPreview(id));
      $('#add-preset-btn').addEventListener('click', () => {
        const current = getPresets();
        renderPresetInputs([...current, '']);
        const inputs = root.querySelectorAll('#preset-inputs .preset-input');
        inputs[inputs.length - 1]?.focus();
      });
      renderBrandList();
    }

    async function applyEdit(id) {
      const idx = settings.brands.findIndex((b) => b.id === id);
      settings.brands[idx].name = $('#edit-name').value.trim() || 'Unnamed brand';
      settings.brands[idx].hidden = $('#edit-hidden').checked;
      settings.brands[idx].description = $('#edit-desc').value.trim();
      settings.brands[idx].guide = $('#edit-guide').value.trim();
      settings.brands[idx].presets = getPresets().map((p) => p.trim()).filter((p) => p);
      renderBrandList();
      await saveToServer();
    }

    async function runPreview(id) {
      const prompt = $('#preview-prompt').value.trim();
      if (!prompt) return;
      const model = $('#preview-model').value;
      const guide = $('#edit-guide').value.trim();
      const btn = $('#preview-run-btn');
      const guidedEl = $('#preview-guided');
      const tokensEl = $('#preview-tokens');
      btn.disabled = true;
      guidedEl.innerHTML = '<div class="loading"><span></span><span></span><span></span></div>';
      tokensEl.textContent = '';
      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system: `Apply the following Voice & Tone guide to your response, whatever the task. Do not explain what you are doing, just respond.\n\n${guide}`,
            prompt,
            model,
            devToken: adminPassword,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        guidedEl.textContent = data.text;
        if (data.tokens) tokensEl.textContent = `${data.tokens} tokens`;
      } catch (e) {
        guidedEl.textContent = `Error: ${e.message}`;
      }
      btn.disabled = false;
    }

    function deleteBrand(id) {
      if (!confirm('Delete this brand?')) return;
      settings.brands = settings.brands.filter((b) => b.id !== id);
      editingId = null;
      $('#brand-editor').innerHTML =
        '<p class="editor-placeholder">Select a brand to edit</p>';
      renderBrandList();
      saveToServer();
    }

    async function saveToServer() {
      settings.model =
        root.querySelector("input[name='model']:checked")?.value || settings.model;
      const status = $('#save-status');
      status.style.color = '';
      status.textContent = 'Saving…';
      try {
        const res = await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: adminPassword, ...settings }),
        });
        if (res.ok) {
          status.textContent = 'Saved ✓';
        } else {
          const { error } = await res.json();
          status.style.color = '#ff6b6b';
          status.textContent = error || 'Error';
        }
      } catch {
        status.style.color = '#ff6b6b';
        status.textContent = 'Connection error';
      }
      setTimeout(() => {
        status.textContent = '';
        status.style.color = '';
      }, 2000);
    }

    // Bind password gate
    const gatePass = $('#gate-pass');
    const gateBtn = $('#gate-btn');
    const onGateKeydown = (e) => { if (e.key === 'Enter') gateBtn.click(); };
    const onGateClick = () => tryLogin(gatePass.value);
    gatePass.addEventListener('keydown', onGateKeydown);
    gateBtn.addEventListener('click', onGateClick);

    // Bind add-brand
    const addBrandBtn = $('#add-brand-btn');
    const onAddBrand = () => {
      const id = 'brand_' + Date.now();
      settings.brands.push({ id, name: 'New brand', guide: '' });
      editBrand(id);
    };
    addBrandBtn.addEventListener('click', onAddBrand);

    // Bind model radios
    const radioHandlers = [];
    $$('input[name="model"]').forEach((radio) => {
      const h = () => saveToServer();
      radio.addEventListener('change', h);
      radioHandlers.push([radio, h]);
    });

    // Bind tab nav
    const tabHandlers = [];
    $$('.nav-btn').forEach((btn) => {
      const h = () => {
        $$('.nav-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        $$('.tab').forEach((t) => t.classList.remove('active'));
        $(`#tab-${btn.dataset.tab}`).classList.add('active');
      };
      btn.addEventListener('click', h);
      tabHandlers.push([btn, h]);
    });

    if (adminPassword) tryLogin(adminPassword, true);

    return () => {
      gatePass.removeEventListener('keydown', onGateKeydown);
      gateBtn.removeEventListener('click', onGateClick);
      addBrandBtn.removeEventListener('click', onAddBrand);
      radioHandlers.forEach(([r, h]) => r.removeEventListener('change', h));
      tabHandlers.forEach(([b, h]) => b.removeEventListener('click', h));
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <style>{`
        #personified-ai-admin {
          --pai-primary: #8F5BDE;
          --pai-primary-light: #DFC2F2;
          --pai-secondary-light: #97EFE9;
          --pai-secondary: #17D9DA;
          --pai-bg: #0a0a0a;
          --pai-bg-card: #121212;
          --pai-bg-raised: #181818;
          --pai-text: #ffffff;
          --pai-text-sec: #d4d4d4;
          --pai-text-card: #111111;
          --pai-text-card-sec: #555555;
          --pai-border: #292929;
          --pai-border-mid: rgba(255,255,255,0.14);
          --pai-border-card: rgba(0,0,0,0.08);
          --pai-border-card-mid: rgba(0,0,0,0.14);
          --pai-font-logo: 'Zen Dots', sans-serif;
          --pai-font-title: 'Orbitron', sans-serif;
          --pai-font-body: 'Oxanium', sans-serif;
          --pai-radius: 12px;
          --pai-radius-sm: 8px;
          padding-top: 64px;
          font-family: var(--pai-font-body);
          color: var(--pai-text);
        }

        #personified-ai-admin .loading { display: flex; gap: 6px; align-items: center; padding-top: 4px; }
        #personified-ai-admin .loading span {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--pai-primary);
          animation: pai-pulse 1.2s ease-in-out infinite;
        }
        #personified-ai-admin .loading span:nth-child(2) { animation-delay: 0.2s; background: var(--pai-primary-light); }
        #personified-ai-admin .loading span:nth-child(3) { animation-delay: 0.4s; background: var(--pai-secondary-light); }
        @keyframes pai-pulse { 0%,80%,100%{transform:scale(0.5);opacity:0.3} 40%{transform:scale(1);opacity:1} }

        /* GATE */
        #personified-ai-admin #gate {
          position: fixed; inset: 0; background: var(--pai-bg);
          display: flex; align-items: center; justify-content: center; z-index: 999;
        }
        #personified-ai-admin .gate-card {
          width: 360px; background: var(--pai-bg-card);
          border: 1px solid var(--pai-border-mid);
          border-radius: var(--pai-radius);
          padding: 2.5rem 2rem;
          display: flex; flex-direction: column; gap: 1rem;
        }
        #personified-ai-admin .gate-logo {
          font-family: var(--pai-font-logo); font-size: 20px; margin-bottom: 0.5rem;
        }
        #personified-ai-admin .gate-logo span { color: var(--pai-primary); }
        #personified-ai-admin .gate-card input[type="password"] {
          width: 100%; background: var(--pai-bg-raised);
          border: 1px solid var(--pai-border-mid);
          border-radius: var(--pai-radius-sm);
          padding: 12px 14px; font-family: var(--pai-font-body); font-size: 14px;
          color: var(--pai-text); outline: none; transition: border-color 0.15s;
        }
        #personified-ai-admin .gate-card input[type="password"]:focus { border-color: var(--pai-primary); }
        #personified-ai-admin .gate-btn {
          width: 100%; background: var(--pai-primary); color: #fff;
          border: none; border-radius: var(--pai-radius-sm);
          padding: 12px; font-family: var(--pai-font-title); font-size: 12px;
          letter-spacing: 0.1em; text-transform: uppercase;
          text-shadow: 0 1px 3px rgba(0,0,0,0.45);
          cursor: pointer; transition: background 0.15s;
        }
        #personified-ai-admin .gate-btn:hover { background: #7a48c8; }
        #personified-ai-admin .gate-error { font-size: 12px; color: #ff6b6b; min-height: 16px; }

        /* ADMIN LAYOUT */
        #personified-ai-admin #admin { display: none; height: calc(100vh - 64px); }
        #personified-ai-admin .admin-layout { display: flex; height: 100%; }

        /* SIDEBAR */
        #personified-ai-admin .sidebar {
          width: 220px; flex-shrink: 0;
          background: var(--pai-bg-card);
          border-right: 1px solid var(--pai-border);
          display: flex; flex-direction: column;
          padding: 1.5rem 1rem; gap: 0.5rem;
        }
        #personified-ai-admin .sidebar-logo {
          font-family: var(--pai-font-logo); font-size: 16px;
          color: var(--pai-text); text-decoration: none;
          padding: 0 0.5rem; margin-bottom: 1rem;
        }
        #personified-ai-admin .sidebar-logo span { color: var(--pai-primary); }
        #personified-ai-admin .sidebar-label {
          font-family: var(--pai-font-title); font-size: 9px;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--pai-text-sec);
          padding: 0 0.5rem; margin-top: 0.5rem; margin-bottom: 0.25rem;
        }
        #personified-ai-admin .nav-btn {
          width: 100%; text-align: left; background: transparent;
          border: none; border-radius: var(--pai-radius-sm);
          padding: 9px 12px; font-family: var(--pai-font-body);
          font-size: 13px; color: var(--pai-text-sec);
          cursor: pointer; transition: all 0.15s;
        }
        #personified-ai-admin .nav-btn:hover { background: var(--pai-bg-raised); color: var(--pai-text); }
        #personified-ai-admin .nav-btn.active { background: rgba(143,91,222,0.15); color: var(--pai-primary-light); }
        #personified-ai-admin .sidebar-bottom { margin-top: auto; display: flex; flex-direction: column; gap: 0.5rem; }
        #personified-ai-admin .save-status { text-align: center; font-size: 12px; color: var(--pai-secondary-light); min-height: 18px; }

        /* MAIN */
        #personified-ai-admin .admin-main { flex: 1; overflow-y: auto; padding: 2.5rem; }
        #personified-ai-admin .tab { display: none; }
        #personified-ai-admin .tab.active { display: block; }
        #personified-ai-admin .tab-title { font-family: var(--pai-font-title); font-size: 14px; font-weight: 500; letter-spacing: 0.08em; margin-bottom: 0.4rem; }
        #personified-ai-admin .tab-desc { font-size: 13px; color: var(--pai-text-sec); margin-bottom: 2rem; font-weight: 300; }

        #personified-ai-admin .provider-label {
          font-family: var(--pai-font-title); font-size: 9px;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--pai-text-sec); margin-bottom: 10px;
          display: flex; align-items: center; gap: 8px;
        }
        #personified-ai-admin .usage-link {
          font-family: var(--pai-font-body); font-size: 10px; letter-spacing: 0;
          text-transform: none; color: var(--pai-text-sec);
          opacity: 0.5; text-decoration: none; transition: opacity 0.15s;
        }
        #personified-ai-admin .usage-link:hover { opacity: 1; color: var(--pai-primary-light); }

        /* MODEL CARDS */
        #personified-ai-admin .model-cards { display: flex; flex-direction: column; gap: 12px; max-width: 480px; }
        #personified-ai-admin .model-card {
          display: flex; align-items: center; gap: 14px;
          background: var(--pai-bg-card);
          border: 1px solid var(--pai-border-mid);
          border-radius: var(--pai-radius);
          padding: 16px 20px; cursor: pointer; transition: border-color 0.15s;
        }
        #personified-ai-admin .model-card:has(input:checked) {
          border-color: var(--pai-primary);
          background: rgba(143,91,222,0.08);
        }
        #personified-ai-admin .model-card input[type="radio"] { accent-color: var(--pai-primary); width: 16px; height: 16px; flex-shrink: 0; }
        #personified-ai-admin .model-card-info { display: flex; flex-direction: column; gap: 2px; }
        #personified-ai-admin .model-card strong { font-size: 14px; font-weight: 500; }
        #personified-ai-admin .model-card span { font-size: 12px; color: var(--pai-text-sec); font-weight: 300; }

        /* BRANDS */
        #personified-ai-admin .brands-layout { display: grid; grid-template-columns: 200px 1fr; gap: 20px; align-items: start; }
        #personified-ai-admin .brand-editor { overflow-y: auto; max-height: calc(100vh - 220px); background: var(--pai-bg-card); border: 1px solid var(--pai-border); border-radius: var(--pai-radius); padding: 1.5rem; min-height: 300px; }
        #personified-ai-admin .editor-section { margin-bottom: 1.25rem; }
        #personified-ai-admin .preset-inputs { display: flex; flex-direction: column; gap: 6px; }
        #personified-ai-admin .preset-input-row { display: flex; align-items: center; gap: 6px; }
        #personified-ai-admin .preset-input {
          flex: 1; background: #ffffff; border: 1px solid rgba(0,0,0,0.14);
          border-radius: var(--pai-radius-sm); padding: 9px 12px;
          font-family: var(--pai-font-body); font-size: 13px;
          color: #111111; outline: none; transition: border-color 0.15s; font-weight: 300;
        }
        #personified-ai-admin .preset-input:focus { border-color: var(--pai-primary); }
        #personified-ai-admin .preset-reorder-btns { display: flex; flex-direction: column; gap: 1px; }
        #personified-ai-admin .preset-reorder-btn {
          background: transparent; border: none; color: var(--pai-text-sec);
          cursor: pointer; font-size: 9px; padding: 2px 4px; line-height: 1;
          border-radius: 3px; transition: color 0.1s;
        }
        #personified-ai-admin .preset-reorder-btn:hover { color: var(--pai-primary-light); }
        #personified-ai-admin .preset-reorder-btn:disabled { opacity: 0.2; cursor: default; }
        #personified-ai-admin .preset-remove-btn {
          background: transparent; border: none; color: rgba(255,100,100,0.5);
          cursor: pointer; font-size: 14px; line-height: 1; padding: 4px 6px;
          border-radius: 4px; transition: color 0.1s;
        }
        #personified-ai-admin .preset-remove-btn:hover { color: #ff6464; }
        #personified-ai-admin .add-preset-btn {
          margin-top: 6px; background: transparent; border: 1px dashed var(--pai-border-mid);
          border-radius: var(--pai-radius-sm); padding: 8px 12px;
          font-family: var(--pai-font-body); font-size: 12px; color: var(--pai-text-sec);
          cursor: pointer; width: 100%; text-align: left; transition: border-color 0.15s, color 0.15s;
        }
        #personified-ai-admin .add-preset-btn:hover { border-color: var(--pai-primary); color: var(--pai-primary-light); }
        #personified-ai-admin .desc-input {
          width: 100%; background: #ffffff; border: 1px solid rgba(0,0,0,0.14);
          border-radius: var(--pai-radius-sm); padding: 10px 12px;
          font-family: var(--pai-font-body); font-size: 13px; color: #111111;
          outline: none; resize: none; font-weight: 300; line-height: 1.6;
          min-height: 60px; transition: border-color 0.15s;
        }
        #personified-ai-admin .desc-input:focus { border-color: var(--pai-primary); }
        #personified-ai-admin .preview-section {
          margin-top: 1.5rem; border-top: 1px solid var(--pai-border); padding-top: 1.5rem;
        }
        #personified-ai-admin .preview-controls {
          display: flex; gap: 10px; margin-bottom: 12px; align-items: flex-start;
        }
        #personified-ai-admin .preview-controls textarea {
          flex: 1; background: #ffffff; border: 1px solid rgba(0,0,0,0.14);
          border-radius: var(--pai-radius-sm); padding: 10px 12px;
          font-family: var(--pai-font-body); font-size: 13px; color: #111111;
          resize: none; outline: none; min-height: 64px; font-weight: 300;
          transition: border-color 0.15s;
        }
        #personified-ai-admin .preview-controls textarea:focus { border-color: var(--pai-primary); }
        #personified-ai-admin .model-select {
          background: #ffffff; border: 1px solid rgba(0,0,0,0.14);
          border-radius: var(--pai-radius-sm); padding: 8px 10px;
          font-family: var(--pai-font-body); font-size: 12px; color: #111111;
          outline: none; cursor: pointer;
        }
        #personified-ai-admin .preview-run-btn {
          background: var(--pai-primary); color: #fff; border: none;
          border-radius: var(--pai-radius-sm); padding: 10px 18px;
          font-family: var(--pai-font-title); font-size: 11px;
          letter-spacing: 0.08em; text-transform: uppercase;
          text-shadow: 0 1px 3px rgba(0,0,0,0.45);
          cursor: pointer; white-space: nowrap; transition: background 0.15s;
          align-self: flex-end;
        }
        #personified-ai-admin .preview-run-btn:hover { background: #7a48c8; }
        #personified-ai-admin .preview-run-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        #personified-ai-admin .preview-col {
          background: #ffffff; border: 1px solid rgba(0,0,0,0.1);
          border-radius: var(--pai-radius-sm); overflow: hidden;
        }
        #personified-ai-admin .preview-col-head {
          padding: 8px 12px; border-bottom: 1px solid rgba(0,0,0,0.08); background: #f0f0f0;
          font-family: var(--pai-font-title); font-size: 9px; letter-spacing: 0.1em;
          text-transform: uppercase; color: #555;
          display: flex; justify-content: space-between; align-items: center;
        }
        #personified-ai-admin .preview-token-count {
          font-family: var(--pai-font-body); font-size: 10px; color: #999;
          text-transform: none; letter-spacing: 0; font-weight: 300;
        }
        #personified-ai-admin .preview-col-body {
          padding: 12px; font-size: 12px; line-height: 1.7; color: #333;
          white-space: pre-wrap; min-height: 80px; font-weight: 300;
        }
        #personified-ai-admin .brand-item-row {
          display: flex; align-items: center;
          border-bottom: 1px solid var(--pai-border);
        }
        #personified-ai-admin .brand-item-row:last-child { border-bottom: none; }
        #personified-ai-admin .reorder-btns {
          display: flex; flex-direction: column; padding: 4px; gap: 1px;
        }
        #personified-ai-admin .reorder-btn {
          background: transparent; border: none; color: var(--pai-text-sec);
          cursor: pointer; font-size: 10px; padding: 2px 5px; line-height: 1;
          border-radius: 3px; transition: color 0.1s;
        }
        #personified-ai-admin .reorder-btn:hover { color: var(--pai-primary-light); }
        #personified-ai-admin .reorder-btn:disabled { opacity: 0.2; cursor: default; }
        #personified-ai-admin .brands-list-panel {
          background: var(--pai-bg-card);
          border: 1px solid var(--pai-border);
          border-radius: var(--pai-radius);
          overflow: hidden;
        }
        #personified-ai-admin .brands-list { display: flex; flex-direction: column; }
        #personified-ai-admin .brand-item {
          flex: 1; width: 100%; text-align: left; background: transparent;
          border: none; padding: 12px 16px;
          font-family: var(--pai-font-body); font-size: 13px;
          color: var(--pai-text-sec); cursor: pointer; transition: all 0.15s;
        }
        #personified-ai-admin .brand-item:hover { background: var(--pai-bg-raised); color: var(--pai-text); }
        #personified-ai-admin .brand-item.active { background: rgba(143,91,222,0.12); color: var(--pai-primary-light); }
        #personified-ai-admin .add-brand-btn {
          width: 100%; background: transparent; border: none;
          border-top: 1px solid var(--pai-border);
          padding: 12px 16px;
          font-family: var(--pai-font-body); font-size: 12px;
          color: var(--pai-text-sec); cursor: pointer;
          text-align: left; transition: color 0.15s;
        }
        #personified-ai-admin .add-brand-btn:hover { color: var(--pai-primary-light); }

        #personified-ai-admin .editor-placeholder {
          color: var(--pai-text-sec); font-size: 13px; font-style: italic;
          opacity: 0.5; padding-top: 0.5rem;
        }
        #personified-ai-admin .editor-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 1.25rem;
        }
        #personified-ai-admin .brand-name-input {
          background: transparent; border: none;
          border-bottom: 1px solid var(--pai-border-mid);
          padding: 6px 0; font-family: var(--pai-font-title);
          font-size: 14px; font-weight: 500; color: var(--pai-text);
          outline: none; width: 60%; transition: border-color 0.15s;
        }
        #personified-ai-admin .brand-name-input:focus { border-bottom-color: var(--pai-primary); }
        #personified-ai-admin .delete-btn {
          background: transparent; border: 1px solid rgba(255,100,100,0.3);
          border-radius: 100px; padding: 5px 14px;
          font-family: var(--pai-font-body); font-size: 11px;
          color: rgba(255,100,100,0.7); cursor: pointer; transition: all 0.15s;
        }
        #personified-ai-admin .delete-btn:hover { border-color: #ff6464; color: #ff6464; }
        #personified-ai-admin .editor-label {
          display: block; font-family: var(--pai-font-title); font-size: 9px;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--pai-text-sec); margin-bottom: 0.5rem;
        }
        #personified-ai-admin .brand-vt-input {
          width: 100%; background: #ffffff; border: 1px solid rgba(0,0,0,0.14);
          border-radius: var(--pai-radius-sm); padding: 14px;
          font-family: var(--pai-font-body); font-size: 13px; line-height: 1.75;
          color: #111111; resize: vertical; min-height: 280px;
          outline: none; transition: border-color 0.15s; font-weight: 300;
        }
        #personified-ai-admin .brand-vt-input:focus { border-color: var(--pai-primary); }
        #personified-ai-admin .apply-btn {
          margin-top: 12px; background: var(--pai-secondary); border: none;
          border-radius: var(--pai-radius-sm); padding: 10px 22px;
          font-family: var(--pai-font-title); font-size: 11px;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: #0a0a0a; cursor: pointer; transition: background 0.15s, opacity 0.15s;
        }
        #personified-ai-admin .apply-btn:hover { background: var(--pai-secondary-light); }
        #personified-ai-admin .preview-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
        }
      `}</style>

      <div id="personified-ai-admin">
        <div id="gate">
          <div className="gate-card">
            <div className="gate-logo">
              tall<span>-e</span>{' '}
              <span style={{ fontFamily: 'var(--pai-font-body)', fontSize: 13, color: 'var(--pai-text-sec)' }}>admin</span>
            </div>
            <input
              type="password"
              id="gate-pass"
              placeholder="Password"
              autoComplete="current-password"
            />
            <button className="gate-btn" id="gate-btn">Enter</button>
            <p className="gate-error" id="gate-error"></p>
          </div>
        </div>

        <div id="admin">
          <div className="admin-layout">
            <aside className="sidebar">
              <a href="/personified-ai" className="sidebar-logo">
                tall<span>-e</span>
              </a>
              <div className="sidebar-label">Settings</div>
              <button className="nav-btn active" data-tab="model">Model</button>
              <button className="nav-btn" data-tab="brands">Brands</button>
              <div className="sidebar-bottom">
                <p className="save-status" id="save-status"></p>
              </div>
            </aside>

            <main className="admin-main">
              <div className="tab active" id="tab-model">
                <h2 className="tab-title">AI Model</h2>
                <p className="tab-desc">Choose which model powers the demo for all visitors.</p>

                <div className="provider-label">
                  Anthropic{' '}
                  <a href="https://platform.claude.com/settings/billing" target="_blank" rel="noreferrer" className="usage-link">Check balance ↗</a>
                </div>
                <div className="model-cards">
                  <label className="model-card">
                    <input type="radio" name="model" value="claude-opus-4-7" />
                    <div className="model-card-info">
                      <strong>Opus 4.7</strong>
                      <span>Most capable – highest quality output</span>
                    </div>
                  </label>
                  <label className="model-card">
                    <input type="radio" name="model" value="claude-sonnet-4-6" />
                    <div className="model-card-info">
                      <strong>Sonnet 4.6</strong>
                      <span>Balanced – recommended</span>
                    </div>
                  </label>
                  <label className="model-card">
                    <input type="radio" name="model" value="claude-haiku-4-5-20251001" />
                    <div className="model-card-info">
                      <strong>Haiku 4.5</strong>
                      <span>Fastest – most affordable</span>
                    </div>
                  </label>
                </div>

                <div className="provider-label" style={{ marginTop: '1.5rem' }}>
                  Google{' '}
                  <a href="https://aistudio.google.com/u/2/spend?pli=1&project=gen-lang-client-0247055951" target="_blank" rel="noreferrer" className="usage-link">Check balance ↗</a>
                </div>
                <div className="model-cards">
                  <label className="model-card">
                    <input type="radio" name="model" value="gemini-2.5-pro" />
                    <div className="model-card-info">
                      <strong>Gemini 2.5 Pro</strong>
                      <span>Google's best – strong reasoning</span>
                    </div>
                  </label>
                </div>

                <div className="provider-label" style={{ marginTop: '1.5rem' }}>
                  OpenAI{' '}
                  <a href="https://platform.openai.com/settings/organization/billing/overview" target="_blank" rel="noreferrer" className="usage-link">Check balance ↗</a>
                </div>
                <div className="model-cards">
                  <label className="model-card">
                    <input type="radio" name="model" value="gpt-4o" />
                    <div className="model-card-info">
                      <strong>GPT-4o</strong>
                      <span>Flagship – best quality</span>
                    </div>
                  </label>
                  <label className="model-card">
                    <input type="radio" name="model" value="gpt-4o-mini" />
                    <div className="model-card-info">
                      <strong>GPT-4o mini</strong>
                      <span>Fast and affordable</span>
                    </div>
                  </label>
                  <label className="model-card">
                    <input type="radio" name="model" value="o3-mini" />
                    <div className="model-card-info">
                      <strong>o3 mini</strong>
                      <span>Best reasoning</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="tab" id="tab-brands">
                <h2 className="tab-title">Brands</h2>
                <p className="tab-desc">Each brand has its own Voice &amp; Tone guide shown in the demo.</p>
                <div className="brands-layout">
                  <div className="brands-list-panel">
                    <div className="brands-list" id="brands-list"></div>
                    <button className="add-brand-btn" id="add-brand-btn">+ Add brand</button>
                  </div>
                  <div className="brand-editor" id="brand-editor">
                    <p className="editor-placeholder">Select a brand to edit</p>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
