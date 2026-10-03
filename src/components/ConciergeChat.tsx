import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  X, Send, Phone, CalendarDays, Sparkles, RotateCcw, Check, ShieldCheck,
} from 'lucide-react';
import { BUSINESS_INFO } from '../data/mockData';

/**
 * Concierge chat widget.
 *
 * Mounted OUTSIDE <App /> (see main.tsx) as a fixed-position sibling overlay, so
 * the landing page source stays byte-identical to the AI Studio original. It also
 * intercepts #hero-advisor-cta at the capture phase to route "Speak to an Advisor"
 * into the qualifying conversation instead of the static modal — again without
 * editing any landing-page component.
 */

const ENDPOINT =
  (import.meta.env.VITE_LH_CONCIERGE_URL as string | undefined) ??
  'https://ed8wqysd.function2.insforge.app/lh-concierge';

const ADVISOR = { name: 'Aisha', title: 'Property Advisor' };

type Action = {
  type: string;
  label: string;
  value?: string;
  url?: string;
  propertyId?: string | null;
  propertyTitle?: string | null;
  date?: string;
};

type Card = Record<string, any>;

type Message = {
  id: number;
  role: 'user' | 'bot';
  text: string;
  actions?: Action[];
  cards?: Card[];
  summary?: string | null;
  booked?: boolean;
};

type Booking = {
  propertyId: string;
  propertyTitle: string;
  date: string;
  window: string;
};

const FALLBACK_QUICK = [
  'Show me houses for sale',
  "Anything to rent?",
  'What services do you offer?',
  'How is the Uyo property market?',
  'How do you verify a title?',
];

const waLink = (text: string) =>
  `https://wa.me/${BUSINESS_INFO.whatsappClean}?text=${encodeURIComponent(text)}`;

