# Client Onboarding

How to bring a new client onto this project — what we need from them, how we
agree what the assistant will say, and how we hand it over.

This document assumes the reader knows what the product is (see
[README.md](README.md)) and does not need to know how it is built. It is
organised in the order the work actually happens.

---

## 0. The shape of the deliverable

Every client gets the same core experience:

1. Their existing marketing site, unchanged in look and feel.
2. One added entry point: an advisor assistant, opened from labelled buttons.
3. An assistant that answers **only** from the client's own listings and written
   guidance, and refers a person when it does not know.
4. A short, structured qualification captured from every conversation.
5. A notification to the client's team for every booking request, with a
   qualified brief attached.

**The single most important promise:** the assistant never states a fact the
client has not confirmed. Everything else is negotiable. This is not a feature
request — it is the reason the product is trustworthy, and it is cheaper to
protect at onboarding than to repair after launch.

---

## 1. Commercial alignment

Settle these in writing before any build work:

| Question | Why it matters |
|---|---|
| What does the assistant do *not* do? | If it must not give legal or finance advice, we build that refusal in from the start. |
| Who reads the notifications, and how fast? | Determines the notification channel and the brief format. |
| Is this a lead-capture tool or a showcase? | A showcase is freer; a lead tool has stricter accuracy requirements. |
| Who owns accuracy disputes? | Name the person who signs off on listings and claims. |
| What happens to enquiries outside business hours? | Decides whether the assistant offers a callback, a message channel, or nothing. |

**Always ask:** "Is there anything a visitor could reasonably ask that you would
*not* want the assistant to answer?" This produces the refusal list in Phase 5.

---

## 2. What we need from the client

Send this list at kickoff. Everything is required before a launch decision.

### Brand and site
- [ ] Logo (SVG and PNG)
- [ ] Brand colours, font choices, or permission to match the existing site
- [ ] Tone-of-voice examples: three things they say, three they would never say
- [ ] Approved photography, with permissions confirmed
- [ ] The live or staging site we are adding the assistant to

### Listings
- [ ] Every property to be shown, with the full field set (Phase 3)
- [ ] Confirmation that every listing is current and correctly priced
- [ ] Photos or plan images for each listing
- [ ] Any listing that is **sold or reserved** and must be hidden

### Services
- [ ] Every service offered, as a short description
- [ ] What is explicitly *not* offered
- [ ] Fees, if the assistant is permitted to quote them (default: it is not)

### Coverage
- [ ] The exact areas served, listed by name (Phase 4 — read this one)

### Written guidance
- [ ] Articles, FAQs, guides, or market briefings they are happy to have quoted
  - [ ] Ideally published on their own site already
  - [ ] Named author or publication date, so answers are attributable

### Notifications
- [ ] The inbox that receives booking requests
- [ ] The verified sender address the client wants replies from
- [ ] [ ] Confirmation they own the sending domain (or we use a placeholder)

### Access
- [ ] A named decision-maker who can approve answers within 48 hours during the build

---

## 3. Listing intake

The assistant's catalogue is only as good as this step. Require these fields for
every property:

| Field | Notes | Required |
|---|---|---|
| Title | How it is written on the listing | Yes |
| Description | Two to four sentences, factual | Yes |
| Property type | Residential / Commercial / Land / Mixed-use | Yes |
| Status | For sale, For rent, Sold — **never mix in one comparison** | Yes |
| Price | Exact figure | Yes |
| Price period | One-off, or per year/month — must be explicit | Yes |
| Area / estate | The name a visitor would recognise | Yes |
| Bedrooms / bathrooms | Numeric, or blank if not applicable | Yes |
| Size | Square metres or acres — state which | Yes |
| Status note | Available, reserved, or coming soon | Yes |

**Two rules that prevent the two worst failures we have seen:**

1. **Price period must be explicit.** A rental at ₦12,000,000/year and a sale at
   ₦48,000,000 are not comparable. If the period is missing, the assistant will
   compare them anyway and produce a confident, wrong answer.
2. **Status must be current.** A reserved property shown as available costs the
   client an inspection that cannot go ahead.

---

## 4. Coverage — decide this before anything else

Write the service area down as an explicit list of names:

