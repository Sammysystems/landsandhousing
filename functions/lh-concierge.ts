// LandsandHousing Property Concierge — edge function.
//
// DESIGN (deliberate, because the demo cannot afford a wrong price):
//
//   1. Every factual answer is composed from the database deterministically.
//      The LLM is never asked to state a price, an address, or a fact. That makes
//      hallucination structurally impossible rather than merely discouraged.
//   2. The LLM only handles greeting / smalltalk, and any LLM error, timeout, or
//      rate limit is swallowed in favour of a canned reply. OpenRouter free models
//      were returning 429 during the build, so the demo has to work with the model
//      switched off entirely.
//   3. No InsForge key ever reaches the browser. This project was found to serve
//      requests authenticated with ANON_KEY as a role holding BYPASSRLS, so RLS is
//      not a boundary here. Authorization is enforced in this file instead:
//        - search helpers return catalogue data only, never PII
//        - leads/conversations/messages/bookings are write-only from the client
//        - the admin surface requires ADMIN_TOKEN
//
// Request:  POST { type: "chat" | "book" | "enquiry", ...payload }

import { createClient } from 'npm:@insforge/sdk';

const CORS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

const BASE_URL = Deno.env.get('INSFORGE_BASE_URL')!;
const db = createClient({ baseUrl: BASE_URL, anonKey: Deno.env.get('ANON_KEY')! });

// ---------------------------------------------------------------- helpers

const errMsg = (e: unknown) => (e instanceof Error ? e.message : String(e));

/**
 * Collected DB errors for the current request. A failed write is invisible in the
 * response by design — the visitor still gets a friendly reply — so the detail is
 * kept for the function log instead of being returned to the caller.
 */
const DB_ERRORS: Array<{ op: string; error: unknown }> = [];
const record = (op: string, error: unknown) => {
  DB_ERRORS.push({ op, error });
  console.error(op, error);
};

/** Non-DB side effects (email) fail silently by design, so keep them inspectable too. */
const SIDE_ERRORS: Array<{ op: string; error: unknown }> = [];

/** PostgREST hands back a jsonb-returning function either parsed or as a string. */
function coerce<T>(data: unknown): T | null {
  if (data == null) return null;
  if (typeof data === 'string') {
    try { return JSON.parse(data) as T; } catch { return null; }
  }
  return data as T;
}

async function rpc<T>(name: string, args: Record<string, unknown>): Promise<T | null> {
  const { data, error } = await db.database.rpc(name, args as never);
  if (error) { record(`rpc ${name}`, error); return null; }
  return coerce<T>(data);
}

// ---------------------------------------------------------------- intent extraction

type Filters = {
  q?: string;
  purpose?: string;
  ptype?: string;
  zone?: string;
  max_price?: number;
  min_beds?: number;
};

// Our qualifier says "buy"; the catalogue says "Sale". Translate, don't pass through.
const PURPOSE_TO_DB: Record<string, string> = {
  buy: 'Sale', sale: 'Sale', purchase: 'Sale', rent: 'Rent', leasing: 'Rent',
  invest: 'Invest', investment: 'Invest',
};
const dbPurpose = (p?: string | null): string | null => (p ? PURPOSE_TO_DB[p] ?? null : null);

const PURPOSE_WORDS: Array<[RegExp, string]> = [
  [/\b(for\s+sale|to\s+buy|buying|purchase)\b/i, 'Sale'],
  [/\b(to\s+rent|renting|for\s+rent|lease)\b/i, 'Rent'],
  [/\b(to\s+invest|investment|investor|yield|roi)\b/i, 'Invest'],
];

const TYPE_WORDS: Array<[RegExp, string]> = [
  [/\b(land|plot|acre|hectare|site|development\s+parcel)\b/i, 'Land'],
  [/\b(commercial|office|retail|shop|plaza|warehouse|corporate|suites?)\b/i, 'Commercial'],
  [/\b(mixed[\s-]?use)\b/i, 'Mixed-Use'],
  [/\b(villa|duplex|apartment|flat|terrace|penthouse|bungalow|house|home|residence|residential)\b/i, 'Residential'],
];

const PROPERTY_WORDS =
  /\b(house|home|property|properties|listing|listings|plot|land|villa|duplex|apartment|flat|terrace|penthouse|bungalow|rent|rental|sale|buy|invest|investment|budget|price|bedroom|bedrooms|\bbeds?\b|\bbaths?\b|commercial|office|retail|shop|plaza|mixed[\s-]?use|estate|square\s*met(er|re)s?|sqm|acres?)\b/i;

/** "200m", "₦200m", "200 million", "1.5bn", "450k", "₦1.2b" -> naira */
function parseMoney(s: string): number | null {
  const m = s.match(
    /(?:₦|naira|ngn)?\s*([0-9]+(?:[.,][0-9]+)?)\s*(billion|bn|b|million|m\b|k\b|thousand)?/i,
  );
  if (!m) return null;
  const num = parseFloat(m[1].replace(/,/g, ''));
  if (Number.isNaN(num)) return null;
  const unit = (m[2] || '').toLowerCase();
  const mult = unit.startsWith('b') ? 1e9 : unit.startsWith('m') ? 1e6 : unit.startsWith('k') || unit.startsWith('t') ? 1e3 : 1;
  const value = num * mult;
  // Bare small numbers are almost always bed counts, not money.
  if (mult === 1 && value < 1000) return null;
  return value;
}

