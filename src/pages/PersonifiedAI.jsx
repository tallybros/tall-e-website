import { useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function PersonifiedAI() {
  const didInit = useRef(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    let currentGuide = '';
    let currentModel = 'claude-sonnet-4-6';
    let brands = [];
    let currentBrandId = null;
    const devToken = new URLSearchParams(window.location.search).get('token') || '';

    const root = document.getElementById('personified-ai-page');
    if (!root) return;
    const $ = (sel) => root.querySelector(sel);
    const $$ = (sel) => root.querySelectorAll(sel);

    const runBtn = $('#run-btn');
    const promptInput = $('#prompt-input');
    const genericOut = $('#generic-out');
    const guidedOut = $('#guided-out');

    function loadingHTML() {
      return '<div class="loading"><span></span><span></span><span></span></div>';
    }

    function formatModel(m) {
      if (!m) return '';
      if (m.includes('opus')) return 'Claude Opus';
      if (m.includes('sonnet')) return 'Claude Sonnet';
      if (m.includes('haiku')) return 'Claude Haiku';
      if (m.includes('gpt-4o-mini')) return 'GPT-4o mini';
      if (m.includes('gpt-4o')) return 'GPT-4o';
      if (m.includes('o3-mini')) return 'o3 mini';
      if (m.includes('gemini-2.5-pro')) return 'Gemini 2.5 Pro';
      return m;
    }

    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        const settings = await res.json();
        currentModel = settings.model || 'claude-sonnet-4-6';
        brands = settings.brands || [];
      } catch {
        brands = [];
      }
      renderBrands();
      const first = brands.find((b) => !b.hidden);
      if (first) setBrand(first.id);
    }

    function renderBrands() {
      const row = $('.persona-row');
      const label = row.querySelector('.persona-label');
      row.innerHTML = '';
      row.appendChild(label);
      brands
        .filter((b) => !b.hidden)
        .forEach((brand, i) => {
          const btn = document.createElement('button');
          btn.className = 'persona-btn' + (i === 0 ? ' active' : '');
          btn.dataset.id = brand.id;
          btn.textContent = brand.name;
          btn.addEventListener('click', () => setBrand(brand.id));
          row.appendChild(btn);
        });
      $('#brand-desc').style.display =
        brands.filter((b) => !b.hidden).length ? 'block' : 'none';
    }

    function linkify(text) {
      const esc = text
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const a = (href, label) =>
        `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color:var(--pai-secondary);text-decoration:underline;text-underline-offset:2px">${label}</a>`;
      return esc
        // [label](url)
        .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, (_, label, url) => a(url, label))
        // bare https?:// URLs not already inside an href
        .replace(/(?<!href=")(https?:\/\/[^\s<>"]+)/g, (url) => a(url, url));
    }

    function setBrand(id) {
      const brand = brands.find((b) => b.id === id);
      if (!brand) return;
      currentBrandId = id;
      currentGuide = brand.guide;
      $$('.persona-btn').forEach((b) =>
        b.classList.toggle('active', b.dataset.id === id)
      );
      $('#brand-desc').innerHTML = linkify(brand.description || '');

      const presetRow = $('#preset-row');
      const presetLabel = $('#preset-label');
      const presets = (brand.presets || []).filter((p) => p);
      presetLabel.style.display = presets.length ? 'block' : 'none';
      presetRow.innerHTML = '';
      presets.forEach((preset) => {
        const btn = document.createElement('button');
        btn.className = 'preset-btn';
        btn.textContent = preset;
        btn.addEventListener('click', () => {
          const pi = $('#prompt-input');
          pi.value = preset;
          pi.focus();
        });
        presetRow.appendChild(btn);
      });
    }

    async function callAPI(brandId, user) {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId: brandId || null, prompt: user, model: currentModel, devToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'API error');
      return { text: data.text, model: data.model, tokens: data.tokens };
    }

    const onRun = async () => {
      const prompt = promptInput.value.trim();
      if (!prompt) return;
      runBtn.disabled = true;
      genericOut.innerHTML = loadingHTML();
      guidedOut.innerHTML = loadingHTML();
      $('#generic-meta-head').textContent = '';
      $('#guided-meta-head').textContent = '';
      try {
        const [generic, guided] = await Promise.all([
          callAPI(null, prompt),
          callAPI(currentBrandId, prompt),
        ]);
        genericOut.textContent = generic.text;
        guidedOut.textContent = guided.text;
        $('#generic-meta-head').textContent = generic.model
          ? `${formatModel(generic.model)}${generic.tokens ? ` · ${generic.tokens} tokens` : ''}`
          : '';
        $('#guided-meta-head').textContent = guided.model
          ? `${formatModel(guided.model)}${guided.tokens ? ` · ${guided.tokens} tokens` : ''}`
          : '';
      } catch (e) {
        genericOut.textContent = `Error: ${e.message}`;
        guidedOut.textContent = `Error: ${e.message}`;
      }
      runBtn.disabled = false;
    };
    runBtn.addEventListener('click', onRun);

    loadSettings();

    return () => {
      runBtn.removeEventListener('click', onRun);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <style>{`
        #personified-ai-page {
          --pai-primary: #8F5BDE;
          --pai-primary-light: #DFC2F2;
          --pai-secondary-light: #97EFE9;
          --pai-secondary: #17D9DA;
          --pai-bg: #0a0a0a;
          --pai-bg-card: #ffffff;
          --pai-bg-raised: #f0f0f0;
          --pai-text: #ffffff;
          --pai-text-sec: #ffffff;
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
          font-size: 15px;
          line-height: 1.6;
          color: var(--pai-text);
        }
        #personified-ai-page .loading { display: flex; gap: 6px; align-items: center; padding-top: 4px; }
        #personified-ai-page .loading span {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--pai-primary);
          animation: pai-pulse 1.2s ease-in-out infinite;
        }
        #personified-ai-page .loading span:nth-child(2) { animation-delay: 0.2s; background: var(--pai-primary-light); }
        #personified-ai-page .loading span:nth-child(3) { animation-delay: 0.4s; background: var(--pai-secondary-light); }
        @keyframes pai-pulse { 0%,80%,100%{transform:scale(0.5);opacity:0.3} 40%{transform:scale(1);opacity:1} }

        /* INTRO */
        #personified-ai-page .intro {
          max-width: 980px; margin: 0 auto; padding: 4rem 2rem 1rem; text-align: center;
        }
        #personified-ai-page .intro h1 {
          font-family: var(--pai-font-title);
          font-size: clamp(20px, 3.5vw, 32px);
          font-weight: 500; line-height: 1.3; margin-bottom: 0.75rem;
        }
        #personified-ai-page .intro h1 .grad { color: var(--pai-secondary); }
        #personified-ai-page .intro p {
          font-size: 15px; color: var(--pai-text-sec); font-weight: 300;
          max-width: 680px; margin: 0 auto; line-height: 1.7;
        }

        /* DEMO */
        #personified-ai-page .demo {
          max-width: 980px; margin: 0 auto; padding: 2.5rem 2rem 5rem;
        }

        /* PERSONAS */
        #personified-ai-page .persona-card {
          background: #121212;
          border: 1px solid var(--pai-border);
          border-radius: var(--pai-radius);
          margin-bottom: 1.25rem;
          overflow: hidden;
        }
        #personified-ai-page .persona-row {
          display: flex; gap: 8px; flex-wrap: wrap; align-items: center; padding: 14px 16px;
        }
        #personified-ai-page .persona-label {
          font-size: 12px; color: var(--pai-text-sec); margin-right: 4px;
        }
        #personified-ai-page .persona-btn {
          font-family: var(--pai-font-body);
          font-size: 12px; padding: 6px 15px; border-radius: 100px;
          border: 1px solid var(--pai-secondary);
          background: transparent; color: var(--pai-secondary);
          cursor: pointer; transition: all 0.15s;
        }
        #personified-ai-page .persona-btn:hover { background: var(--pai-secondary); color: var(--pai-bg); }
        #personified-ai-page .persona-btn.active { background: var(--pai-secondary); color: var(--pai-bg); }
        #personified-ai-page .persona-desc {
          border-top: 1px solid var(--pai-border);
          padding: 14px 18px; font-size: 13px;
          color: rgba(255,255,255,0.55); font-weight: 300; line-height: 1.7;
          height: calc(5 * 1.7 * 13px + 28px); overflow-y: auto; white-space: pre-wrap;
        }

        /* PRESETS */
        #personified-ai-page .preset-label {
          font-family: var(--pai-font-body); font-size: 12px;
          color: var(--pai-text); opacity: 0.8; margin-bottom: 0.6rem;
        }
        #personified-ai-page .preset-row {
          display: flex; flex-direction: column; align-items: flex-start;
          gap: 8px; margin-bottom: 1.25rem;
        }
        #personified-ai-page .preset-btn {
          font-family: var(--pai-font-body); font-size: 12px;
          padding: 6px 14px; border-radius: 100px;
          border: 1px solid var(--pai-primary-light);
          background: transparent; color: var(--pai-primary-light);
          cursor: pointer; transition: all 0.15s;
        }
        #personified-ai-page .preset-btn:hover { background: var(--pai-primary-light); color: var(--pai-bg); }

        /* PROMPT */
        #personified-ai-page .prompt-row {
          display: flex; gap: 12px; margin-bottom: 1.5rem;
        }
        #personified-ai-page .prompt-row textarea {
          flex: 1; font-family: var(--pai-font-body); font-size: 14px; line-height: 1.65;
          padding: 14px 16px; border: 1px solid var(--pai-border-card-mid);
          border-radius: var(--pai-radius); background: var(--pai-bg-card);
          color: var(--pai-text-card); resize: none; min-height: 88px;
          transition: border-color 0.15s; font-weight: 300;
        }
        #personified-ai-page .prompt-row textarea:focus { outline: none; border-color: var(--pai-primary); }
        #personified-ai-page .prompt-row textarea::placeholder { color: var(--pai-text-card-sec); opacity: 0.6; }

        /* RUN BUTTON – matched to tall-e primary CTA */
        #personified-ai-page .run-btn {
          align-self: flex-end;
          display: inline-flex; align-items: center;
          padding: 12px 28px;
          background: #8F5BDE; color: #fff;
          border: none; border-radius: 9999px;
          font-family: var(--pai-font-body); font-size: 14px; font-weight: 500;
          cursor: pointer; white-space: nowrap;
          text-shadow: 0 1px 3px rgba(0,0,0,0.45);
          transition: all 0.3s;
        }
        #personified-ai-page .run-btn:hover {
          background: rgba(143,91,222,0.9);
          box-shadow: 0 8px 24px rgba(143,91,222,0.25);
        }
        #personified-ai-page .run-btn:disabled { opacity: 0.35; cursor: not-allowed; box-shadow: none; }

        /* OUTPUT */
        #personified-ai-page .output-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
        }
        @media (max-width: 640px) {
          #personified-ai-page .output-grid { grid-template-columns: 1fr; }
        }
        #personified-ai-page .output-col {
          border-radius: var(--pai-radius);
          border: 1px solid var(--pai-border-card);
          overflow: hidden;
          background: var(--pai-bg-card);
        }
        #personified-ai-page .col-guided {
          border-color: rgba(23,217,218,0.7);
          box-shadow: 0 0 28px rgba(23,217,218,0.2), 0 0 6px rgba(23,217,218,0.15);
        }
        #personified-ai-page .output-col-head {
          padding: 10px 16px; display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid var(--pai-border-card); background: var(--pai-bg-raised);
        }
        #personified-ai-page .col-guided .output-col-head { border-bottom-color: rgba(151,239,233,0.15); }
        #personified-ai-page .col-head-label {
          font-family: var(--pai-font-title); font-size: 9px; font-weight: 400;
          text-transform: none; letter-spacing: 0.06em; color: var(--pai-text-card-sec);
        }
        #personified-ai-page .col-guided .col-head-label { color: #007a7b; }
        #personified-ai-page .col-head-meta {
          font-family: var(--pai-font-body); font-size: 10px;
          color: var(--pai-text-card-sec); opacity: 0.7; font-weight: 300;
        }
        #personified-ai-page .output-body {
          padding: 18px 20px; min-height: 160px; font-size: 14px; line-height: 1.8;
          color: var(--pai-text-card); white-space: pre-wrap; font-weight: 300;
        }
        #personified-ai-page .output-placeholder {
          color: var(--pai-text-card-sec); font-size: 13px; font-style: italic; opacity: 0.5;
        }
      `}</style>

      <main id="personified-ai-page">
        <div className="intro">
          <h1>
            Generic AI vs. <span className="grad">personified AI</span>
          </h1>
          <p>
            GenAI chatbots are amazing.
            <br />
            But if you give them personality – they can do so much more, for less.
          </p>
        </div>

        <section className="demo">
          <div className="persona-card">
            <div className="persona-row">
              <span className="persona-label">Pick a persona:</span>
            </div>
            <div className="persona-desc" id="brand-desc"></div>
          </div>
          <p className="preset-label" id="preset-label" style={{ display: 'none' }}>
            Try one of these:
          </p>
          <div className="preset-row" id="preset-row"></div>

          <div className="prompt-row">
            <textarea
              id="prompt-input"
              placeholder="Or type in what's on your mind…"
              aria-label="Enter your prompt"
            ></textarea>
            <button className="run-btn" id="run-btn">Go</button>
          </div>

          <div className="output-grid">
            <div className="output-col col-generic">
              <div className="output-col-head">
                <span className="col-head-label">Generic AI</span>
                <span className="col-head-meta" id="generic-meta-head"></span>
              </div>
              <div className="output-body" id="generic-out">
                <span className="output-placeholder">Generic AI output will appear here</span>
              </div>
            </div>
            <div className="output-col col-guided">
              <div className="output-col-head">
                <span className="col-head-label">Personified AI</span>
                <span className="col-head-meta" id="guided-meta-head"></span>
              </div>
              <div className="output-body" id="guided-out">
                <span className="output-placeholder">Crafted, personified AI output will appear here</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