> We serve: Uyo — Ewet Housing Estate, Osongama Estate Extension, Abak Road
> Commercial Hub, Shelter Afrique Estate. Plus anywhere in Akwa Ibom on request.
> We do **not** hold listings in Ikot Ekpene, Calabar, or Port Harcourt.

Two separate ideas, often conflated:

- **Where we hold listings.** The assistant may only show these. Asking about
  anywhere else gets an honest "not there yet".
- **Where we can advise.** The advisory business may serve a wider area. This is
  a referral path, not a listing source — never show a listing to fill the gap.

The failure mode is subtle and expensive: show a visitor in Ikot Ekpene a Uyo
property and every word is true, but the answer is a lie. The visitor cannot tell.
**Get this list from the client in writing.**

---

## 5. Assistant behaviour

Agree these explicitly. Each is a decision, not a default.

### Opening
- Who the assistant is and that they are a property advisor
- One question to open — usually purpose: buying, renting, investing, selling, or
  just asking
- The tone: warm and brief, or formal

### Qualification questions
Agree the set and the order. The default sequence:

| # | Question | Notes |
|---|---|---|
| 1 | What brings you here today? | Purpose: buy / rent / invest / sell / explore |
| 2 | What budget or range? | **Optional** — never make this a gate |
| 3 | What kind of property? | Residential / Commercial / Land / Mixed-use / anything |
| 4 | Which area? | Constrained to the coverage list |
| 5 | How many bedrooms? | Skip if a non-residential type was chosen |
| 6 | Timeline | Optional |
| 7 | Name | Ask last, after value has been shown |
| 8 | Phone | |
| 9 | Email | |

**Rules the client must sign off on:**
- Anything they volunteer is captured, in any order, mid-sentence. A visitor who
  leads with the area has already answered questions 1–4 and will never be asked
  them again.
- Contacts are collected at the end, after they have seen something. Asking for a
  number in the first message loses people.
- Budget is never mandatory.

### Refusal rules — from the Phase 1 question
Write each as a plain sentence the assistant can actually say:

> "I don't have that written down yet, so I don't want to guess."

Typical refusals: fees and commissions, financing and loan availability, legal
guarantees, title status of a specific parcel, timelines for government processes,
and anything about a competing agency's listing.

### Escalation
Decide the trigger and the destination. Default: after the same question goes
unanswered twice, the assistant stops asking, says why, and offers a person.

### Tone rules
- One question per turn. Never two.
- Never repeat the same options back unless they were ignored twice.
- Never open with "Great question!" or similar filler.
- Say "I don't know" before it would rather guess.

---

## 6. Knowledge base intake

The assistant answers non-listing questions from the client's own written
guidance. Minimum viable set:

- What the business does, and what it does not
- How an engagement starts, end to end
- Every service, in plain language
- The client's market view — what they would tell a walk-in
- Buying process, verification standard, and what documents matter
- At least one article that is genuinely useful to a buyer

**Format per article:** title, short summary, body, category, and a publication
name or date. Attribute answers — "according to [source]" — so the client can
defend them.

**Rule:** if the client cannot point to a written source for a claim, the
assistant does not make the claim.

---

## 7. Notifications

Agree the exact brief before building it. This is what the team actually reads:

```
QUALIFIED LEAD — {Name} ({phone})
Purpose:      Buying
Type:         Residential
Preferred area: Ewet Housing Estate
Bedrooms:     4+
Budget:       up to ₦200M
Interested in: Ewet Executive Residence & Terrace
Requested inspection: 2026-10-20
Email:        visitor@example.com
```

- Send **only** when an inspection is requested. A notification per conversation
  trains the team to ignore them.
- Name the client property of interest where one was chosen.
- Include the contact details, first, not last.
- One recipient for a small team; a routing rule or shared inbox for a larger one.

---

## 8. Build and review

1. Client approves the opening message, question sequence, and refusal list **in
   writing**.
2. Catalogue and knowledge base imported and spot-checked against the client's
   own listings.
3. Client runs the assistant themselves on a phone and tries to break it. Give
   them a short list of questions that should fail, including at least one that
   should be refused.
4. We fix; we do not defend the assistant.

**Review script we give every client** — should you ask:
- Your cheapest property
- Anything in a town you don't cover
- A rental, then a sale, then "cheapest"
- An agent fee question
- A loan or financing question
- A legal guarantee question
- A sentence with no punctuation at all
- A detail you already gave, out of order, in one breath
- Three messages in a row that answer nothing

