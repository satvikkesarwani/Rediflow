import { useState, useEffect, useRef } from 'react';
import { parseCommand, prefLabel } from '../data/assistant';
import { Sparkles, X, Mic, Send, Check, Smartphone, Ticket, ArrowRight } from 'lucide-react';

const SUGGESTIONS = [
  'Book the fastest route to Airport Road and pay from my NCMC wallet',
  'Cheapest route to Tech Park',
  'Book a ticket to Shopping Mall, pay by UPI',
  'Safest way to University Campus',
];

const STEPS = [
  { key: 'route', label: 'Route selected' },
  { key: 'booking', label: 'Booking created' },
  { key: 'payment', label: 'Payment processed' },
  { key: 'pass', label: 'Pass generated' },
];

const PAY_LABEL = { wallet: 'NCMC wallet', upi: 'UPI', card: 'card' };

function speak(text) {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.05; u.pitch = 1; u.lang = 'en-IN';
    synth.speak(u);
  } catch { /* ignore */ }
}

export function VoiceAssistant({ open, onClose, onPlan, onBook, onOpenPass }) {
  const [messages, setMessages] = useState([
    { who: 'bot', text: 'Hi! I\'m your RideFlow Assistant. Try: "Book the fastest route to Airport Road and pay from my NCMC wallet."' },
  ]);
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [pipeline, setPipeline] = useState(null);
  const recRef = useRef(null);
  const feedRef = useRef(null);
  const handleRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }
    const rec = new SR();
    rec.lang = 'en-IN';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => { setListening(false); if (handleRef.current) handleRef.current(e.results[0][0].transcript); };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recRef.current = rec;
    return () => { try { rec.abort(); } catch { /* ignore */ } };
  }, []);

  useEffect(() => { if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight; }, [messages, pipeline]);
  useEffect(() => { if (!open) { try { window.speechSynthesis?.cancel(); } catch { /* ignore */ } } }, [open]);

  const push = (who, text) => setMessages((m) => [...m, { who, text }]);

  const startBooking = (cmd) => {
    const origin = cmd.source || 'Central Railway Station';
    const reply = `Booking the ${prefLabel(cmd.prefId)} route from ${origin} to ${cmd.destination}, paying via ${PAY_LABEL[cmd.payment]}. One moment…`;
    push('bot', reply); speak(reply);

    const params = { source: cmd.source, destination: cmd.destination, prefId: cmd.prefId, payment: cmd.payment };
    setPipeline({ params, steps: { route: {}, booking: {}, payment: {}, pass: {} }, done: false, error: null });

    const onProgress = (key, status, data) =>
      setPipeline((p) => (p ? { ...p, steps: { ...p.steps, [key]: { status, detail: data?.detail, method: data?.method } } } : p));

    onBook({ ...params, onProgress })
      .then((res) => {
        setPipeline((p) => (p ? { ...p, done: true, passId: res.passId } : p));
        const ok = `All set! Your journey pass ${res.passId} is ready. Tap to start your journey.`;
        push('bot', ok); speak('All set! Your journey pass is ready.');
      })
      .catch((err) => {
        if (err?.reason === 'lowbalance') {
          setPipeline((p) => (p ? { ...p, error: 'lowbalance', fare: err.fare } : p));
          const msg = `Your NCMC wallet is short for this ₹${err.fare} trip. Tap "Pay by UPI instead" to finish.`;
          push('bot', msg); speak('Your wallet balance is low. You can pay by UPI instead.');
        } else if (err?.reason === 'same') {
          setPipeline(null);
          push('bot', 'Origin and destination look the same — where would you like to go?');
        } else {
          setPipeline(null);
          push('bot', 'Sorry, I couldn\'t complete that booking. Please try again.');
        }
      });
  };

  const retryUpi = () => {
    const p = pipeline?.params;
    if (!p) return;
    setPipeline(null);
    startBooking({ ...p, payment: 'upi' });
  };

  const handle = (text) => {
    if (!text || !text.trim()) return;
    push('user', text);
    const cmd = parseCommand(text);
    if (!cmd.destination) {
      const reply = 'I didn\'t catch a destination. Name a stop — like Tech Park, Airport Road, or Shopping Mall.';
      push('bot', reply); speak(reply);
      return;
    }
    if (cmd.intent === 'book') { startBooking(cmd); return; }
    const origin = cmd.source || 'Central Railway Station';
    const reply = `Planning the ${prefLabel(cmd.prefId)} route from ${origin} to ${cmd.destination}${cmd.safeMode ? ', safe mode on' : ''}. Showing your options.`;
    push('bot', reply); speak(reply);
    setTimeout(() => onPlan({ source: cmd.source, destination: cmd.destination, prefId: cmd.prefId, safeMode: cmd.safeMode }), 700);
  };
  // Keep handleRef always pointing at the latest handle closure so the speech
  // recognition onresult callback (set up once) never holds a stale reference.
  handleRef.current = handle;

  const toggleMic = () => {
    if (!recRef.current) return;
    if (listening) { try { recRef.current.stop(); } catch { /* ignore */ } setListening(false); return; }
    try { recRef.current.start(); setListening(true); } catch { /* ignore */ }
  };

  const submit = () => { const t = input; setInput(''); handle(t); };

  if (!open) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 2000, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.45)', animation: 'fadeIn 0.2s ease' }} />

      <div className="animate-fade-in-up" style={{ position: 'relative', background: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '86%', display: 'flex', flexDirection: 'column', boxShadow: '0 -10px 40px rgba(0,0,0,0.25)' }}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#008B74,#10B981)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0F172A' }}>RideFlow Assistant</div>
              <div style={{ fontSize: 11, color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} /> Voice + AI · online
              </div>
            </div>
          </div>
          <button className="btn-tap" onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={18} color="#475569" />
          </button>
        </div>

        {/* feed */}
        <div ref={feedRef} style={{ flex: 1, overflowY: 'auto', padding: '8px 20px', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 200 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ alignSelf: m.who === 'user' ? 'flex-end' : 'flex-start', maxWidth: '82%' }}>
              <div style={{
                padding: '10px 14px', borderRadius: 16, fontSize: 14, lineHeight: 1.5,
                background: m.who === 'user' ? 'var(--primary)' : '#F1F5F9',
                color: m.who === 'user' ? 'white' : '#0F172A',
                borderBottomRightRadius: m.who === 'user' ? 4 : 16,
                borderBottomLeftRadius: m.who === 'user' ? 16 : 4,
              }}>{m.text}</div>
            </div>
          ))}

          {pipeline && <Pipeline pipeline={pipeline} onOpenPass={onOpenPass} onRetryUpi={retryUpi} />}

          {listening && (
            <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8, color: '#059669', fontSize: 13, fontWeight: 600, padding: '4px 6px' }}>
              <span className="animate-bounce-gentle"><Mic size={16} /></span> Listening…
            </div>
          )}
        </div>

        {/* suggestions */}
        {!pipeline && (
          <div style={{ display: 'flex', gap: 8, padding: '8px 20px', overflowX: 'auto' }}>
            {SUGGESTIONS.map((s) => (
              <button key={s} className="btn-tap" onClick={() => handle(s)} style={{ flexShrink: 0, background: '#F0FDF9', border: '1px solid #A7F3D0', color: '#065F46', borderRadius: 16, padding: '7px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* input row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px 22px' }}>
          <button className="btn-tap" onClick={toggleMic} disabled={!supported} aria-label={listening ? 'Stop listening' : 'Start voice input'} title={supported ? 'Tap to speak' : 'Voice not supported — type instead'}
            style={{ width: 52, height: 52, borderRadius: '50%', flexShrink: 0, cursor: supported ? 'pointer' : 'not-allowed', border: 'none', color: 'white', background: listening ? 'linear-gradient(135deg,#EF4444,#F97316)' : 'linear-gradient(135deg,#008B74,#10B981)', boxShadow: listening ? '0 0 0 6px rgba(239,68,68,0.2)' : '0 4px 14px rgba(0,139,116,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: listening ? 'pulse 1.2s ease infinite' : 'none' }}>
            <Mic size={22} />
          </button>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#F1F5F9', borderRadius: 24, padding: '4px 4px 4px 16px' }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
              placeholder={supported ? 'Speak or type a command…' : 'Type a command…'}
              style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 14, color: '#0F172A' }} />
            <button className="btn-tap" onClick={submit} disabled={!input.trim()} style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', background: input.trim() ? 'var(--primary)' : '#CBD5E1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() ? 'pointer' : 'default', flexShrink: 0 }}>
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Pipeline({ pipeline, onOpenPass, onRetryUpi }) {
  return (
    <div className="animate-fade-in" style={{ alignSelf: 'stretch', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 16, padding: '16px 18px', marginTop: 4 }}>
      {STEPS.map((s, i) => {
        const st = pipeline.steps[s.key] || {};
        const status = st.status || 'pending';
        const last = i === STEPS.length - 1;
        const lineDone = status === 'done';
        return (
          <div key={s.key} style={{ display: 'flex', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <StepCircle status={status} />
              {!last && <div style={{ width: 2, flex: 1, minHeight: 22, background: lineDone ? '#10B981' : '#E2E8F0', transition: 'background 0.3s' }} />}
            </div>
            <div style={{ paddingBottom: last ? 0 : 14, flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: status === 'pending' ? 500 : 700, color: status === 'pending' ? '#94A3B8' : status === 'error' ? '#DC2626' : '#0F172A' }}>
                {s.key === 'payment' && status === 'active' && st.method ? `Paying via ${PAY_LABEL[st.method]}…` : s.label}
              </div>
              {st.detail && <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{st.detail}</div>}
              {s.key === 'payment' && status === 'error' && <div style={{ fontSize: 12, color: '#DC2626', marginTop: 2, fontWeight: 600 }}>Wallet balance too low</div>}
            </div>
          </div>
        );
      })}

      {pipeline.done && (
        <button className="btn-tap btn-primary" onClick={onOpenPass} style={{ marginTop: 14, borderRadius: 14, padding: '13px', fontSize: 15 }}>
          <Ticket size={18} /> Open Pass &amp; Start Journey <ArrowRight size={16} />
        </button>
      )}
      {pipeline.error === 'lowbalance' && (
        <button className="btn-tap" onClick={onRetryUpi} style={{ marginTop: 14, width: '100%', borderRadius: 14, padding: '13px', fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#4338CA,#6366F1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Smartphone size={18} /> Pay by UPI instead
        </button>
      )}
    </div>
  );
}

function StepCircle({ status }) {
  if (status === 'done') {
    return <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Check size={15} color="white" strokeWidth={3} /></div>;
  }
  if (status === 'error') {
    return <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><X size={15} color="white" strokeWidth={3} /></div>;
  }
  if (status === 'active') {
    return <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'white', border: '2px solid #10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><div className="spinner" style={{ width: 13, height: 13, borderColor: 'rgba(16,185,129,0.25)', borderTopColor: '#10B981' }} /></div>;
  }
  return <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'white', border: '2px solid #CBD5E1', flexShrink: 0 }} />;
}