function extractFilters(msg: string, zones: string[]): Filters {
  const f: Filters = {};

  for (const [re, p] of PURPOSE_WORDS) if (re.test(msg)) { f.purpose = p; break; }
  for (const [re, t] of TYPE_WORDS) if (re.test(msg)) { f.ptype = t; break; }

  const bedM = msg.match(/(\d+)\s*(?:bed(?:room)?s?\b|\bbr\b)/i) ?? msg.match(/\b(\d+)\s*bed/i);
  if (bedM) f.min_beds = parseInt(bedM[1], 10);

  // A budget is a ceiling; use the largest figure mentioned.
  const monies = [...msg.matchAll(/(?:₦|naira|ngn)?\s*([0-9]+(?:[.,][0-9]+)?)\s*(billion|bn|b|million|m\b|k\b|thousand)?/gi)]
    .map((m) => parseMoney(m[0]))
    .filter((v): v is number => v !== null && v >= 100000);
  if (monies.length) f.max_price = Math.max(...monies);

  for (const z of zones) {
    if (msg.toLowerCase().includes(z.toLowerCase())) { f.zone = z; break; }
  }

  // Keep the text for retrieval only when it isn't purely a filter statement.
  const q = msg
    .replace(/(?:₦|naira|ngn)\s*[0-9][0-9.,]*\s*(?:billion|bn|b|million|m|k|thousand)?/gi, ' ')
    .replace(/\b\d+\s*(?:bed(?:room)?s?|br|baths?|bdr?)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (q) f.q = q;

  return f;
}

const STOPWORDS = new Set([
  'a','an','the','is','are','was','were','be','been','being','do','does','did','doing',
  'i','me','my','we','our','you','your','yours','they','them','their','it','its',
  'this','that','these','those','there','here','what','whats','which','who','whom','whose',
  'when','where','why','how','can','could','would','should','shall','will','do','does',
  'please','pls','help','tell','show','give','want','need','like','know','about',
  'u','ur','pls','thanks','thank','hi','hello','hey','ok','okay','and','or','but','if',
  'to','of','for','on','in','at','by','with','from','as','so','if','then','than','not',
  'any','some','more','most','much','many','get','got','have','has','had','also','just',
  // Generic shopping verbs and filler. Without these, the loose OR tier matches a
  // stray "sell"/"now" in any document and answers nonsense questions confidently.
  'right','now','before','after','sell','buy','take','make','made','give','put','use',
  'really','actually','something','anything','thing','things','bit','lot','sure',
]);

/**
 * A bare question like "what services do you offer?" is useless to websearch_to_tsquery,
 * which ANDs every token and so matches nothing. Reduce it to content words.
 */
function salientTerms(msg: string): string {
  const words = msg
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
  return words.slice(0, 6).join(' ');
}

/** Last-resort routing when free text finds nothing: which shelf was the user after? */
function inferCategory(msg: string): string | null {
  const t = msg.toLowerCase();
  if (/\b(service|services|offer|offering|do you do|specialis|specializ|help with)\b/.test(t)) return 'service';
  if (/\b(market|insight|insights|trend|trends|forecast|outlook|should i wait)\b/.test(t)) return 'insight';
  if (/\b(area|areas|location|locations|neighbou?rhood|estate|zone|where is|which area|around)\b/.test(t)) return 'location';
  if (/\b(about|company|who are you|contact|phone|address|open|hours|rating|located)\b/.test(t)) return 'business';
  return null;
}

type Intent = 'greeting' | 'contact' | 'property' | 'knowledge' | 'booking' | 'handoff' | 'smalltalk' | 'declined';

// A real phone number starts with a leading zero, a +, or a separator. A bare
// digit run with none of those is money — "200000000" is a ₦200M budget, and
// treating it as a phone number silently dropped the answer we asked for.
const CONTACT_RE = /(\+?\d[\d\s()-]{7,}\d(?=\D|$))|[\w.+-]+@[\w-]+\.[\w.]+/;
const PHONE_RE = /(?:\+?234|0)[\d\s()-]{8,13}\d/;
const isContactText = (t: string) => PHONE_RE.test(t) || /[\w.+-]+@[\w-]+\.[\w.]{2,}/.test(t);

/**
 * Classification is priority-ordered rather than first-match, because question forms
 * collide with property vocabulary: "how is the Uyo property market" and "how do you
 * verify a title before I buy" both contain property words, and matching those first
 * sent genuine questions down the listing-search path.
 *
 * A concrete buying signal (money, beds, budget, availability) means "search the
 * catalogue". A question form or an advisory topic means "answer from the notes".
 */
const QUESTION_FORM = /^(how|what|whats|why|when|where|who|whom|can|could|does|do|is|are|was|tell|explain|help|which)\b/i;
const STRONG_PROPERTY =
  /(?:₦|naira|ngn)\s*[\d]|\b\d+(?:\.\d+)?\s*(?:m|bn|b\b|billion|million|k\b|thousand)\b|\b\d+\s*(?:bed|br|bath|bdr)\b|\b(?:looking\s+for|show\s+me|do\s+you\s+have|available|under\s+\d|budget\s+of|price\s+range|how\s+much|price\s+of|cost\s+of|cheapest|lowest|cheaper|any\s+(house|houses|land|plot|plots|property|properties))\b/i;
const ADVISORY_TOPIC =
  /\b(market|service|services|process|title|titles|verify|verification|due\s+diligence|costing|valuation|management|training|insight|insights|trend|trends|area|areas|about|contact|hours|experience|team|policy|legal|located|location|office|address|phone|rating)\b/i;

/**
 * Places we are honest about not covering. The business is Uyo-only, so naming a
 * different town must get "not there yet", never a silent Uyo listing that implies
 * otherwise.
 */
const OUT_OF_AREA =
  /\b(ikot\s+ekpene|calabar|port\s+harcourt|benin(?:\s+city)?|lagos|abuja|kano|ibadan|uyo\s+road|uyo market|onitsha|warri|jos|enugu|aba\s+calabar|uyo)\b/i;

function classify(msg: string): Intent {
  const t = msg.toLowerCase().trim();
  if (/^(hi|hey|hello|yo|good\s+(morning|afternoon|evening)|how\s+are\s+you|hiya)\b/.test(t)) return 'greeting';
  // Require actual handoff phrasing. A bare "agent" used to swallow questions like
  // "is the agent fee negotiable" and answer them with a WhatsApp pitch.
  if (
    /\b(whats\s*app|wa\.me|human|real\s+person|connect\s+me|call\s+me|phone\s+me|let\s+me\s+(speak|talk))\b/.test(t) ||
    /\b(speak|talk|connect|put)\b[^.?]{0,24}\b(agent|advisor|adviser|human|someone|person)\b/.test(t)
  ) {
    return 'handoff';
  }
  if (/\b(book|booking|inspect|inspection|viewing|schedule|appointment|tour|visit|reserve)\b/.test(t)) return 'booking';
  if (CONTACT_RE.test(msg) && msg.trim().length < 90) return 'contact';
  if (/\b(thanks|thank\s+you|cheers|appreciate\s+it|good\s+night|bye|goodbye)\b/.test(t)) return 'smalltalk';

  // Concrete buying signals beat question wording.
  if (STRONG_PROPERTY.test(msg)) return 'property';
  if (QUESTION_FORM.test(t) || ADVISORY_TOPIC.test(t)) return 'knowledge';
  if (PROPERTY_WORDS.test(t)) return 'property';
  return 'smalltalk';
}

// ---------------------------------------------------------------- answer composition

function bullet(props: Array<Record<string, any>>, max = 4): string {
  return props.slice(0, max).map((p, i) => {
    const bits = [
      `${i + 1}. ${p.title}`,
      p.location,
      p.price_label,
      [p.beds ? `${p.beds} bed` : null, p.baths ? `${p.baths} bath` : null, p.size_sqm ? `${p.size_sqm} sqm` : null]
        .filter(Boolean).join(' · '),
    ].filter(Boolean);
    return bits.join(' — ');
  }).join('\n');
}

const noMatch =
  "I don't have a listing matching that right now. I can widen the search, or you can talk to an advisor directly on WhatsApp.";

// ---------------------------------------------------------------- optional LLM polish

const MODELS = [
  Deno.env.get('OPENROUTER_CHAT_MODEL'),
  'google/gemma-4-31b-it:free',
  'qwen/qwen3.8-27b:free',
].filter(Boolean) as string[];

async function llm(system: string, user: string, ms = 6000): Promise<string | null> {
  const key = Deno.env.get('OPENROUTER_API_KEY');
  if (!key) return null;
  for (const model of MODELS) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model,
          messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
          max_tokens: 120,
        }),
        signal: AbortSignal.timeout(ms),
      });
      if (!res.ok) continue;
      const j = await res.json();
      const text = j?.choices?.[0]?.message?.content?.trim();
      if (text) return text;
    } catch { /* fall through to the next model, then to the canned reply */ }
  }
  return null;
}

const CHATTER_SYSTEM =
  'You are the LandsandHousing concierge, a warm and concise property advisor for Uyo, Akwa Ibom, Nigeria. ' +
  'Reply in at most two short sentences. Never invent property details, prices, or availability. ' +
  'If you are unsure, say you will check with an advisor.';

// ---------------------------------------------------------------- email

/**
 * Where qualified-lead alerts are delivered.
 *
 * SMTP_USER is a login name (e.g. "resend"), not an address, so it must never be
 * used as the recipient. LEADS_INBOX is the real destination and needs to be an
 * address verified on the sending domain.
 */
function leadInbox(): string | null {
  const candidates = [Deno.env.get('LEADS_INBOX'), Deno.env.get('SMTP_USER')];
  for (const c of candidates) {
    const v = (c ?? '').trim();
    if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) return v;
  }
  return null;
}

async function notifyBooking(args: {
  name: string; phone: string; email?: string | null;
  propertyTitle?: string | null; date?: string | null; window?: string | null; notes?: string | null;
  summary?: string | null;
}): Promise<boolean> {
  const to = leadInbox();
  if (!to) {
    SIDE_ERRORS.push({ op: 'smtp', error: 'no LEADS_INBOX address configured — lead saved, email skipped' });
    return false;
  }
  try {
    const nodemailer = (await import('npm:nodemailer')).default;
    const port = Number(Deno.env.get('SMTP_PORT'));
    const t = nodemailer.createTransport({
      host: Deno.env.get('SMTP_HOST'),
      port,
      secure: port === 465,
      auth: { user: Deno.env.get('SMTP_USER'), pass: Deno.env.get('SMTP_PASS') },
    });
    await t.sendMail({
      from: Deno.env.get('EMAIL_FROM'),
      to,
      subject: args.summary?.startsWith('QUALIFIED')
        ? `★ Qualified lead — ${args.propertyTitle ?? 'inspection'} — ${args.name}`
        : `New inspection request — ${args.propertyTitle ?? 'general enquiry'}`,
      text: [
        // The qualification brief comes first: the agent should know who this is and
        // what they want before they read a single detail line.
        args.summary ?? '',
        '',
        `Name:    ${args.name}`,
        `Phone:   ${args.phone}`,
        `Email:   ${args.email ?? '-'}`,
        `Property:${args.propertyTitle ?? '-'}`,
        `Date:    ${args.date ?? 'to be confirmed'}`,
        `Window:  ${args.window ?? 'to be confirmed'}`,
        `Notes:   ${args.notes ?? '-'}`,
      ].join('\n').trim(),
    });
    return true;
} catch (e) {
    SIDE_ERRORS.push({ op: 'smtp', error: errMsg(e) });
    console.error('notifyBooking:', errMsg(e));
    return false;
  }
}

// ---------------------------------------------------------------- handlers

type LeadIn = { name?: string; phone?: string; email?: string };

function waLink(text: string) {
  return `https://wa.me/2348056321856?text=${encodeURIComponent(text)}`;
}

/**
 * ---------------------------------------------------------------------------
 * WHO SHE IS
 * ---------------------------------------------------------------------------
 * One constant, so the name and voice can be changed in a single place.
 * Voice rules encoded in the copy below: warm, plain-spoken, never salesy,
 * one question at a time, and always acknowledge the answer before the next
 * question so it feels like a conversation rather than a form.
 */
const PERSONA = {
  name: 'Aisha',
  title: 'Property Advisor',
  org: 'LandsandHousing',
};

type Qual = Record<string, any>;

const OPENING_ADVISOR =
  `Hi, I'm ${PERSONA.name}, a property advisor at ${PERSONA.org}.`;

const OPENING_BROWSE =
  `Hi, I'm ${PERSONA.name} 👋 I'm the ${PERSONA.title} here at ${PERSONA.org}.\n\n` +
  `Ask me anything about our listings, our advisory services, or how the Uyo market is moving — ` +
  `and if you'd rather talk to a person, just say the word and I'll get you someone.`;

/** Acknowledgement after an answer, so the next question never feels abrupt. */
const ACKS = ['Lovely.', 'Perfect.', 'Great.', 'Noted.', 'Understood.', 'Good.'];

const ack = (q: Qual) => ACKS[Object.keys(q).length % ACKS.length];

type Step = {
  key: string;
  ask: (q: Qual) => string;
  options?: (q: Qual, zones: string[]) => Array<{ label: string; value: string }>;
  parse: (text: string, q: Qual, zones: string[]) => Qual | null;
  applies?: (q: Qual) => boolean;
  optional?: boolean;
};

const moneyToMax = (text: string): number | null => {
  const m = text.replace(/,/g, '').match(/(\d+(?:\.\d+)?)\s*(m|mn|million|bn|b|billion|k|thousand)?/i);
  if (!m) return null;
  const n = parseFloat(m[1]);
  const unit = (m[2] ?? '').toLowerCase();
  if (unit.startsWith('bn') || unit === 'b' || unit === 'billion') return n * 1_000_000_000;
  if (unit.startsWith('m')) return n * 1_000_000;
  if (unit.startsWith('k') || unit.startsWith('th')) return n * 1_000;
  return n >= 1_000 ? n : n * 1_000_000;
};

