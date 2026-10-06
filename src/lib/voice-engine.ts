/**
 * Voice engine adapter.
 *
 * v1 transport: browser-native Web Speech API (webkitSpeechRecognition) for
 * speech-to-text and speechSynthesis for text-to-speech. Zero cost, zero keys,
 * no backend.
 *
 * This file is the seam for future engines (LiveKit realtime voice, edge-tts
 * Nigerian neural voice, local Whisper). Any engine only needs to implement the
 * same functions below and nothing downstream changes.
 */

export type RecognizeEndReason = 'done' | 'silence' | 'error' | 'aborted';

export type RecognizeHandlers = {
  onInterim?: (text: string) => void;
  onFinal: (text: string) => void;
  onEnd?: (reason: RecognizeEndReason) => void;
  onError?: (message: string) => void;
};

type Ctor = new () => any;

const recognitionCtor = (): Ctor | null => {
  if (typeof window === 'undefined') return null;
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
};

export const supportsVoice = (): boolean =>
  typeof window !== 'undefined' &&
  recognitionCtor() !== null &&
  'speechSynthesis' in window;

let recognizer: any = null;
let activeHandlers: RecognizeHandlers | null = null;
let restartTimer: number | null = null;
let committedFinals = 0;

const clearTimers = () => {
  if (restartTimer !== null) {
    clearTimeout(restartTimer);
    restartTimer = null;
  }
};

const teardown = () => {
  clearTimers();
  if (recognizer) {
    try {
      recognizer.onresult = null;
      recognizer.onend = null;
      recognizer.onerror = null;
      recognizer.stop();
    } catch {
      /* already stopped */
    }
    recognizer = null;
  }
};

const errorHint = (code?: string): string => {
  switch (code) {
    case 'not-allowed':
      return 'Microphone access was blocked — allow the mic to talk, or type instead.';
    case 'service-not-allowed':
    case 'service-not-allowed-in-browser':
      return 'Voice input is disabled in this browser — type instead.';
    case 'network':
      return 'The speech service was unreachable — check your connection.';
    case 'language-not-supported':
      return 'Voice input is not supported for this language here — type instead.';
    case 'audio-capture':
      return 'No microphone was found on this device.';
    default:
      return "I couldn't hear you clearly — try again, or type instead.";
  }
};

export const startListening = (handlers: RecognizeHandlers): void => {
  if (activeHandlers) stopListening();
  const Ctor = recognitionCtor();
  if (!Ctor) {
    handlers.onError?.(errorHint());
    return;
  }

  activeHandlers = handlers;
  committedFinals = 0;
  const rec = new Ctor();
  recognizer = rec;
  rec.lang = 'en-NG';
  rec.interimResults = true;
  rec.continuous = true;
  rec.maxAlternatives = 1;

  rec.onresult = (e: any) => {
    const total = e.results.length;
    let finalCount = 0;
    for (let i = 0; i < total; i++) if (e.results[i]?.isFinal) finalCount++;

    // Newly finalized phrase(s) since the last callback — fire them once.
    if (finalCount > committedFinals) {
      let text = '';
      for (let i = committedFinals; i < finalCount; i++) {
        text += e.results[i]?.[0]?.transcript ?? '';
      }
      committedFinals = finalCount;
      const clean = text.replace(/\s+/g, ' ').trim();
      if (clean) activeHandlers?.onFinal(clean);
    }

    // Live interim for the phrase still being spoken.
    let interim = '';
    for (let i = finalCount; i < total; i++) {
      interim += e.results[i]?.[0]?.transcript ?? '';
    }
    if (interim.trim()) activeHandlers?.onInterim?.(interim.trim());
  };

  rec.onerror = (e: any) => {
    const code = e?.error;
    if (code === 'aborted' || code === 'no-speech') return; // handled paths
    const h = activeHandlers;
    teardown();
    activeHandlers = null;
    h?.onError?.(errorHint(code));
  };

  rec.onend = () => {
    if (!activeHandlers) return;
    // External/transient end (tab hidden, network blip) — get back to hearing.
    restartTimer = window.setTimeout(() => {
      if (!activeHandlers || !recognizer) return;
      try {
        committedFinals = 0;
        recognizer.start();
      } catch {
        const h = activeHandlers;
        activeHandlers = null;
        h?.onError?.(errorHint());
      }
    }, 350);
  };

  try {
    rec.start();
  } catch {
    activeHandlers = null;
    handlers.onError?.(errorHint());
  }
};

export const stopListening = (): void => {
  teardown();
  activeHandlers = null;
};

// ——————————————————————————————————————————————————————————
// Text-to-speech (speechSynthesis)
// ——————————————————————————————————————————————————————————

let utterance: SpeechSynthesisUtterance | null = null;

const FEMALE_HINT =
  /female|girl|aria|ava|jenny|michelle|zoira|sonia|naomi|natasha|heather|susan|zira|neural|ezinne|abena|adi/i;

let cachedVoices: SpeechSynthesisVoice[] = [];

const refreshVoices = () => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  cachedVoices = window.speechSynthesis.getVoices();
};

