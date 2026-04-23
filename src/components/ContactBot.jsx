import { useState, useRef, useEffect } from 'react';
import { Mail, Linkedin } from 'lucide-react';

const STEPS = [
  { key: 'name',    prompt: 'You can also leave me a message with me!\nWhat\'s your name?', type: 'input' },
  { key: 'email',   prompt: 'Where can I email you?',    type: 'input', inputType: 'email' },
  { key: 'message', prompt: 'What can I help you with?', type: 'textarea' },
];

const T = {
  purple: '#8F5BDE',
  turquoise: '#17D9DA',
  card: '#121212',
  border: '#292929',
  body: "'Oxanium', sans-serif",
  display: "'Orbitron', sans-serif",
};

function validEmail(s) {
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/.test((s || '').trim());
}

function getError(key, value) {
  if (key === 'name' && !value.trim()) return "Because I hate getting \"Hi [firstname] [lastname],\" emails";
  if (key === 'email') {
    if (!value.trim()) return "Because messenger pigeons should roam free on Dam Square";
    if (!validEmail(value)) return "mmm... This doesn't look like an email";
  }
  if (key === 'message') {
    if (value.trim().length < 5) return "I'm all about words, please share a few more";
    if (value.length > 2000) return "That is a lot of information! Give me the gist and we'll talk about the details later";
  }
  return null;
}

function BubbleBot({ children }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', animation: 'bubbleIn 280ms cubic-bezier(0.16,1,0.3,1)' }}>
      <img
        src="/favicon.png"
        alt=""
        style={{ width: 30, height: 30, flexShrink: 0, objectFit: 'contain', marginBottom: 2, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.3))' }}
      />
      <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#fff', padding: '11px 15px', borderRadius: '16px 16px 16px 4px', fontFamily: T.body, fontSize: 15, lineHeight: 1.5, fontWeight: 500, whiteSpace: 'pre-line' }}>
        {children}
      </div>
    </div>
  );
}

function BubbleUser({ children }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', animation: 'bubbleIn 280ms cubic-bezier(0.16,1,0.3,1)' }}>
      <div style={{ background: 'rgba(143,91,222,0.2)', border: '1px solid rgba(143,91,222,0.4)', color: '#fff', padding: '11px 15px', borderRadius: '16px 16px 4px 16px', maxWidth: 420, fontFamily: T.body, fontSize: 15, lineHeight: 1.5, fontWeight: 600 }}>
        {children}
      </div>
    </div>
  );
}

function ContactTile({ icon, label, value, href, tint, bg, hoverBorder }) {
  const [hov, setHov] = useState(false);
  return (
    <a href={href} target={href.startsWith('mailto') ? undefined : '_blank'} rel="noreferrer"
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, borderRadius: 12, background: T.card, border: `1px solid ${hov ? hoverBorder : T.border}`, textDecoration: 'none', transition: 'border-color 300ms' }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: hov ? bg.replace('0.10', '0.20') : bg, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 300ms', flexShrink: 0 }}>
        {icon === 'mail'
          ? <Mail size={18} color={tint} />
          : <Linkedin size={18} color={tint} />}
      </div>
      <div>
        <div style={{ fontFamily: T.body, fontSize: 12, color: '#8c8c8c', marginBottom: 2 }}>{label}</div>
        <div style={{ fontFamily: T.body, fontSize: 14, color: '#fff', fontWeight: 500 }}>{value}</div>
      </div>
    </a>
  );
}

function SuccessState({ name }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '32px 16px', animation: 'bubbleIn 400ms cubic-bezier(0.16,1,0.3,1)' }}>
      <style>{`
        @keyframes sparkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50%       { opacity: 1;   transform: scale(1.2); }
        }
      `}</style>
      <div style={{ position: 'relative', width: 120, height: 120 }}>
        <img src="/favicon.png" alt="Tall-e"
          style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 8px 24px rgba(23,217,218,0.25))' }} />
        <div style={{ position: 'absolute', top: '10%', left: '5%', color: T.turquoise, animation: 'sparkle 1.4s ease-in-out infinite' }}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/></svg>
        </div>
        <div style={{ position: 'absolute', top: '25%', right: '2%', color: T.turquoise, animation: 'sparkle 1.7s 0.3s ease-in-out infinite' }}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="9" height="9"><path d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/></svg>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: T.display, fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 8px', letterSpacing: '0.02em' }}>
          Thanks{name ? ` ${name}` : ''}!
        </p>
        <p style={{ fontFamily: T.body, fontSize: 14, color: '#8c8c8c', margin: 0, lineHeight: 1.6 }}>
          I'll get back to you in 2 working days
        </p>
      </div>
    </div>
  );
}