const getSessionId = () => {
  const key = 'lh_concierge_session';
  try {
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const fresh = `web-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(key, fresh);
    return fresh;
  } catch {
    return `web-${Date.now().toString(36)}`;
  }
};

const field = (card: Card, keys: string[]) => {
  for (const k of keys) {
    const v = card?.[k];
    if (v !== undefined && v !== null && v !== '') return String(v);
  }
  return '';
};

/** Cards carry price_raw as a plain integer plus a currency code. */
const formatPrice = (card: Card) => {
  const raw = field(card, ['price_text', 'price', 'price_raw']);
  if (!raw) return '';
  const numeric = Number(raw.replace(/[^\d.]/g, ''));
  if (!Number.isFinite(numeric) || numeric <= 0) return raw;
  const symbol = card.currency === 'NGN' || !card.currency ? '₦' : `${card.currency} `;
  if (numeric >= 1_000_000_000) return `${symbol}${(numeric / 1_000_000_000).toFixed(2).replace(/\.?0+$/, '')}B`;
  if (numeric >= 1_000_000) return `${symbol}${(numeric / 1_000_000).toFixed(numeric % 1_000_000 === 0 ? 0 : 1)}M`;
  if (numeric >= 1_000) return `${symbol}${Math.round(numeric / 1_000)}K`;
  return `${symbol}${numeric}`;
};

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function ConciergeChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState<string>('browse');
  const [progress, setProgress] = useState<{ answered: number; total: number } | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [bookBusy, setBookBusy] = useState(false);
  const sessionId = useRef<string>(getSessionId());
  const scrollRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  const lastCards = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].cards?.length) return messages[i].cards!;
    }
    return [];
  }, [messages]);

  const scrollToEnd = useCallback(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(scrollToEnd, 40);
    return () => clearTimeout(t);
  }, [open, messages, booking, scrollToEnd]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const applyResponse = (data: any) => {
    setMessages((m) => [
      ...m,
      {
        id: nextId.current++,
        role: 'bot',
        text: data.reply ?? "I couldn't load that just now.",
        actions: Array.isArray(data.actions) ? data.actions : [],
        cards: Array.isArray(data.cards) ? data.cards : [],
        summary: data.summary ?? null,
      },
    ]);
    if (data.stage) setStage(data.stage);
    if (data.progress) setProgress(data.progress);
  };

  /** Ask the API for the opening line instead of faking a "hello" from the visitor. */
  const beginConversation = useCallback(
    async (mode: 'advisor' | 'browse') => {
      setOpen(true);
      if (messages.length) return;
      setBusy(true);
      try {
        const res = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'chat', sessionId: sessionId.current, mode }),
        });
        if (!res.ok) throw new Error(String(res.status));
        applyResponse(await res.json());
      } catch {
        setMessages([
          {
            id: nextId.current++,
            role: 'bot',
            text:
              mode === 'advisor'
                ? `Hi, I'm ${ADVISOR.name}, a property advisor with LandsandHousing. I'm having trouble connecting right now — you can reach the team directly on WhatsApp, or try me again in a moment.`
                : `Hi, I'm ${ADVISOR.name} 👋 I'm having trouble connecting right now — try again in a moment, or reach us on WhatsApp.`,
            actions: [{ type: 'whatsapp', label: 'Message an advisor', url: waLink('Hello LandsandHousing,') }],
          },
        ]);
      } finally {
        setBusy(false);
      }
    },
    [messages.length],
  );

  // Every "Speak With an Advisor" button on the page opens the concierge — there is
  // no floating launcher. Matched on the visible label rather than a hardcoded id so
  // the nav, hero, owner, footer and mobile-drawer buttons all route here, and the
  // static modals never open. Capture phase + preventDefault beats React's handlers.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const el = target?.closest?.<HTMLElement>('a, button, [role="button"]');
      if (!el) return;
      if (!/speak\s*(with|to)\s*(an?\s*)?advisor/i.test(el.textContent ?? '')) return;
      e.preventDefault();
      e.stopPropagation();
      void beginConversation('advisor');
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [beginConversation]);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || busy) return;

      setInput('');
      setMessages((m) => [...m, { id: nextId.current++, role: 'user', text }]);
      setBusy(true);

      try {
        const res = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'chat', sessionId: sessionId.current, message: text }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        applyResponse(await res.json());
      } catch {
        setMessages((m) => [
          ...m,
          {
            id: nextId.current++,
            role: 'bot',
            text: "I lost connection for a moment. Try again, or reach an advisor directly on WhatsApp.",
            actions: [{ type: 'whatsapp', label: 'Message an advisor', url: waLink('Hello LandsandHousing,') }],
          },
        ]);
      } finally {
        setBusy(false);
      }
    },
    [busy],
  );

  const restart = () => {
    sessionId.current = `web-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    nextId.current = 1;
    setMessages([]);
    setStage('browse');
    setProgress(null);
    setBooking(null);
    setInput('');
    void beginConversation('browse');
  };

  const startBooking = (a?: Action) => {
    const c = lastCards[0];
    setBooking({
      propertyId: a?.propertyId ?? field(c ?? {}, ['id']) ?? '',
      propertyTitle: a?.propertyTitle ?? field(c ?? {}, ['title']) ?? '',
      date: a?.date ?? '',
      window: 'morning',
    });
  };

  const confirmBooking = async () => {
    if (!booking?.date) return;
    setBookBusy(true);
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'book',
          sessionId: sessionId.current,
          propertyId: booking.propertyId || null,
          propertyTitle: booking.propertyTitle || null,
          date: booking.date,
          window: booking.window,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data?.error ?? 'booking failed');

      setMessages((m) => [
        ...m,
        {
          id: nextId.current++,
          role: 'bot',
          text:
            `You're booked, and our advisor has everything already — so there's nothing to repeat. ` +
            `${ADVISOR.name} will confirm the exact time shortly. Anything else you'd like to know in the meantime?`,
          summary: data.summary ?? null,
          booked: true,
          actions: [{ type: 'whatsapp', label: 'Message the team', url: data.whatsapp }],
        },
      ]);
      setBooking(null);
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: nextId.current++,
          role: 'bot',
          text:
            "I couldn't quite save that booking. Your details are safe with me — tap WhatsApp and the team will pick it straight up.",
          actions: [{ type: 'whatsapp', label: 'Message an advisor', url: waLink('Hello LandsandHousing,') }],
        },
      ]);
      setBooking(null);
    } finally {
      setBookBusy(false);
    }
  };

  const runAction = (a: Action) => {
    if (a.type === 'option') { void send(a.value ?? a.label); return; }
    if (a.type === 'book') { startBooking(a); return; }
    if (a.url) { window.open(a.url, '_blank', 'noopener'); return; }
    if (a.type === 'whatsapp') {
      window.open(waLink('Hello LandsandHousing, I have a question. My name is '), '_blank', 'noopener');
    }
  };

  const quickReplies =
    stage === 'qualifying' ? [] : FALLBACK_QUICK;
  const showChips = messages.length > 0 && messages.length <= 2 && !busy && !booking;
  const pct = progress && progress.total ? Math.round((progress.answered / progress.total) * 100) : 0;

  return (
    <>
      {/* No floating launcher — the concierge is reachable only from the
          "Speak With an Advisor" buttons, as a dialog over the page. */}
      {open && (
        <div className="fixed inset-0 z-40 bg-[#171716]/35 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
      )}

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${ADVISOR.name}, ${ADVISOR.title}`}
          className="fixed z-50 left-1/2 top-1/2 w-[calc(100vw-2rem)] max-w-[420px] h-[min(680px,calc(100vh-4rem))] -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl border border-[#DED7CA] shadow-2xl shadow-[#17171640] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="bg-[#171716] text-white px-4 py-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full gold-gradient flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-serif text-[15px] font-semibold leading-tight truncate">
                  {ADVISOR.name} · {ADVISOR.title}
                </p>
                <p className="text-[10px] font-sans-ui text-white/60 leading-tight flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  Online now · replies instantly
                </p>
              </div>
              <button type="button" onClick={restart} aria-label="Start a new conversation" title="New conversation"
                className="p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer">
                <RotateCcw className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close chat"
                className="p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Qualification progress */}
            {stage === 'qualifying' && progress && (
              <div className="mt-2.5">
                <div className="h-1 rounded-full bg-white/15 overflow-hidden">
                  <div className="h-full gold-gradient transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-[9.5px] font-sans-ui text-white/55 uppercase letter-luxury mt-1">
                  Getting to know you · {progress.answered}/{progress.total}
                </p>
              </div>
            )}
            {stage === 'qualified' && (
              <p className="text-[9.5px] font-sans-ui text-emerald-300/90 uppercase letter-luxury mt-2 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Requirements captured — ready to book
              </p>
            )}
          </div>

          {/* Transcript */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-[#F7F4EE]">
            {messages.length === 0 && !busy && (
              <p className="text-center text-xs font-sans-ui text-[#9A968D] pt-6">Connecting…</p>
            )}

            {messages.map((m) =>
              m.role === 'user' ? (
                <div key={m.id} className="flex justify-end">
                  <p className="max-w-[85%] bg-[#171716] text-white text-sm font-sans-ui leading-relaxed px-3.5 py-2.5 rounded-2xl rounded-br-sm whitespace-pre-line">
                    {m.text}
                  </p>
                </div>
              ) : (
                <div key={m.id} className="space-y-2.5">
                  <p className="max-w-[92%] bg-white border border-[#DED7CA] text-[#171716] text-sm font-sans-ui leading-relaxed px-3.5 py-2.5 rounded-2xl rounded-bl-sm whitespace-pre-line">
                    {m.text}
                  </p>

                  {/* What the agent will see — shown back to the visitor for trust */}
                  {m.booked && m.summary && (
                    <div className="bg-[#171716] text-white rounded-xl px-3.5 py-3">
                      <p className="text-[9.5px] font-sans-ui uppercase letter-luxury text-white/50 flex items-center gap-1.5 mb-1.5">
                        <Check className="w-3 h-3 text-emerald-400" /> Sent to our advisor
                      </p>
                      <pre className="text-[11px] font-sans-ui leading-relaxed whitespace-pre-wrap text-white/85">{m.summary}</pre>
                    </div>
                  )}

                  {!!m.cards?.length && (
                    <div className="space-y-2">
                      {m.cards.slice(0, 4).map((c, i) => {
                        const price = formatPrice(c);
                        const title = field(c, ['title', 'name']);
                        const loc = field(c, ['zone', 'location', 'area']);
                        const kind = [field(c, ['type']), field(c, ['purpose'])].filter(Boolean).join(' · ');
                        const beds = field(c, ['beds', 'bedrooms']);
                        return (
                          <button
                            key={field(c, ['id', 'slug']) || i}
                            type="button"
                            onClick={() => {
                              setOpen(false);
                              document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            title="View our listings"
                            className="block w-full text-left bg-white border border-[#DED7CA] rounded-xl px-3.5 py-3 hover:border-[#A98946] transition-colors cursor-pointer"
                          >
                            <div className="flex items-baseline justify-between gap-3">
                              <p className="font-serif text-[15px] font-semibold text-[#121212] leading-snug">{title}</p>
                              {price && <p className="font-serif text-[15px] font-bold text-[#A98946] shrink-0">{price}</p>}
                            </div>
                            <p className="text-[11px] font-sans-ui text-[#625F58] mt-1">
                              {[kind, loc, beds ? `${beds} bed` : ''].filter(Boolean).join(' — ')}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {!!m.actions?.length && (
                    <div className="flex flex-wrap gap-2 pt-0.5">
                      {m.actions.map((a, i) => {
                        const primary = a.type === 'book';
                        const Icon = primary ? CalendarDays : Phone;
                        return (
                          <button
                            key={`${m.id}-${i}`}
                            type="button"
                            onClick={() => runAction(a)}
                            className={
                              primary
                                ? 'gold-gradient text-white text-[11px] font-semibold uppercase letter-luxury font-sans-ui px-3 py-2 rounded-full shadow-sm hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5'
                                : 'bg-white border border-[#A98946] text-[#A98946] text-[11px] font-semibold uppercase letter-luxury font-sans-ui px-3 py-2 rounded-full hover:bg-[#A98946] hover:text-white transition-colors cursor-pointer flex items-center gap-1.5'
                            }
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {a.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ),
            )}

            {/* Inline booking form */}
            {booking && (
              <div className="bg-white border border-[#A98946] rounded-xl px-3.5 py-3.5 space-y-2.5">
                <p className="text-[11px] font-semibold uppercase letter-luxury text-[#A98946] font-sans-ui">
                  Book your inspection
                </p>

                <label className="block">
                  <span className="text-[10px] font-semibold text-[#625F58] uppercase letter-luxury font-sans-ui">Property</span>
                  <select
                    value={booking.propertyId}
                    onChange={(e) => {
                      const c = lastCards.find((x) => field(x, ['id']) === e.target.value);
                      setBooking((b) => (b ? { ...b, propertyId: e.target.value, propertyTitle: c ? field(c, ['title']) : '' } : b));
                    }}
                    className="mt-1 w-full bg-[#F7F4EE] border border-[#DED7CA] rounded-lg px-3 py-2 text-xs font-sans-ui text-[#171716] focus:outline-none focus:border-[#A98946]"
                  >
                    <option value="">Any property — let the advisor suggest</option>
                    {lastCards.map((c, i) => (
                      <option key={field(c, ['id']) || i} value={field(c, ['id'])}>{field(c, ['title'])}</option>
                    ))}
                  </select>
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="text-[10px] font-semibold text-[#625F58] uppercase letter-luxury font-sans-ui">Date</span>
                    <input
                      type="date"
                      min={todayISO()}
                      value={booking.date}
                      onChange={(e) => setBooking((b) => (b ? { ...b, date: e.target.value } : b))}
                      className="mt-1 w-full bg-[#F7F4EE] border border-[#DED7CA] rounded-lg px-3 py-2 text-xs font-sans-ui text-[#171716] focus:outline-none focus:border-[#A98946]"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-semibold text-[#625F58] uppercase letter-luxury font-sans-ui">Time</span>
                    <select
                      value={booking.window}
                      onChange={(e) => setBooking((b) => (b ? { ...b, window: e.target.value } : b))}
                      className="mt-1 w-full bg-[#F7F4EE] border border-[#DED7CA] rounded-lg px-3 py-2 text-xs font-sans-ui text-[#171716] focus:outline-none focus:border-[#A98946]"
                    >
                      <option value="morning">Morning</option>
                      <option value="afternoon">Afternoon</option>
                      <option value="evening">Evening</option>
                      <option value="flexible">I'm flexible</option>
                    </select>
                  </label>
                </div>

                <div className="flex gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={confirmBooking}
                    disabled={!booking.date || bookBusy}
                    className="flex-1 gold-gradient text-white text-[11px] font-semibold uppercase letter-luxury font-sans-ui py-2.5 rounded-full shadow-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {bookBusy ? 'Booking…' : 'Confirm inspection'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBooking(null)}
                    className="px-3.5 py-2.5 rounded-full border border-[#DED7CA] text-[#625F58] text-[11px] font-semibold uppercase letter-luxury font-sans-ui hover:border-[#A98946] hover:text-[#A98946] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {busy && (
              <div className="flex gap-1 pl-1 pt-1" aria-label={`${ADVISOR.name} is typing`}>
                {[0, 1, 2].map((i) => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#A98946] animate-bounce" style={{ animationDelay: `${i * 140}ms` }} />
                ))}
              </div>
            )}
          </div>

          {/* Quick replies */}
          {showChips && (
            <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto shrink-0 bg-[#F7F4EE]">
              {quickReplies.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  className="bg-white border border-[#DED7CA] text-[#625F58] hover:border-[#A98946] hover:text-[#A98946] text-[11px] font-sans-ui px-3 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer shrink-0"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="border-t border-[#DED7CA] bg-white p-3 flex items-end gap-2 shrink-0"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={stage === 'qualifying' ? 'Type your answer…' : 'Ask about listings, services, the market…'}
              aria-label={`Message ${ADVISOR.name}`}
              maxLength={500}
              className="flex-1 bg-[#F7F4EE] border border-[#DED7CA] rounded-full px-4 py-2.5 text-sm font-sans-ui text-[#171716] placeholder-[#9A968D] focus:outline-none focus:border-[#A98946] transition-colors"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Send message"
              className="gold-gradient text-white w-11 h-11 rounded-full flex items-center justify-center shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-opacity shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}