const loadVoices = () => {
  refreshVoices();
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.addEventListener?.('voiceschanged', refreshVoices);
  }
};

loadVoices();

/**
 * Best available voice: Nigerian English first, then UK English, then US —
 * preferring a female-sounding voice within each language.
 */
const pickVoice = (voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
  if (!voices.length) return null;
  const langRank = (lang: string) => {
    const l = lang.toLowerCase();
    if (l.startsWith('en-ng')) return 0;
    if (l.startsWith('en-gb')) return 1;
    if (l.startsWith('en')) return 2;
    return 9;
  };
  const sex = (v: SpeechSynthesisVoice) => (FEMALE_HINT.test(v.name) ? 0 : 1);
  const rank = (v: SpeechSynthesisVoice) => langRank(v.lang) * 4 + sex(v);
  return [...voices].sort((a, b) => rank(a) - rank(b))[0] ?? null;
};

const tidy = (raw: string): string => {
  let s = raw;
  // Pronounce the words speech engines mangle. Order matters: phrases first.
  for (const [re, rep] of SPELL) s = s.replace(re, rep);
  // Shaped amounts first ("45M" → "45 million"), then plain grouped integers.
  s = s
    .replace(/\b(\d+(?:\.\d+)?)\s*M\b(?![a-z])/gi, '$1 million')
    .replace(/\b(\d+(?:\.\d+)?)\s*K\b(?![a-z])/gi, '$1 thousand')
    .replace(/\b(\d+(?:\.\d+)?)\s*B\b(?![a-z])/gi, '$1 billion');
  s = s.replace(/\b(\d[\d,]*)\b/g, (m) => {
    const digits = m.replace(/,/g, '');
    if (!/^\d+$/.test(digits)) return m;
    if (digits.length <= 3 && !m.includes(',')) return m; // small numbers the engine reads fine
    const n = Number(digits);
    if (!Number.isFinite(n) || n > 999_999_999_999) return m;
    return sayNumber(n);
  });
  return s
    .replace(/[\/\\*_`|~#[\]]/g, ' ')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, ' ') // emoji
    .replace(/\s+/g, ' ')
    .trim();
};

const SPELL: [RegExp, string][] = [
  [/\bLandsandHousing\b/gi, 'Lands and Housing'],
  [/\bAkwa Ibom\b/gi, 'Ak-wah Ee-bom'],
  [/\bUyo\b/gi, 'Oo-yo'],
  [/\bEwet\b/gi, 'E-wet'],
  [/\bIkot Ekpene\b/gi, 'Ee-kot Ek-pen-ay'],
  [/\bCalabar\b/gi, 'Kal-a-bar'],
  [/\bPort Harcourt\b/gi, 'Port Har-cut'],
  [/\bsqm\b/gi, 'square metres'],
  [/\bsqft\b/gi, 'square feet'],
  [/\bBHK\b/gi, 'B H K'],
  [/\bC\.?O\.?O\b/gi, 'Certificate of Occupancy'],
  [/\u20A6/g, 'naira'],
];

const ONES = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
  'seventeen', 'eighteen', 'nineteen',
];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

const sayBelow1000 = (n: number): string => {
  if (n < 20) return ONES[n];
  if (n < 100) {
    const t = Math.floor(n / 10);
    const r = n % 10;
    return TENS[t] + (r ? '-' + ONES[r] : '');
  }
  const h = Math.floor(n / 100);
  const r = n % 100;
  return ONES[h] + ' hundred' + (r ? ' and ' + sayBelow1000(r) : '');
};

const sayNumber = (n: number): string => {
  if (n < 1000) return sayBelow1000(n);
  if (n < 1_000_000) {
    const th = Math.floor(n / 1000);
    const r = n % 1000;
    return sayBelow1000(th) + ' thousand' + (r ? ' ' + sayBelow1000(r) : '');
  }
  if (n < 1_000_000_000) {
    const m = Math.floor(n / 1_000_000);
    const r = n % 1_000_000;
    return sayBelow1000(m) + ' million' + (r ? ' ' + sayNumber(r) : '');
  }
  const b = Math.floor(n / 1_000_000_000);
  const r = n % 1_000_000_000;
  return sayBelow1000(b) + ' billion' + (r ? ' ' + sayNumber(r) : '');
};

export const speak = (text: string, opts?: { rate?: number; onEnd?: () => void }): void => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const clean = tidy(text);
  if (!clean) return;

  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(clean);
  utterance = u;
  u.rate = opts?.rate ?? 1.02;
  u.pitch = 1;
  u.volume = 1;

  const voice = pickVoice(cachedVoices);
  if (voice) u.voice = voice;

  u.onend = () => {
    if (utterance === u) utterance = null;
    opts?.onEnd?.();
  };
  u.onerror = () => {
    if (utterance === u) utterance = null;
    opts?.onEnd?.();
  };
  window.speechSynthesis.speak(u);
};

export const stopSpeaking = (): void => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  utterance = null;
};

export const isSpeaking = (): boolean =>
  typeof window !== 'undefined' && utterance !== null && window.speechSynthesis.speaking;

export const stopAll = (): void => {
  stopListening();
  stopSpeaking();
};