const BUDGET_BANDS: Array<{ label: string; value: string; max: number | null; min: number | null }> = [
  { label: 'Under ₦50M', value: 'under_50m', max: 50_000_000, min: null },
  { label: '₦50M – ₦150M', value: '50m_150m', max: 150_000_000, min: 50_000_000 },
  { label: '₦150M – ₦300M', value: '150m_300m', max: 300_000_000, min: 150_000_000 },
  { label: '₦300M and above', value: 'over_300m', max: null, min: 300_000_000 },
  { label: 'Still flexible', value: 'flexible', max: null, min: null },
];

const STEPS: Step[] = [
  {
key: 'purpose',
    ask: () => 'What brings you to us today?',
    options: () => [
      { label: "I'm buying", value: 'buy' },
      { label: "I'm renting", value: 'rent' },
      { label: "I want to invest", value: 'invest' },
      { label: "I'm selling", value: 'sell' },
      { label: 'Just asking questions', value: 'explore' },
    ],
    parse: (t) => {
      if (/\b(buy|buying|purchase|acquir)\w*/i.test(t)) return { purpose: 'buy' };
      if (/\b(rent|renting|lease|tenant)\w*/i.test(t)) return { purpose: 'rent' };
      if (/\b(invest|investing|yield|portfolio|roi)\w*/i.test(t)) return { purpose: 'invest' };
      if (/\b(sell|selling|list my|market my)\w*/i.test(t)) return { purpose: 'sell' };
      if (/\b(just|only|curious|explor|information)\w*/i.test(t)) return { purpose: 'explore' };
      return null;
    },
  },
  {
    key: 'budget',
    applies: (q) => q.purpose !== 'explore',
    ask: (q) =>
      q.purpose === 'invest'
        ? 'What investment range are you working with?'
        : q.purpose === 'rent'
          ? 'What monthly rent are you comfortable with?'
          : 'What budget are you working with?',
    options: () => BUDGET_BANDS.map((b) => ({ label: b.label, value: b.value })),
    parse: (t) => {
      const direct = BUDGET_BANDS.find((b) => b.value === t.toLowerCase().replace(/\s+/g, '_'));
      if (direct) return { budget: direct.value, budget_label: direct.label, budget_max: direct.max, budget_min: direct.min };
      if (/\b(flexible|open|any|not sure|undecided|no (idea|limit))\b/i.test(t)) {
        return { budget: 'flexible', budget_label: 'Flexible', budget_max: null, budget_min: null };
      }
      const max = moneyToMax(t);
      if (max) {
        const band = BUDGET_BANDS.find((b) => b.max && max <= b.max) ?? BUDGET_BANDS[3];
        // Echo the visitor's own figure back rather than rounding them into a band.
        const shown = max >= 1_000_000
          ? `up to ₦${Math.round(max / 1_000_000)}M`
          : `up to ₦${Math.round(max / 1_000)}K`;
        return { budget: band.value, budget_label: shown, budget_max: max, budget_min: null };
      }
      return null;
    },
    optional: true,
  },
  {
    key: 'ptype',
    applies: (q) => q.purpose !== 'explore',
    ask: () => 'And what kind of property are you after?',
    options: () => [
      { label: 'Residential', value: 'residential' },
      { label: 'Commercial', value: 'commercial' },
      { label: 'Land', value: 'land' },
      { label: 'Mixed-use', value: 'mixed' },
      { label: 'Open to anything', value: 'any' },
    ],
    parse: (t) => {
      if (/\b(residenti|house|home|apartment|flat|bedroom)\w*/i.test(t)) return { ptype: 'residential' };
      if (/\b(comm ercial|commercial|office|shop|retail|warehouse|plaza)\w*/i.test(t)) return { ptype: 'commercial' };
      if (/\b(land|plot|parcel|serviced estate)\w*/i.test(t)) return { ptype: 'land' };
      if (/\bmixed[\s-]?use\b/i.test(t)) return { ptype: 'mixed' };
      if (/\b(any|anything|open|whatever|no preference)\b/i.test(t)) return { ptype: 'any' };
      return null;
    },
    optional: true,
  },
  {
    key: 'zone',
    applies: (q) => q.purpose !== 'explore' && q.ptype !== 'land',
    ask: () => 'Any area in Uyo you\'re leaning towards, or are you open to anywhere?',
    options: (_q, zones) => [
      ...zones.map((z) => ({ label: z, value: z })),
      { label: 'Anywhere in Uyo', value: 'anywhere' },
    ],
    parse: (t, _q, zones) => {
      if (/\b(anywhere|any area|open to all|no preference|doesn'?t matter)\b/i.test(t)) return { zone: 'anywhere' };
      const hit = zones.find((z) => t.toLowerCase().includes(z.toLowerCase().split(' ')[0]));
      return hit ? { zone: hit } : null;
    },
    optional: true,
  },
  {
    key: 'beds',
    applies: (q) => ['residential', 'mixed', 'any'].includes(String(q.ptype)) && q.purpose !== 'explore',
    ask: () => 'How many bedrooms would you like?',
    options: () => [
      { label: '2 bedrooms', value: '2' },
      { label: '3 bedrooms', value: '3' },
      { label: '4 bedrooms', value: '4' },
      { label: '5+ bedrooms', value: '5' },
      { label: 'Not decided', value: 'any' },
    ],
    parse: (t) => {
      const m = t.match(/(\d+)\s*(?:bed|br|bedroom)/i) ?? t.match(/\b([2-9])\s*(?:\+)?\b/);
      if (m) return { beds: parseInt(m[1], 10) };
      if (/\b(not decided|no preference|any|open)\b/i.test(t)) return { beds: null };
      return null;
    },
    optional: true,
  },
  {
    key: 'timeline',
    applies: (q) => q.purpose !== 'explore',
    ask: () => 'And when are you hoping to move?',
    options: () => [
      { label: 'Immediately', value: 'now' },
      { label: '1 – 3 months', value: '1_3m' },
      { label: '3 – 6 months', value: '3_6m' },
      { label: 'Just browsing for now', value: 'browsing' },
    ],
parse: (t) => {
      const s = t.toLowerCase();
      if (/\b(immediate|now|asap|urgent|this week|this month|ready|right away|today)\w*/i.test(s)) {
        return { timeline: 'now' };
      }
      if (/\b(brows|explor|later|eventually|not yet|no rush|no hurry|just looking)\w*/i.test(s)) {
        return { timeline: 'browsing' };
      }
      if (/\b(next|coming)\s+month\b/i.test(s)) return { timeline: '1_3m' };
      // People say "moving in 3 months", "within six months", "2 months" — map the
      // plain-language range onto the same three bands the buttons offer.
      const words: Record<string, number> = {
        one: 1, two: 2, three: 3, four: 4, five: 5, six: 6,
        couple: 2, few: 3,
      };
      const m = s.match(/(\d+|one|two|three|four|five|six|couple(?:\s+of)?|few)\D{0,12}(months?|weeks?)/i);
      if (m) {
        const raw = m[1].trim();
        const n = /^\d+$/.test(raw) ? parseInt(raw, 10) : (words[raw] ?? 3);
        if (m[2].toLowerCase().startsWith('week')) return { timeline: n <= 1 ? 'now' : '1_3m' };
        return { timeline: n <= 3 ? '1_3m' : '3_6m' };
      }
      if (/\bweeks?\b/i.test(s)) return { timeline: '1_3m' };
      return null;
    },
    optional: true,
  },
  {
    key: 'name',
    applies: (q) => q.purpose !== 'explore',
    ask: () => 'Wonderful. And who am I speaking with?',
    parse: (t) => {
      const cleaned = t.replace(/^(my name is|i am|i'm|it'?s|this is|name'?s?|call me)\s+/i, '').trim();
      if (cleaned.length < 2 || cleaned.length > 80) return null;
      if (/^\d+$/.test(cleaned)) return null;
      return { name: cleaned.replace(/\s+/g, ' ') };
    },
  },
  {
    key: 'phone',
    applies: (q) => q.purpose !== 'explore',
    ask: () => 'Last one, I promise — what\'s the best number for our advisor to reach you on?',
parse: (t) => {
      const digits = t.replace(/[^\d]/g, '');
      if (digits.length >= 10 && digits.length <= 15) return { phone: digits };
      if (digits.length >= 7 && digits.length <= 15) return { phone: digits };
      return null;
    },
  },
  ];

const TIMELINE_LABEL: Record<string, string> = {
  now: 'Ready to move now',
  '1_3m': '1 – 3 months',
  '3_6m': '3 – 6 months',
  browsing: 'Just browsing',
};
const PURPOSE_LABEL: Record<string, string> = {
  buy: 'Buying', rent: 'Renting', invest: 'Investing', sell: 'Selling', explore: 'Asking questions',
};
const PTYPE_LABEL: Record<string, string> = {
  residential: 'Residential', commercial: 'Commercial', land: 'Land', mixed: 'Mixed-use', any: 'Open to anything',
};

/** Human sentence the visitor confirms, built from what we actually understood. */
function reflect(q: Qual): string {
  const bits: string[] = [];
  if (q.purpose) bits.push(PURPOSE_LABEL[q.purpose] ?? q.purpose);
  if (q.ptype && q.ptype !== 'any') bits.push(PTYPE_LABEL[q.ptype] ?? q.ptype);
  if (q.zone && q.zone !== 'anywhere') bits.push(`in ${q.zone}`);
  if (q.beds) bits.push(`${q.beds} bedroom${Number(q.beds) === 1 ? '' : 's'}`);
  if (q.budget_label && q.budget !== 'flexible') bits.push(q.budget_label);
  if (q.timeline && q.timeline !== 'browsing') bits.push(TIMELINE_LABEL[q.timeline]);
  return bits.length ? bits.join(' · ') : '';
}

/** The brief the human agent reads before picking up the phone. */
function buildSummary(q: Qual, booking?: { date?: string; window?: string; property?: string } | null): string {
  const parts: string[] = [];
  parts.push(`QUALIFIED LEAD — ${q.name ?? 'Unknown'} (${q.phone ?? 'no number'})`);
  if (q.purpose) parts.push(`Purpose: ${PURPOSE_LABEL[q.purpose] ?? q.purpose}`);
  if (q.ptype) parts.push(`Type: ${PTYPE_LABEL[q.ptype] ?? q.ptype}`);
  if (q.zone && q.zone !== 'anywhere') parts.push(`Preferred area: ${q.zone}`);
  if (q.beds) parts.push(`Bedrooms: ${q.beds}+`);
  if (q.budget_label) parts.push(`Budget: ${q.budget_label}`);
  if (q.timeline) parts.push(`Timeline: ${TIMELINE_LABEL[q.timeline] ?? q.timeline}`);
  if (booking?.property) parts.push(`Interested in: ${booking.property}`);
  if (booking?.date) parts.push(`Requested inspection: ${booking.date}${booking.window ? ` (${booking.window})` : ''}`);
  return parts.join('\n');
}

/** Natural sentence, for acknowledging the visitor mid-conversation. */
function naturalise(q: Qual): string {
  const what =
    q.ptype === 'land' ? 'land'
    : q.ptype === 'commercial' ? 'commercial space'
    : q.ptype === 'residential' ? (q.beds ? `${q.beds}-bedroom house` : 'house')
    : q.beds ? `${q.beds}-bedroom place`
    : 'property';
  const where = q.zone && q.zone !== 'anywhere' ? ` in ${q.zone}` : '';
  const budget = q.budget_label && q.budget !== 'flexible' ? `, budget ${q.budget_label}` : '';
  const when = q.timeline && q.timeline !== 'browsing' ? `, ${String(TIMELINE_LABEL[q.timeline]).toLowerCase()}` : '';
  return `you're after a ${what}${where}${budget}${when}`;
}

/**
 * Pick up anything the visitor volunteers, not just the answer to the current
 * question. "I need a house at Shelter" carries two facts even though we asked
 * something else, and noticing that is what makes it feel like an advisor rather
 * than a form. Never overrides an answer already given.
 */
/** Words that mean a message is not somebody's name. */
const NOT_A_NAME =
  /\b(house|home|property|properties|listing|listings|plot|land|villa|duplex|apartment|flat|terrace|penthouse|bungalow|rent|rental|sale|buy|buying|sell|selling|invest|budget|price|bedroom|bedrooms|beds?|baths?|commercial|office|retail|shop|plaza|estate|residential|mixed|use|anything|schedule|appointment|inspection|viewing|visit|tour|book|booking|reserve|whatsapp|advisor|adviser|agent|human|thanks|thank|please|yes|no|ok|okay|sure|hello|hi|hey|good|morning|evening|afternoon|cheapest|lowest|available|option|options|flexible|any|explore)\b/i;

/** "Samuel from Lagos", "Ada Obi" — title case, no answer-like words. */
const NAME_SHAPED = /^[A-Z][a-z'’-]{1,20}(?:\s+(?:from\s+|in\s+|at\s+)?[A-Z][a-z'’-]{1,20}){0,3}$/;

function scanIntake(text: string, q: Qual, zones: string[], pending: string | null = null): Qual {
  const out: Qual = {};
  // A bare "2" answering the budget question is two million naira, not a
  // 2-bedroom flat. Only let the bedroom parser see loose digits when bedrooms
  // are actually the question on the table.
  const isContact = isContactText(text);

  for (const key of ['purpose', 'budget', 'ptype', 'zone', 'beds', 'timeline', 'phone']) {
    const step = STEPS.find((s) => s.key === key);
    if (!step) continue;

    if (key === 'beds' && pending !== 'beds' && !/(\d+)\s*(?:bed|br|bedroom)/i.test(text)) continue;
    // A phone number or email is never a budget, a property type or an area.
    if (isContact && key !== 'phone' && key !== 'email') continue;

    // "200000000" with no symbol is still a naira figure when budget is pending. A
    // phone number is not: "08033445566" parsed as a budget of ₦8033M, which is
    // both absurd and the sort of error that quietly poisons a lead brief.
    const bareAmount = /^\d{6,10}$/.test(text.trim()) && !/^0/.test(text.trim());
    const probe = key === 'budget' && bareAmount ? `₦${text.trim()}` : text;

    const got = step.parse(probe, q, zones);
    if (!got) continue;
    for (const [k, v] of Object.entries(got)) {
      if (v === undefined || v === null) continue;
      if (q[k] === undefined || q[k] === null) out[k] = v;
    }
  }

  // Names are the one field where a loose parser is dangerous: "I want to buy"
  // would otherwise be filed as somebody's name. Take it when they volunteer it,
  // when we're asking for it, or when it is short and obviously not a sentence.
  // Email is never asked as a form field, but people hand it over unprompted.
  if (!q.email) {
    const m = text.match(/[\w.+-]+@[\w-]+\.[\w.]{2,}/);
    if (m) out.email = m[0];
  }

  if (q.name === undefined || q.name === null) {
    const raw = text.trim().replace(/\s+/g, ' ');
    const volunteered = /^(my name is|i am|i'm|it'?s|this is|name'?s?|call me)\s+/i.test(raw);
    const stripped = raw.replace(/^(my name is|i am|i'm|it'?s|this is|name'?s?|call me)\s+/i, '').trim();
    const shortish = stripped.length >= 2 && stripped.length <= 40 && stripped.split(' ').length <= 4;
    // Accept it when we're asking for a name, when they lead with "my name is",
    // or when it simply looks like a person's name — somebody volunteering their
    // name halfway through the questions should not have to wait for their turn.
    const shaped = NAME_SHAPED.test(stripped);
    const acceptable = volunteered || (pending === 'name' && shortish) || shaped;
    if (acceptable && shortish && !NOT_A_NAME.test(stripped) && !/^\d+$/.test(stripped) && !CONTACT_RE.test(raw)) {
      out.name = stripped;
    }
  }

  return out;
}

function nextStep(q: Qual, zones: string[]) {
  for (const s of STEPS) {
    if (s.applies && !s.applies(q)) continue;
const answered =
        s.key === 'name' ? Boolean(q.name)
      : s.key === 'phone' ? Boolean(q.phone)
      : s.key === 'beds' ? q.beds !== undefined
      : q[s.key] !== undefined && q[s.key] !== null && q[s.key] !== '';
    if (!answered) return s;
  }
  return null;
}

/* ------------------------- persistence via SECURITY DEFINER RPCs --------- */

type ConvState = { conversationId: string | null; qualification: Qual };

async function loadState(sessionId: string): Promise<ConvState> {
  const r = await rpc<{ ok: boolean; conversationId?: string; qualification?: Qual }>(
    'lh_conv_touch',
    { arg_session_id: sessionId },
  );
  return {
    conversationId: r?.conversationId ?? null,
    qualification: r?.qualification ?? {},
  };
}

async function saveState(
  sessionId: string,
  patch: Qual | null,
  entry: Record<string, unknown> | null,
  summary?: string | null,
) {
  await rpc('lh_conv_touch', {
    arg_session_id: sessionId,
    arg_qualification: patch ?? null,
    arg_entry: entry ?? null,
    arg_summary: summary ?? null,
  });
}


/** Map a completed qualification onto the catalogue search. */
async function searchForQual(q: Qual): Promise<Array<Record<string, any>>> {
  const purpose = q.purpose === 'buy' ? 'Sale' : q.purpose === 'rent' ? 'Rent' : q.purpose === 'invest' ? 'Invest' : null;
  const ptype =
    q.ptype === 'residential' ? 'Residential' :
    q.ptype === 'commercial' ? 'Commercial' :
    q.ptype === 'land' ? 'Land' :
    q.ptype === 'mixed' ? 'Mixed-Use' : null;

  let items: Array<Record<string, any>> = [];
  const r = await rpc<{ items: Array<Record<string, any>> }>('lh_search_properties', {
    arg_q: null,
    arg_purpose: purpose,
    arg_ptype: ptype,
    arg_zone: q.zone && q.zone !== 'anywhere' ? q.zone : null,
    arg_max_price: q.budget_max ?? null,
    arg_min_beds: q.beds ?? null,
    arg_limit: 4,
  });
  items = r?.items ?? [];

  // Budget is a ceiling, not a floor: if nothing fits, widen rather than show nothing.
  if (!items.length && q.budget_max) {
    const wide = await rpc<{ items: Array<Record<string, any>> }>('lh_search_properties', {
      arg_q: null, arg_purpose: purpose, arg_ptype: ptype,
      arg_zone: q.zone && q.zone !== 'anywhere' ? q.zone : null, arg_limit: 4,
    });
    items = wide?.items ?? [];
  }
  return items;
}

async function handleChat(body: Record<string, any>) {
  const sessionId = String(body.sessionId ?? '').slice(0, 64) || crypto.randomUUID();
  const message = String(body.message ?? '').trim().slice(0, 2000);

  // Opening handshake: the widget asks for the greeting instead of faking a "hello"
  // bubble from the visitor.
  if (!message && body.mode) {
    const sessionId0 = String(body.sessionId ?? '').slice(0, 64) || crypto.randomUUID();
    const { qualification: q0 } = await loadState(sessionId0);
    const qual0: Qual = { ...(q0 ?? {}) };
    const zones0: string[] = [];
    const step0 = nextStep(qual0, zones0);
    const opening = body.mode === 'advisor' ? OPENING_ADVISOR : OPENING_BROWSE;
    if (qual0.stage === 'qualified') {
      return json({
        reply: `${opening}\n\nGood to see you again — I still have your details. What would you like to do next?`,
        sessionId: sessionId0, intent: 'greeting', stage: 'qualified', actions: [
          { type: 'book', label: 'Book an inspection' },
          { type: 'whatsapp', label: 'Continue on WhatsApp' },
        ],
      });
    }
if (step0 && body.mode === 'advisor') {
      const options0 = step0.options?.(qual0, zones0) ?? [];
      // Seed the chip bookkeeping, otherwise the very next visitor message re-sends
      // the identical button set and it looks like the advisor ignored them.
      await saveState(sessionId0, {
        offered: `${step0.key}|${options0.map((o) => o.value).join(',')}`,
        asked: step0.key,
        askedCount: Number(qual0.askedCount) || 1,
      }, null);
      return json({
        reply: `${opening}\n\n${step0.ask(qual0)}`,
        sessionId: sessionId0, intent: 'greeting', stage: 'qualifying', nextStep: step0.key,
        actions: options0.map((o) => ({ type: 'option', label: o.label, value: o.value })),
      });
    }
    return json({ reply: opening, sessionId: sessionId0, intent: 'greeting', stage: 'browse' });
  }

if (!message) return json({ error: 'message required' }, 400);

  // People type "I.need.a.house" and "yes..which.options" — dots, underscores and
  // dashes where spaces should be. Every matcher below keys on word boundaries, so a
  // dotted message would parse as one long nonsense token and nothing would ever
  // match. The raw text is still what we store and echo back; this is parse-only.
  const heard = String(message)
    .replace(/[._\-\u2010-\u2015]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // ---- conversation state lives in lh_conversation.qualification (RPC-backed) ----
  const { qualification: stored } = await loadState(sessionId);
  const qual: Qual = { ...(stored ?? {}) };
  if (body.mode === 'advisor' && !qual.stage) qual.stage = 'qualifying';

  const zones = await (async () => {
    const r = await db.database.from('lh_property').select('zone').limit(50);
    return [...new Set((r.data ?? []).map((x: any) => x.zone).filter(Boolean))] as string[];
  })();

  let intent = classify(heard);
  const filters = extractFilters(heard, zones);

  // "Yes" has to mean *yes to what we just offered*. Left unhandled it fell through
  // to the outstanding qualification question, so agreeing to an inspection quietly
  // re-asked what brought them in — the single most confusing thing the chat did.
  const priorOffer = (qual.offer ?? null) as { propertyId: string; propertyTitle: string } | null;
  const AFFIRMATIVE = /^(yes|yeah|yep|yup|yep+sure|sure|ok|okay|alright|great|perfect|please|please do|go ahead|do it|book it|book that|sounds good|that works|lets do it|let'?s do it|i'?d like to|sign me up|count me in)\b/i;
  const NEGATIVE = /^(no|nope|nah|not now|not yet|maybe later|skip|pass)\b/i;
  // Once we've asked for a date, the next message is almost always the date —
  // "Friday", "next week", "the 14th". Treating that as small talk bounced people
  // back to the qualification question right when they were one step from booked.
  const DATE_ANSWER =
    /\b(\d{4}-\d{2}-\d{2}|mon|tue|wed|thu|fri|sat|sun)(day)?\b|^\d{1,2}(st|nd|rd|th)?$|\b(next|this)\s+(week|month|tuesday|wednesday|thursday|friday|saturday|sunday|mon)/i;
  const DATE_PART =
    /\b(morning|afternoon|evening|am|pm)\b|\b\d{1,2}\s*(am|pm)\b/i;
  // Once they have told us a day, the slot is the only thing left to ask for.
  // Re-opening "what date works?" after they already gave one is the loop that
  // made the booking feel like it was going nowhere.
  const askedSlotOnly = Boolean(
    priorOffer && typeof (qual as Record<string, any>).offerSlotAsked === 'string',
  );
  const acceptedOffer =
    priorOffer &&
    heard.trim().length <= 40 &&
    (AFFIRMATIVE.test(heard.trim()) || DATE_ANSWER.test(heard) || DATE_PART.test(heard));
  const declinedOffer = priorOffer && NEGATIVE.test(heard.trim());
  if (acceptedOffer) intent = 'booking';
  if (declinedOffer && !acceptedOffer) intent = 'declined';

  // A bare area name is someone restating where they want to look, not a support
  // request or small talk. Without this, "Shelter Afric" gets answered like a query.
  if (heard.length < 40 && zones.some((z) => heard.toLowerCase().includes(z.toLowerCase().split(' ')[0]))) {
    intent = 'property';
  }

  // Was this message an answer to the question we just asked?
  const stepBefore = nextStep(qual, zones);
  const blockedFromAbsorbing =
    intent === 'knowledge' || intent === 'handoff' || intent === 'greeting' || intent === 'thank';
  // The pending-step parser is the one that guessed wrong: with budget on the table,
  // "08033445566" parsed as a ₦8033M budget. A message that is purely contact details
  // is never the answer to a non-contact step.
  const contactOnly = isContactText(heard) && !stepBefore?.key.match(/phone|email/);
  const parsed: Partial<Qual> =
    stepBefore && !blockedFromAbsorbing && !contactOnly
      ? stepBefore.parse(heard, qual, zones) ?? {}
      : {};
  // Notice anything else they volunteered in the same breath. This is what makes
  // "I need a house at Shelter" count as two answers instead of a failed form entry.
  // scanIntake handles name/phone/email itself (with tighter guards than the raw
  // step parsers), so it is never gated on which step happens to be pending.
  if (!blockedFromAbsorbing) {
    Object.assign(parsed, scanIntake(heard, qual, zones, stepBefore?.key ?? null));
  }
  if (Object.keys(parsed).length) Object.assign(qual, parsed);

  const wantsBooking = intent === 'booking' || /\b(book|inspection|viewing|schedule|visit)\w*/i.test(heard);

  // Asking outright for listings is a real request — answer it even mid-qualification,
  // then pick the conversation back up with the one question still outstanding.
  const wantsListings =
    /\b(show me|listings?|any (houses|properties|land|plots?)|do you have|available|search)\b/i.test(heard);

// Still questions outstanding? We know we're going to ask one after this turn.
  const stepAfter = nextStep(qual, zones);
  const absorbedSomething = Object.keys(parsed ?? {}).length > 0;
  // Mutable because the default branch can reclassify an unrecognised message as a
  // knowledge question once it sees the shape of it.
  let answeredRealQuestion = intent === 'knowledge' || intent === 'property';

  // Bookkeeping for the conversation, computed before the turn is persisted so it
  // survives to the next one:
  //   offered/asked — which chip set we last put on screen, and how many times in a
  //   row the same question has gone unanswered.
  const pendingOptions = stepAfter?.options?.(qual, zones) ?? [];
  const signature = stepAfter ? `${stepAfter.key}|${pendingOptions.map((o) => o.value).join(',')}` : '';
  const stalled = stepAfter ? (qual.asked === stepAfter.key ? (Number(qual.askedCount) || 0) + 1 : 1) : 0;

  // Save the turn + whatever we just learned.
  await saveState(
    sessionId,
    stepAfter
      ? { ...parsed, offered: signature, asked: stepAfter.key, askedCount: stalled }
      : parsed && Object.keys(parsed).length ? parsed : null,
    { role: 'user', at: new Date().toISOString(), text: message },
  );

  let reply = '';
  let source: 'deterministic' | 'llm' = 'deterministic';
  let cards: Array<Record<string, any>> = [];
  let actions: Array<Record<string, any>> = [];
// The thing we asked about last turn that the visitor can now say yes/no to.
let offer: { propertyId: string; propertyTitle: string } | null = null;
  // Set to a day string when we've asked only for the time window; null clears it.
  let offerSlotAsked: string | null | undefined = undefined;
  let matchedBy = '';

  switch (intent) {
case 'greeting': {
      if (stepAfter) {
        // Mid-qualification a bare "hello" just means they're still there. Don't
        // re-introduce the service menu on top of the question we're already asking.
        reply = '';
      } else {
        const polished = await llm(CHATTER_SYSTEM, heard);
        reply = polished ?? "Hello — good to hear from you. What can I help you with today?";
        source = polished ? 'llm' : 'deterministic';
      }
      break;
    }

    case 'smalltalk': {
      reply = /thanks|thank\s+you|cheers|appreciate/i.test(heard)
        ? "Any time. If anything else comes up while you're looking, just ask."
        : stepAfter
          ? ''
          : "I'm here. Ask me about our listings, our advisory services, or the Uyo market — or tell me what you're looking for and I'll point you to the right person.";
      break;
    }

case 'contact': {
      reply = "Got it, thanks.";
      break;
    }

case 'property': {
      // We are Uyo-only. Being asked about another town must get an honest "not
      // there yet", never a Uyo listing dressed up as an answer for Ikot Ekpene.
      if (OUT_OF_AREA.test(heard) && !qual.zone) {
        const place = heard.match(OUT_OF_AREA)?.[0] ?? 'that area';
        reply =
          `We're Uyo-based, so I don't have listings in ${place} yet. ` +
          `Our advisory does cover purchases further afield though — I can pass you to an advisor, ` +
          `or we can look at what we have in Uyo proper if that's useful.`;
        actions = [
          { type: 'whatsapp', label: 'Ask about that area' },
          { type: 'property', label: 'Show Uyo properties', propertyId: null },
        ];
        break;
      }

      // The gate is not "did they say the word listings" — it's "do we have enough to
      // search with". Someone asking "how much is the villa" has told us exactly
      // what they want; refusing to answer because a qualification is half-done is
      // the unhelpful behaviour. A bare "I need a house" with nothing known yet
      // still gets the question first, not a wall of cards.
      const knownZone0 = qual.zone && qual.zone !== 'anywhere' ? qual.zone : null;
      const knownPtype0 = qual.ptype && qual.ptype !== 'any' ? qual.ptype : null;
      const canSearch = Boolean(
        wantsListings || knownZone0 || knownPtype0 || qual.beds || qual.budget_max ||
        (filters.q && filters.q.replace(/\s/g, '').length > 2),
      );
      if (stepAfter && !canSearch) break;

      // "cheapest / lowest" is a question about our price range, not a location.
// Answer it by sorting the whole book rather than text-matching the word — but
// keep the type/zone/purpose they gave us, or "cheapest land" ends up listing
// houses. Only the free-text query and numeric caps are relaxed.
const byPrice = /\b(cheapest|lowest|least|smallest|budget\s+friendly|affordable)\b/i.test(heard);
      // "cheapest land" must not head a house as the cheapest land. The type lives
      // in the title and description, so filter on those rather than a null column.
      const wantType = /\b(land|plot|acre|hectare|site)\b/i.test(heard) ? /\b(land|plot|acre|hectare|parcel|site)\b/i
        : /\b(commercial|office|retail|shop|plaza|suites?)\b/i.test(heard) ? /\b(commercial|office|retail|shop|plaza|suites?|mixed)\b/i
        : /\b(residential|house|apartment|flat|home|duplex)\b/i.test(heard) ? /\b(residential|house|apartment|flat|home|duplex|villa|terrace|mansion)\b/i
        : null;

      // "show me other properties" / "what do you have?" is a request to see the
      // book, not a keyword search. Passing the sentence itself as free text
      // matches nothing and returns a confident "no listing matches that".
      const browseAll = Boolean(
        wantsListings && !byPrice && !filters.zone && !filters.ptype &&
        !filters.max_price && !filters.min_beds && !knownZone0 && !knownPtype0,
      );

      // Search with what we already know, not just this one message. "Which options
      // do you have?" after they told us Ewet must mean Ewet — re-parsing the
      // sentence alone throws that away and returns a confident "nothing found".
      const knownZone = qual.zone && qual.zone !== 'anywhere' ? qual.zone : null;
      const knownPtype = qual.ptype && qual.ptype !== 'any' ? qual.ptype : null;
      const knownPurpose = qual.purpose && qual.purpose !== 'explore' ? qual.purpose : null;
      const structured = Boolean(knownZone || knownPtype || knownPurpose || qual.beds || qual.budget_max);

      const r = await rpc<{ matched_by: string; count: number; items: Array<Record<string, any>> }>(
        'lh_search_properties',
        {
          // Free text only when we have nothing structured to go on; otherwise the
          // question words ("which options do you have") drag the ranking to zero.
          arg_q: byPrice || structured || browseAll ? null : filters.q ?? null,
          // The catalogue stores purpose as Sale / Rent / Invest. Our qualifier
          // speaks "buy" / "rent" / "invest", and passing "buy" straight through
          // matched nothing — which read as "we have no properties", the worst
          // possible answer to give someone who just said they wanted to buy.
          arg_purpose: filters.purpose ?? dbPurpose(knownPurpose),
          // property_type is null on every row in the catalogue, so filtering on
          // it can only ever return zero. Keep the type for display, not the query.
          arg_ptype: null,
          arg_zone: filters.zone ?? knownZone ?? null,
          arg_max_price: byPrice ? null : filters.max_price ?? qual.budget_max ?? null,
          arg_min_beds: byPrice ? null : filters.min_beds ?? qual.beds ?? null,
          arg_limit: byPrice || browseAll ? 50 : 6,
        },
      );
      matchedBy = r?.matched_by ?? 'none';
      cards = r?.items ?? [];

      // "How much is the villa" names a property. Full-text search also matches that
      // word inside other listings' descriptions, so pin the answer to the title.
      // Superlatives are excluded: "cheapest" is a question about the whole book.
      const named = !byPrice
        ? heard
            .match(/\b(?:how\s+much|what(?:'s| is)|price\s+of|cost\s+of)\s*(?:is|are|does|do|for|on)?\s*(?:the\s+|a\s+|an\s+)?([a-z0-9][a-z0-9\s'-]{2,40}?)\s*(?:cost|price|worth)?\s*\??$/i)?.[1]
            ?.trim().toLowerCase()
        : null;
      if (named && !/\b(cheapest|lowest|least|smallest|property|properties|house|houses|land|plot|plots|anything|something|one|ones)\b/.test(named)) {
        const exact = cards.filter((c: any) => String(c.title ?? '').toLowerCase().includes(named));
        if (exact.length === 1) {
          cards = exact;
          matchedBy = 'title';
        } else if (exact.length > 1) {
          cards = exact.slice(0, 3);
          matchedBy = 'title';
        }
      }

      if (byPrice) {
        // A rent is not a purchase price. Headlining "₦12,000,000 / year" as the
        // cheapest property is worse than saying nothing.
        const wantsRent = /rent/i.test(heard) || qual.purpose === 'rent' || qual.purpose === 'invest';
        if (!wantsRent) {
          const forSale = cards.filter(
            (c: any) => !/\/(year|yr|month|mo|annum)\b/i.test(String(c.price_label ?? '')) &&
              !/^(rent|let)$/i.test(String(c.purpose ?? '')),
          );
          if (forSale.length) cards = forSale;
        }
        // Only narrow to the requested type when it leaves something standing —
        // an over-eager filter must not turn into "we have nothing".
        if (wantType) {
          const ofType = cards.filter((c: any) =>
            wantType.test(`${c.title ?? ''} ${c.description ?? ''} ${c.highlights?.join?.(' ') ?? ''}`));
          if (ofType.length) cards = ofType;
        }
        if (cards.length > 1) {
          cards.sort((a: any, b: any) => Number(a.price_raw ?? Infinity) - Number(b.price_raw ?? Infinity));
          cards = cards.slice(0, 3);
        }
      }

      if (browseAll && cards.length > 4) cards = cards.slice(0, 4);

      if (!cards.length) {
        reply = noMatch;
      } else {
        const lead = cards[0];
        const where = !byPrice && knownZone && !filters.zone ? ` in ${knownZone}` : '';
        const verb = !byPrice && cards.length === 1 ? 'fits' : 'fit';
        const headline = byPrice
          ? `It starts at ${lead.price_label ?? lead.price_raw} — that's ${lead.title} in ${lead.zone ?? 'Uyo'}.\n\n${bullet(cards)}`
          : browseAll
            ? `Here's what we currently have${where ? where : ''}:\n\n${bullet(cards)}`
            : `Here ${cards.length === 1 ? 'is one place' : `are ${cards.length} places`} that ${verb} what you described${where}:\n\n${bullet(cards)}`;
        reply = `${headline}\n\nWant me to line up an inspection for "${lead.title}"?`;
        actions = [
          { type: 'book', label: 'Book an inspection', propertyId: lead.id, propertyTitle: lead.title },
          { type: 'whatsapp', label: 'Continue on WhatsApp' },
        ];
        // Remember what we just offered, so a plain "yes" on the next turn books
        // *this* property instead of falling through to the qualification question.
        offer = { propertyId: lead.id, propertyTitle: lead.title };
      }
      break;
    }

    case 'knowledge': {
      const terms = salientTerms(heard);
      const words = (terms || '').split(' ').filter(Boolean);

      // Three tiers, strictest first. Ordering matters: the loose OR tier is last
      // precisely because it will happily match a single common word, so it must not
      // be reached while a more precise signal is still available.
      let r = await rpc<{ matched_by: string; count: number; items: Array<Record<string, any>> }>(
        'lh_search_knowledge',
        { arg_q: terms || heard, arg_limit: 3 },
      );
      matchedBy = r?.matched_by ?? 'none';

      // Tier 2: the shelf the wording points at ("what services do you offer",
      // "how is the market"). Precise, and immune to stopword noise.
      if (!r?.count) {
        const cat = inferCategory(heard);
        if (cat) {
          const byCat = await rpc<{ matched_by: string; count: number; items: Array<Record<string, any>> }>(
            'lh_search_knowledge',
            { arg_q: null, arg_category: cat, arg_limit: 4 },
          );
          if (byCat?.count) { r = byCat; matchedBy = 'category'; }
        }
      }

      // Tier 3: explicit OR so ts_rank prefers the document matching the most terms.
      // Needed because stemming hides near-misses — the notes say "Title
      // Verification" while a visitor asks to "verify" — so no AND conjunction
      // matches, yet "title" alone does.
      if (!r?.count && words.length > 1) {
        const any = await rpc<{ matched_by: string; count: number; items: Array<Record<string, any>> }>(
          'lh_search_knowledge',
          { arg_q: words.slice(0, 5).join(' or '), arg_limit: 3 },
        );
        // Require a real signal, not one incidental word.
        if (any?.count && any.items?.[0]?.rank_score > 0.05) { r = any; matchedBy = 'text'; }
      }

if (!r?.count) {
        reply =
          "I don't have that written down yet, so I don't want to guess. I can put you straight through to an advisor on WhatsApp, or ask about our properties and inspections.";
        actions = [{ type: 'whatsapp', label: 'Ask an advisor on WhatsApp' }];
      } else if (r.items.length === 1) {
        // Never ask a second question in the same turn — the pending qualification
        // step already ends with one, and two questions read as a form, not an advisor.
        reply = `${r.items[0].content}${stepAfter ? '' : '\n\nAnything else you\'d like to know?'}`;
        actions = [{ type: 'whatsapp', label: 'Ask an advisor on WhatsApp' }];
      } else {
        const list = r.items
          .map((d, i) => `${i + 1}. ${d.title}\n   ${String(d.content).split(' Key deliverables')[0].slice(0, 240)}`)
          .join('\n\n');
        reply =
          `${matchedBy === 'category' ? "Here's what we cover:" : 'From our advisory notes:'}\n\n${list}` +
          (stepAfter ? '' : "\n\nWould you like an inspection booked, or to talk it through on WhatsApp?");
        actions = [
          { type: 'book', label: 'Book an inspection' },
          { type: 'whatsapp', label: 'Continue on WhatsApp' },
        ];
      }
      break;
    }

case 'declined': {
      // Say yes to the question they actually asked, and don't pile the
      // qualification question on top — one question per turn.
      reply =
        `No problem — I'll leave it there. ` +
        (priorOffer?.propertyTitle ? `If you change your mind about "${priorOffer.propertyTitle}", just say so. ` : '') +
        `What would you like to do instead?`;
      actions = [
        { type: 'property', label: 'See other properties', propertyId: null },
        { type: 'whatsapp', label: 'Talk to an advisor' },
      ];
      break;
    }

    case 'booking': {
      // A "yes" to a specific offer already names the property — don't make them
      // choose again from a list they just looked at.
      if (acceptedOffer && priorOffer) {
        actions = [
          { type: 'book', label: 'Choose a date', propertyId: priorOffer.propertyId, propertyTitle: priorOffer.propertyTitle },
        ];
        const iso = heard.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? null;
        const dayWord = heard.match(/\b(mon|tue|wed|thu|fri|sat|sun)(day)?\b|\bnext\s+(week|monday|tuesday|wednesday|thursday|friday)\b/i);
        const slot = heard.match(/\b(morning|afternoon|evening)\b/i)?.[1]?.toLowerCase() ?? null;
        // They've given us the date part. Say it back and ask only the one thing
        // still missing, instead of repeating the whole question.
        if (dayWord || iso) {
          const said = iso ?? dayWord![0].replace(/\b\w/g, (c) => c.toUpperCase());
          reply = slot
            ? `Perfect — ${said}, ${slot}. I'll get that confirmed for you now.`
            : `${said} it is. Would you prefer morning or afternoon?`;
          offerSlotAsked = slot ? null : said;
          actions = [{ type: 'book', label: 'Choose a date', propertyId: priorOffer.propertyId, propertyTitle: priorOffer.propertyTitle, date: said, slot }];
        } else if (slot) {
          // They're answering the time-of-day half. Don't ask for the date again.
          const day = askedSlotOnly ? (qual as Record<string, any>).offerSlotAsked : null;
          reply = day
            ? `Perfect — ${day}, ${slot}. I'll get that confirmed for you now.`
            : `Morning or afternoon works either way. Which date should I put it down for?`;
          actions = [
            { type: 'book', label: 'Choose a date', propertyId: priorOffer.propertyId, propertyTitle: priorOffer.propertyTitle, date: day ?? null, slot },
          ];
        } else {
          reply =
            `Great — let's get "${priorOffer.propertyTitle}" booked in. ` +
            `What date works for you, and would you prefer morning or afternoon?`;
        }
        if (iso) actions[0].date = iso;
        offer = priorOffer;
        break;
      }
      const props = await rpc<{ items: Array<Record<string, any>> }>('lh_search_properties', {
        arg_q: filters.q ?? null, arg_limit: 3,
      });
      const target = props?.items?.[0] ?? null;
      const dateM = heard.match(/(\d{4}-\d{2}-\d{2})/);
      actions = [{ type: 'book', label: 'Choose a date', propertyId: target?.id ?? null, propertyTitle: target?.title ?? null }];
      reply = target
        ? `Happy to arrange an inspection of "${target.title}". What date and time window suits you — morning or afternoon?`
        : 'Happy to arrange an inspection. Which property would you like to see, and what date works for you?';
      if (dateM) actions[0].date = dateM[1];
      break;
    }

    case 'handoff': {
      reply =
        "Of course — I can hand you over to an advisor on WhatsApp, and they'll pick up everything from this conversation, so you won't have to repeat yourself.";
      actions = [{ type: 'whatsapp', label: 'Open WhatsApp' }];
      break;
    }

default: {
      // Never let the model answer open-ended text here. This branch catches
      // anything unrecognised, and a free-form reply is the one place it could
      // invent a price, an area or a listing we don't have. Chit-chat gets a
      // fixed warm line; anything that reads like a question is routed to the
      // knowledge base instead, which is grounded in the database.
      if (QUESTION_FORM.test(heard) || /\?$/.test(heard.trim())) {
        intent = 'knowledge';
        answeredRealQuestion = true;
        reply = '';
        const terms = salientTerms(heard);
        const r = await rpc<{ items: Array<Record<string, any>>; count: number; matched_by: string }>(
          'lh_search_knowledge',
          { arg_q: terms || heard, arg_limit: 3 },
        );
        if (r?.count && r.items?.[0]) {
          reply = r.items.length === 1
            ? `${r.items[0].content}${stepAfter ? '' : "\n\nAnything else you'd like to know?"}`
            : `From our advisory notes:\n\n${r.items
                .map((d, i) => `${i + 1}. ${d.title}\n   ${String(d.content).split(' Key deliverables')[0].slice(0, 240)}`)
                .join('\n\n')}`;
        } else {
          reply =
            "I don't have that written down, so I don't want to guess. I can tell you about our listings, " +
            'walk you through our advisory services and the Uyo market, or put you straight through to an advisor.';
        }
        actions = r?.count ? [{ type: 'whatsapp', label: 'Ask an advisor on WhatsApp' }] : [];
      } else {
        reply = stepAfter
          ? ''
          : `Happy to help. I can pull our live listings, explain any of our advisory services, ` +
            `talk you through the Uyo market, or set up an inspection — what would be useful?`;
        actions = stepAfter
          ? []
          : [
              { type: 'option', label: 'Show me properties', value: 'show me properties' },
              { type: 'option', label: 'What services do you offer?', value: 'what services do you offer' },
              { type: 'whatsapp', label: 'Talk to an advisor' },
            ];
      }
    }
  }

  // If we're mid-qualification and they said something that answered nothing, the
  // generic chatter above just gets in the way of the one question we actually need.
  // Drop it and re-ask, so the thread never stalls on a menu of options.
  if (stepAfter && !absorbedSomething && !answeredRealQuestion && (intent === 'smalltalk' || intent === 'greeting')) {
    reply = '';
    source = 'deterministic';
  }

  /* ------------------------------------------------------------------ *
   * QUALIFICATION LAYER
   * One question at a time, always acknowledging before asking the next.
   * ------------------------------------------------------------------ */
if (absorbedSomething) {
    // Speak it back as a sentence, not a form dump: "Perfect — you're after a
    // 5-bedroom house in Shelter Afrique, budget up to ₦200M." Left lowercase
    // after the dash, because an em dash continues the sentence.
    const learned = naturalise(qual);
    const head = learned ? `${ack(qual).replace(/\.$/, '')} — ${learned}.` : 'Thanks — noted.';
    // If they answered AND asked something real, keep both. Otherwise drop the
    // generic chatter so the acknowledgement stands on its own.
    reply = answeredRealQuestion && reply ? `${head}\n\n${reply}` : head;
  }

  let stage: 'browse' | 'qualifying' | 'qualified';
  let nextStepKey: string | null = null;
  let summary: string | null = null;

if (stepAfter) {
    stage = 'qualifying';
    nextStepKey = stepAfter.key;
    const options = pendingOptions;

// Repeating a question to someone who is engaging with us is fine — they may be
    // asking questions before answering it. A "hello" or "thanks" is engagement
    // too, and so is handing over a name, number or figure. Escalate only when we
    // are genuinely being ignored: three turns that neither answered, asked
    // anything, nor acknowledged us.
    const courtesy = intent === 'greeting' || intent === 'smalltalk' || intent === 'contact' || absorbedSomething || wantsBooking || intent === 'declined';

// One question per turn. This reply already asks something — "Want me to line
    // up an inspection for X?" — so appending the outstanding qualification
    // question as well leaves the visitor with two questions and no idea which one
    // we meant. The buttons still answer the outstanding step, so nothing is lost.
    const alreadyAsking = /\?\s*$/.test(reply.trim());
    let stuck = false;

    if (!alreadyAsking) {
      let ask = stepAfter.ask(qual);
      if (stalled === 2 && !answeredRealQuestion && !courtesy) {
        ask = `${ask}\n\nOr just tell me in your own words — whichever is easier.`;
      }
      stuck = stalled >= 3 && !answeredRealQuestion && !courtesy;
      if (stuck) {
        ask =
          "I don't want to keep putting the same question to you.\n\n" +
          'I can pass you to an advisor on WhatsApp with everything you have told me so far, ' +
          'or you can pick one of the options below.';
      }
      const lead = wantsBooking ? "I'd love to get that sorted for you." : '';
      reply = `${reply}\n\n${lead ? `${lead} ` : ''}${ask}`.trim();
    }

    // The buttons are the answer to the question we just asked, so they belong on
    // screen whenever we ask it. They only get suppressed when we made an offer
    // instead (those buttons are the offer), or when the visitor has stalled and
    // we're escalating. Hiding the answer to a question that's still on screen is
    // what left people stuck with nothing to click.
    const chips = options.map((o) => ({ type: 'option', label: o.label, value: o.value }));
    const branchActions = actions;
    actions = alreadyAsking && branchActions.length ? branchActions : chips;
    if (stuck) {
      actions = [
        { type: 'whatsapp', label: 'Talk to an advisor on WhatsApp' },
        ...chips.slice(0, 2),
      ];
    }
  } else if (qual.purpose === 'explore') {
    // No lead capture needed — they only wanted information. One ask per turn:
    // if we already offered an inspection on a specific place, don't pile on.
    stage = 'browse';
    if (cards.length) {
      actions = [{ type: 'whatsapp', label: 'Ask an advisor on WhatsApp' }];
    } else {
      reply = `${reply}\n\nIf you'd like, I can line up an inspection or put you straight through to an advisor.`;
      actions = [
        { type: 'book', label: 'Book an inspection' },
        { type: 'whatsapp', label: 'Ask an advisor on WhatsApp' },
      ];
    }
  } else {
    /* ---- qualified: save the lead, then match listings ---- */
    stage = 'qualified';
    const matchList = await searchForQual(qual);
    cards = matchList.slice(0, 3);
    summary = buildSummary(qual, null);

// Commit the lead once, on the turn the contact details actually arrive.
    let justCompleted = false;
    if (qual.name && qual.phone && !qual.lead_id) {
      const saved = await rpc<{ ok: boolean; leadId?: number }>('lh_commit_lead', {
        arg_session_id: sessionId,
        arg_name: qual.name,
        arg_phone: qual.phone,
        arg_email: qual.email ?? null,
        arg_summary: summary,
        arg_qualification: qual,
      });
      if (saved?.ok) { qual.lead_id = saved.leadId; justCompleted = true; }
    }

    if (justCompleted) {

// Only restate the requirements if they haven't just been echoed back.
    const seen = absorbedSomething ? '' : naturalise(qual);
    const list = cards.length
      ? `\n\nBased on that, these are the ones I'd put in front of you:\n${cards
          .map((c: any, i: number) => `${i + 1}. ${c.title} — ${c.zone} (${c.beds ? `${c.beds} bed, ` : ''}${c.purpose})`)
          .join('\n')}`
      : `\n\nI don't have an exact match on that yet, but our advisor can tell you what isn't listed and what's coming up.`;

    reply =
      `${reply}\n\n${seen ? `So — ${seen}.` : ''}${list}` +
      `\n\nI'll pass all of this to the agent, so you won't have to repeat a thing.` +
      (qual.name && qual.phone
        ? ` Shall I put you down for an inspection, ${String(qual.name).split(' ')[0]}?`
        : ` Would you like to book an inspection?`)
        .replace(/\n{3,}/g, '\n\n');
actions = [
      { type: 'book', label: 'Book an inspection' },
      { type: 'whatsapp', label: 'Continue on WhatsApp' },
    ];
    }
  }

// Persist the assistant turn and the state we ended in.
  await saveState(
    sessionId,
    {
      stage,
      // Remember the offer so the next "yes" can be resolved. A declined or spent
      // offer is cleared, otherwise a later "yes" would book something from ten
      // turns ago.
      ...(offer ? { offer } : declinedOffer || acceptedOffer ? { offer: null } : {}),
      // Persist the lead id, or the lead is re-committed (and re-announced) every turn.
      ...(qual.lead_id ? { lead_id: qual.lead_id } : {}),
      // Remember the day we already took, so a later "morning" doesn't re-ask the date.
      ...(offerSlotAsked !== undefined ? { offerSlotAsked } : {}),
    },
    { role: 'assistant', at: new Date().toISOString(), text: reply },
    summary,
  );

  const totalSteps = STEPS.filter((s) => !s.applies || s.applies(qual)).length;
  const answeredSteps = STEPS.filter((s) => {
    if (s.applies && !s.applies(qual)) return true;
    return s.key === 'name' ? Boolean(qual.name)
      : s.key === 'phone' ? Boolean(qual.phone)
      : qual[s.key] !== undefined && qual[s.key] !== null && qual[s.key] !== '';
  }).length;

  return json({
    reply, sessionId, intent, matchedBy, source, cards, actions,
    stage, nextStep: nextStepKey,
    progress: { answered: answeredSteps, total: totalSteps },
    summary,
    capturedLead: Boolean(qual.lead_id),
  });
}

async function handleBook(body: Record<string, any>) {
  const sessionId = String(body.sessionId ?? '').slice(0, 64) || crypto.randomUUID();

  // The conversation is the source of truth for contact details; the body may also
  // supply them (direct booking form / modal path).
  const { qualification: stored } = await loadState(sessionId);
  const qual: Qual = { ...(stored ?? {}) };
  if (body.name) qual.name = String(body.name).trim();
  if (body.phone) qual.phone = String(body.phone).trim();
  if (body.email) qual.email = String(body.email).trim();

  if (!qual.name || !qual.phone) {
    return json({ error: 'qualification required', needs: !qual.name ? 'name' : 'phone' }, 400);
  }
  // Make sure the conversation row exists before committing anything to it.
  await saveState(sessionId, qual, null, null);

  const propertyId = body.propertyId ? String(body.propertyId) : null;
  let propertyTitle: string | null = body.propertyTitle ? String(body.propertyTitle) : null;
  if (propertyId && !propertyTitle) {
    const p = await db.database.from('lh_property').select('title').eq('id', propertyId).limit(1);
    propertyTitle = (p.data?.[0] as any)?.title ?? null;
  }

  const preferredDate = body.date ? String(body.date) : null;
  const window = body.window ? String(body.window) : null;
  const notes = body.notes ? String(body.notes).slice(0, 1000) : null;

  const summary = buildSummary(qual, { date: preferredDate, window, property: propertyTitle });

  const leadRes = await rpc<{ ok: boolean; leadId?: number; error?: string }>('lh_commit_lead', {
    arg_session_id: sessionId,
    arg_name: qual.name,
    arg_phone: qual.phone,
    arg_email: qual.email ?? null,
    arg_summary: summary,
    arg_qualification: qual,
  });
  if (!leadRes?.ok) return json({ error: leadRes?.error ?? 'could not save lead' }, 500);

  const bookRes = await rpc<{ ok: boolean; bookingId?: number; error?: string }>('lh_commit_booking', {
    arg_session_id: sessionId,
    arg_property_id: propertyId,
    arg_property_title: propertyTitle,
    arg_date: preferredDate,
    arg_window: window,
    arg_notes: notes,
  });
  if (!bookRes?.ok) return json({ error: bookRes?.error ?? 'could not save booking' }, 500);

  const emailed = await notifyBooking({
    name: qual.name, phone: qual.phone, email: qual.email ?? null,
    propertyTitle, date: preferredDate, window, notes, summary,
  });

return json({
    ok: true,
    booked: true,
    bookingId: bookRes.bookingId,
    leadId: leadRes.leadId,
    emailed,
    summary,
    propertyTitle,
    message: emailed
      ? `Booked. I've sent the details to our advisor and emailed you a copy.`
      : `Booked. I've sent the details to our advisor — they'll confirm shortly.`,
    whatsapp: waLink(
      `Hello LandsandHousing, I've just requested an inspection${propertyTitle ? ` for ${propertyTitle}` : ''}` +
      `${preferredDate ? ` on ${preferredDate}` : ''}${window ? ` (${window})` : ''}. My name is ${qual.name}.`,
    ),
  });
}

async function handleEnquiry(body: Record<string, any>) {
  const name = String(body.name ?? '').trim();
  const phone = String(body.phone ?? '').trim();
  const message = String(body.message ?? '').trim().slice(0, 2000);
  if (!name || !phone) return json({ error: 'name and phone are required' }, 400);

  const sessionId = String(body.sessionId ?? '').slice(0, 64) || crypto.randomUUID();
  const email = body.email ? String(body.email).trim() : null;

  // Mark it as coming from the advisor modal rather than the concierge, then commit
  // through the same guarded path so RLS stays intact.
  await saveState(sessionId, { purpose: 'general', source: 'advisor-modal' }, null, null);

  const summary =
    `ENQUIRY (advisor form) — ${name} (${phone})` +
    `${email ? ` <${email}>` : ''}\nMessage: ${message || '(none)'}`;

  const leadRes = await rpc<{ ok: boolean; leadId?: number; error?: string }>('lh_commit_lead', {
    arg_session_id: sessionId,
    arg_name: name,
    arg_phone: phone,
    arg_email: email,
    arg_summary: summary,
    arg_qualification: { purpose: 'general', source: 'advisor-modal', message },
  });
  if (!leadRes?.ok) return json({ error: leadRes?.error ?? 'could not save lead' }, 500);

  const emailed = await notifyBooking({
    name, phone, email, notes: message || null, summary,
  });

  return json({ ok: true, leadId: leadRes.leadId, emailed, whatsapp: waLink(`Hello LandsandHousing, my name is ${name}.`) });
}

// ---------------------------------------------------------------- entry

export default async function (req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);

try {
    const body = (await req.json().catch(() => ({}))) as Record<string, any>;
    DB_ERRORS.length = 0;
    SIDE_ERRORS.length = 0;
    switch (body.type) {
      case 'chat': return await handleChat(body);
      case 'book': return await handleBook(body);
      case 'enquiry': return await handleEnquiry(body);
      default: return json({ error: 'unknown type' }, 400);
    }
  } catch (e) {
    // Diagnostics go to the function log only. Nothing about the internals —
    // error text, SQL, env keys — is ever returned to the caller.
    console.error('handler failed:', errMsg(e));
    if (DB_ERRORS.length) console.error('db errors:', JSON.stringify(DB_ERRORS));
    if (SIDE_ERRORS.length) console.error('side errors:', JSON.stringify(SIDE_ERRORS));
    return json({ error: 'Something went wrong on our end. Please try again.' }, 500);
  }
}