export default function ContactBot() {
  const [data, setData] = useState({ name: '', email: '', message: '' });
  const [stepIdx, setStepIdx] = useState(0);
  const [touched, setTouched] = useState({});
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(false);

  const step = STEPS[stepIdx];
  const currentValue = step ? data[step.key] : '';
  const hasTyped = currentValue.length > 0;
  const currentError = touched[step?.key] ? getError(step?.key, currentValue) : null;
  const canAdvance = step ? !getError(step.key, currentValue) : false;

  const set = (key) => (val) => setData(d => ({ ...d, [key]: val }));

  const advance = async () => {
    if (!canAdvance) {
      setTouched(t => ({ ...t, [step.key]: true }));
      return;
    }
    if (stepIdx < STEPS.length - 1) {
      setStepIdx(s => s + 1);
    } else {
      setSending(true);
      setSendError(false);
      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('failed');
        setDone(true);
      } catch {
        setSendError(true);
      } finally {
        setSending(false);
      }
    }
  };

  const onKeyDown = (e, multiline) => {
    if (e.key === 'Enter' && (!multiline || e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      advance();
    }
  };

  const inputStyle = (error) => ({
    width: '100%',
    boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.08)',
    border: `1px solid ${error ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.2)'}`,
    color: '#fff',
    padding: '13px 15px',
    borderRadius: '16px 16px 4px 16px',
    fontFamily: T.body,
    fontSize: 15,
    fontWeight: 500,
    outline: 'none',
    resize: 'vertical',
    lineHeight: 1.5,
    caretColor: '#fff',
  });

  return (
    <section id="contact" style={{ background: 'hsl(264 66% 61%)', padding: '96px 0' }}>
      <style>{`
        @keyframes bubbleIn {
          0%   { opacity: 0; transform: translateY(5px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        #contact-chat-input::placeholder { color: rgba(255,255,255,0.35); }
        @media (max-width: 820px) {
          #contact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '0 32px' }}>
        <div style={{ marginBottom: 56, maxWidth: 640 }}>
          <h2 style={{ fontFamily: T.display, fontSize: 'clamp(1.875rem, 4vw, 2.25rem)', fontWeight: 700, color: '#fff', margin: '0 0 12px', lineHeight: 1.1 }}>
            Talk to me
          </h2>
          <p style={{ fontFamily: T.body, color: 'rgba(255,255,255,0.92)', fontSize: 16, lineHeight: 1.55, margin: 0, fontWeight: 500 }}>
            Let's build a great experience together:
          </p>
        </div>

        <div id="contact-grid" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 48, alignItems: 'start' }}>
          {/* Tiles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <ContactTile icon="mail" tint={T.purple} hoverBorder="rgba(143,91,222,0.5)" label="Email" value="info@tall-e.nl" href="mailto:info@tall-e.nl" bg="rgba(143,91,222,0.10)" />
            <ContactTile icon="linkedin" tint={T.turquoise} hoverBorder="rgba(23,217,218,0.5)" label="LinkedIn" value="Tally Brostowsky" href="https://www.linkedin.com/in/tally-brostowsky/" bg="rgba(23,217,218,0.10)" />
            <div style={{ marginTop: 12, color: 'rgba(255,255,255,0.45)', fontFamily: T.body, fontSize: 12, lineHeight: 1.7 }}>
              <div>KVK: 42029043</div>
              <div>BTW: NL005441756B54</div>
            </div>
          </div>

          {/* Chat frame — grows with content */}
          <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '24px', background: '#111' }}>
            {!done ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Previous Q&As */}
                {STEPS.slice(0, stepIdx).map(s => (
                  <div key={s.key} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <BubbleBot>{s.prompt}</BubbleBot>
                    <BubbleUser>{data[s.key]}</BubbleUser>
                  </div>
                ))}

                {/* Current question */}
                <BubbleBot>{step.prompt}</BubbleBot>

                {/* Input */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ width: '100%', maxWidth: 480 }}>
                    {step.type === 'textarea' ? (
                      <textarea
                        id="contact-chat-input"
                        value={currentValue}
                        autoFocus
                        rows={4}
                        onChange={e => set(step.key)(e.target.value)}
                        onBlur={() => {}}
                        onKeyDown={e => onKeyDown(e, true)}
                        placeholder="Press 'Send' when you are ready"
                        style={inputStyle(currentError)}
                      />
                    ) : (
                      <input
                        id="contact-chat-input"
                        type={step.inputType || 'text'}
                        value={currentValue}
                        autoFocus
                        onChange={e => set(step.key)(e.target.value)}
                        onBlur={() => {}}
                        onKeyDown={e => onKeyDown(e, false)}
                        placeholder="Press enter or 'Next' when you're done"
                        style={inputStyle(currentError)}
                      />
                    )}
                    {currentError && (
                      <div style={{ fontFamily: T.body, fontSize: 12, color: 'rgba(239,130,130,0.9)', fontWeight: 500, marginTop: 6 }}>{currentError}</div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                      <button type="button" onClick={() => stepIdx > 0 && setStepIdx(s => s - 1)} disabled={stepIdx === 0}
                        style={{ fontFamily: T.body, fontSize: 12, fontWeight: 600, background: 'transparent', border: 'none', color: stepIdx === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)', cursor: stepIdx === 0 ? 'default' : 'pointer', padding: 0 }}>
                        ← Back
                      </button>
                      <button type="button" onClick={advance} disabled={!canAdvance || sending}
                        style={{ fontFamily: T.display, fontSize: 12, fontWeight: 700, letterSpacing: '0.02em', padding: '10px 24px', borderRadius: 999, background: canAdvance && !sending ? T.purple : 'rgba(143,91,222,0.3)', border: 'none', color: '#fff', cursor: canAdvance && !sending ? 'pointer' : 'not-allowed', transition: 'background 200ms' }}>
                        {sending ? '...' : stepIdx === STEPS.length - 1 ? 'Send' : 'Next'}
                      </button>
                    </div>
                    {sendError && (
                      <p style={{ fontFamily: T.body, fontSize: 13, color: 'rgba(239,130,130,0.9)', marginTop: 8, textAlign: 'right' }}>
                        Oh no! Can't send your message. Try email:{' '}
                        <a href="mailto:info@tall-e.nl" style={{ color: 'rgba(239,130,130,0.9)', textDecoration: 'underline' }}>info@tall-e.nl</a>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <SuccessState name={data.name} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