---

## 9. Launch checklist

- [ ] Every listing verified against the client's current source
- [ ] Coverage list confirmed in writing
- [ ] Refusal list confirmed in writing
- [ ] Notification inbox receiving mail, sender domain verified
- [ ] Mobile-tested on a real phone, on mobile data — not office wifi
- [ ] Notification tested end to end with a real booking
- [ ] Test data cleared from the live system
- [ ] Client has a named owner for listing accuracy
- [ ] Rollback path agreed

---

## 10. Handover and aftercare

Hand over:
- Where the listings live and who edits them
- How to change a price or mark something sold
- How to add a knowledge article
- The refusal list, and how to change it
- What the assistant must never be asked to do

Agree a cadence. **The assistant is only as current as the client's data.** A
review every quarter, minimum, covers: new listings, price changes, sold stock,
and any question the assistant refused twice in a row — the last of which is a
content gap, not a bug.

---

## 11. Rules we do not break

Carried over from this build, where each was a real defect found by testing:

1. **Never state a fact the client has not confirmed.** No generated claims, no
   plausible estimates, no industry generalities dressed as their position.
2. **Never fill a coverage gap with a nearby listing.** Say "not there yet".
3. **Never compare unlike prices.** Rental and sale, per year and one-off.
4. **Never answer the question that is easy instead of the one asked.**
5. **Never escalate someone who is still engaging.** Handing over a phone number
   is engagement, not ignoring you.
6. **Never lose what the visitor already told you.**

---

## 12. Voice (spoken input and replies)

Since v2.1 the advisor can be **talked to as well as typed to** — same assistant,
same questions, same honesty rules. This is an *input mode*, not a separate agent.
Since v2.2 the advisor opens **call-first**: a phone-style call screen.

**How it works for the visitor**
- Open the advisor (any "Speak with an Advisor" button) and it opens as a **voice
  call** — a short ring (soft, only if not muted), then Aisha connects and greets
  out loud with the mic already hearing.
- Live captions show what the visitor said and Aisha's last reply in a call-style
  caption strip; the property cards and booking form arrive in a bottom sheet
  while the call keeps running behind it.
- Keypad: a 3×4 keypad lets the visitor "say it, or tap the digits" (used, for
  example, when the brain asks for a phone number).
- The mic stays on until muted/ended; while Aisha is speaking the mic briefly
  pauses so she never hears her own reply. Barge in by speaking while she is quiet.
  Mute silences her voice without stopping the microphone.
- The **Transcript** button switches to the normal chat (call paused); the header
  phone button returns to the call. The red **End** button (or ESC) hangs up.
- **Receptionist rule:** Aisha listens first and answers exactly what was asked —
  one answer per question, no scripted recommendations. The spoken line is the
  reply itself, never meta commentary about the screen.

**Platform facts to state in the handover**
- Runs entirely in the visitor's browser — mic to text and text to voice. No new
  backend, no third-party accounts, no cost per minute.
- Requires a modern browser's speech support: Chrome, Edge or Safari. In Firefox
  the chat still works normally (text only) with a small on-screen note.
- Pronunciation: the engine reads common names and figures aloud correctly
  ("LandsandHousing", "Uyo", "Ewet", "Akwa Ibom", ₦ and amounts like 45,000,000).
  A Nigerian neural voice (edge-tts `en-NG-EzinneNeural`, still free) is the
  marked upgrade path if a given device's local voice still mangles a name.
- English only, matching the advisor's language; a second language is the same
  scope decision as elsewhere.
- Not a phone line. A visitor can talk to the advisor *inside the site*; calling a
  number is a future project (the voice engine is built behind an adapter so a
  phone/WhatsApp transport can be added without touching the advisor brain).

**No change to the rules.** The same brain produces the answers the voice reads
out, so refusal rules, coverage, and the never-guess promise apply identically to
spoken answers.

---

## 13. Open items

- Connect the legacy enquiry forms to the same conversation state, so a visitor
  who starts in a form and opens the chat does not restart.
- Advisor availability: offer a callback window instead of a promise of contact.
- Language: the assistant answers in English only; a second language is a scope
  decision, not a toggle.