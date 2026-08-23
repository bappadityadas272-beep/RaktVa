# RaktVa.ai (Anemia-AI) — Hackathon Build Runbook
### Team Vital Bytes · SIH 2026 Internal Hackathon (IILM University)
### Runbook v3 — tech stack locked to pitch deck, with explicit swap freedom

---

## ⚠️ The critical timing insight (unchanged — read this first)

Per the official schedule, you get **exactly one hour of on-site dev time
(2–3 PM, 25 Aug) before the Round 1 elimination judging at 3 PM.** Everything
you demo at 3 PM must already be built and tested before you walk in. Today
(23 Aug) and tomorrow (24 Aug) are your real development sprint, not "prep."

If you clear Round 1, the schedule opens up ~12 more overnight hours (Dev
Phases 3–5) for the ML classifier, Child Mode, and polish.

---

## Tech stack — primary choice + swap freedom

This matches what's on your pitch deck. Use the primary stack unless it's
actively blocking progress — if so, **swap to the fallback immediately and
keep moving**, don't stop to ask. Note the swap in your commit message so it's
traceable later (e.g. `"swap: Gemini -> Claude vision, rate limit issue"`).

| Layer | Primary (from deck) | Swap freely to, if blocked |
|---|---|---|
| Frontend | React (HTML5/CSS3/JS) | No swap needed — keep this fixed |
| App/API server | Node.js + Express | Vercel serverless functions (same code, different deploy shape) |
| Vision/NLP parsing | Gemini API | Claude vision API or GPT-4V — same prompt contract, just a different call |
| ML model serving | FastAPI (Python) | A Node route calling a Python script via subprocess, or joblib served through a tiny Flask app — only if FastAPI setup eats too much time |
| ML model | scikit-learn (RandomForest) | Logistic Regression only, if RF cross-val is unstable with limited data |
| Database | MongoDB (Atlas free tier) | Local JSON file or browser storage for the demo, if Atlas setup/latency becomes a blocker |
| Auth | Firebase Authentication | **Skip entirely** — this is optional polish, not core. Only add if Phase 6/7 has spare time. |
| Voice input | Web Speech API | No swap needed — it's free and browser-native |
| PDF generation | jsPDF (client-side) | No swap needed |
| Maps | Leaflet.js + static JSON | No swap needed |
| Version control | Git + GitHub | No swap — commit after every checkpoint, no exceptions |
| Deployment | Vercel | Render/Railway, only if Vercel's Python support becomes annoying for the FastAPI piece |

**Why two servers (Node + FastAPI)?** Node/Express handles the main app: file
uploads, calling Gemini, the rule engine, PDF/session routes. FastAPI is only
there to serve the scikit-learn model in Phase 5, because Python is the
native runtime for `.joblib` models — no point re-implementing RandomForest
inference in JS. If this two-server split costs more setup time than it
saves, collapse it: call the Python script as a subprocess from one Node
route instead. Either is fine — the architecture in CLAUDE.md doesn't care
which runtime serves `/api/predict-type`, only that it's a separate route
from `/api/parse-report`.

---

## 📅 Full timeline at a glance

| Phase | When | Focus |
|---|---|---|
| Phase 0 | **Today, Sun 23 Aug** | Rule engine + Gemini vision parsing, deployed live |
| Phase 1 | **Tomorrow, Mon 24 Aug** | Voice input, PDF, locator, MongoDB wiring, full rehearsal, harden |
| Phase 2 | Tue 25 Aug, 8:00–12:30 | Registration, inauguration, idea framing — no new code |
| Phase 3 | Tue 25 Aug, 2:00–3:00 PM | Bug-fixes and demo hardening ONLY |
| Phase 4 | Tue 25 Aug, 3:00–5:00 PM | 🚨 **Elimination Round 1 — live demo** |
| Phase 5 | Tue 25 Aug, 6:00–9:00 PM | (If through) scikit-learn classifier + FastAPI serving |
| Phase 6 | Tue 25 Aug, 10:00 PM–2:00 AM | Child Mode + Firebase Auth (if time) + hardening |
| Phase 7 | Wed 26 Aug, 3:00–8:00 AM | Final polish, 3x rehearsal, backup video, pack |
| Phase 8 | Wed 26 Aug, 9:00–11:00 AM | 🏆 **Final Judging Round** |

---

## How to use this with Claude Code

1. Both `CLAUDE.md` and this `RUNBOOK.md` go in the project root.
2. Work through **one Block at a time** — don't jump ahead.
3. Check a `☐` box only once verified working **on the deployed URL**, not
   just localhost.
4. Commit after every Checkpoint: `git commit -m "Phase 0 Block B: Gemini parsing live"`
5. If a swap happens (see table above), commit that separately with a clear
   message so it's easy to explain to judges later if asked.

---

# PHASE 0 — TODAY: Sunday 23 Aug

**Goal: a real, live, deployed core loop.** Photo in → severity badge out.

### Block A — Rule Engine (~1.5 hrs) — Node.js, no dependencies

- ☐ `core/ruleEngine.js`: pure function `getSeverity(hb, config)` → `{level, color, message}` using WHO/ICMR adult thresholds (Normal ≥12, Mild/Moderate 8–11.9, Severe <8)
- ☐ `config/adultThresholds.json`: thresholds live here, not in the function
- ☐ 5–6 pre-approved calm message templates, one per severity level
- ☐ Unit-test with hardcoded Hb values (7, 9, 11, 13)

**✅ Checkpoint 0A:** `getSeverity(9, adultConfig)` returns the correct
Yellow/Moderate badge. Commit.

### Block B — Vision Parsing via Gemini (~2 hrs)

- ☐ Node/Express route `POST /api/parse-report`, accepts an uploaded image
- ☐ Call **Gemini API** with a constrained prompt: *"Extract Hemoglobin, Ferritin, MCV, MCHC from this lab report image. Return ONLY valid JSON: {hb, ferritin, mcv, mchc}. If a value isn't visible, use null."*
- ☐ Validate the JSON response against a schema — if `hb` is null or parsing fails, fall back to manual entry instead of guessing
- ☐ Test with 2–3 real/sample CBC report photos
- ☐ **If Gemini is rate-limited or inconsistent:** swap to Claude vision API or GPT-4V with the same prompt contract — don't lose more than 20–30 min to this before swapping

**✅ Checkpoint 0B:** Uploading a real CBC photo returns correct-ish
structured values; a garbled image correctly triggers manual-entry fallback.
Commit (and note which vision API you ended up using).

### Block C — Wire Together + Deploy (~1.5 hrs)

- ☐ React frontend: upload button → `/api/parse-report` → `getSeverity()` → colour badge + message
- ☐ Deploy to **Vercel** — get a real public URL
- ☐ Test the full flow on the deployed URL, on a phone

**✅ Checkpoint 0C — END OF DAY GATE:** Live URL, phone, photo upload → correct
severity badge. If this isn't working tonight, fix it first thing tomorrow
before anything else.

---

# PHASE 1 — TOMORROW: Monday 24 Aug

**Goal: everything else needed for a complete, rehearsed 90-second demo.**

### Block A — Food Synergy Tips (~1.5 hrs)

- ☐ `config/foodSynergyTable.json`: inhibitors (tea/coffee tannins, dairy calcium) vs enhancers (Vitamin C, citrus)
- ☐ Text input (or reuse voice input below) for "what did you eat today"
- ☐ Keyword-match against the table, return ONE fixed-template tip — no free-form AI text

**✅ Checkpoint 1A:** "chai ke saath khana khaya" returns the correct tea-timing tip.

### Block B — Voice Input (~1 hr) — Web Speech API

- ☐ Wire up Web Speech API for Hindi/Hinglish speech-to-text
- ☐ Pipe transcribed text into the Block A matcher
- ☐ Simple "did you mean: X / Y / Z" tap-to-confirm fallback for low confidence

**✅ Checkpoint 1B:** Speaking a sample Hinglish sentence produces the correct tip on the deployed URL.

### Block C — MongoDB Session Storage (~1 hr)

- ☐ Spin up a free MongoDB Atlas cluster (takes ~10 min)
- ☐ One collection, one document per household/session: `{hb_history, meals, symptoms, timestamps}`
- ☐ Wire the Node API to write a new entry after each scan/log
- ☐ **If Atlas setup or latency is a problem:** fall back to a local JSON file for the demo — the PDF/locator features don't care where the data physically lives, only that `getSessionData()` returns it

**✅ Checkpoint 1C:** A scan + a voice log both persist and can be re-fetched.

### Block D — One-Page Doctor PDF (~1 hr) — jsPDF

- ☐ Client-side jsPDF, pulls latest session data from MongoDB (or local JSON)
- ☐ Single clean one-page layout
- ☐ Test on both desktop and mobile browser

**✅ Checkpoint 1D:** "Generate Doctor Sheet" produces a correctly formatted PDF with real data.

### Block E — Locator (~1 hr) — Leaflet.js

- ☐ Static JSON of 8–10 real PHC/Janaushadhi Kendra locations (data.gov.in)
- ☐ Leaflet map, pins from the static list
- ☐ Sort by distance from device GPS if available

**✅ Checkpoint 1E:** Map loads on the deployed URL with correct pins.

### Block F — Full Rehearsal + Hardening (~2 hrs)

Run the entire flow **3+ times** on the actual demo phone(s):

- ☐ Photo → severity badge instantly
- ☐ Voice-log a meal → food tip
- ☐ Generate Doctor Sheet → correct PDF
- ☐ Tap map → nearby PHC/Kendra shown
- ☐ Cold test: incognito tab, mobile data, wifi off
- ☐ Hotspot fallback: laptop tethered to phone hotspot, same flow works
- ☐ Screen-record one full clean run-through as backup video
- ☐ Try to break it: blurry photo, mumbled voice, airplane mode mid-flow

**✅ Checkpoint 1F — END OF DAY GATE:** 3 clean run-throughs, no manual
restarts, on the real deploy URL, on the real demo phone. Backup video saved.

### Block G — Pitch Script (~45 min)

- ☐ 30-second opening: AMB/T4 government anchor → straight into live demo
- ☐ Assign roles: who talks, who drives the demo, rehearsed in parallel
- ☐ Pack: laptop + charger, power bank, local repo + deck copies, college ID

**✅ Checkpoint 1G:** Opening rehearsed twice out loud. Bags packed.

---

# PHASE 2 — Tue 25 Aug, 8:00 AM–2:00 PM (On-Site Morning)

**No new code.** Registration, inauguration, idea-framing per the official schedule.

- ☐ 8:00–9:00 AM: Register as a full team, college IDs ready
- ☐ 9:00–10:05 AM: Attend inauguration
- ☐ 10:30 AM–12:30 PM: Refine the pitch narrative around what's *actually* working — no new scope
- ☐ 12:30–1:00 PM (Mentoring): Ask specific technical questions, not generic feedback requests
- ☐ 1:00–2:00 PM: Lunch, one mental run-through, nothing more

**✅ Checkpoint 2:** Team aligned, roles assigned, no code touched.

---

# PHASE 3 — Tue 25 Aug, 2:00–3:00 PM (Development Phase-2 — 1 HOUR ONLY)

**Bug-fixes and hardening only. No new features this hour.**

- ☐ Re-run the cold test on venue wifi specifically
- ☐ Fix last-minute visual bugs on the specific demo phone
- ☐ Re-confirm hotspot fallback works on-site
- ☐ Do NOT touch rule engine logic or add scope

**✅ Checkpoint 3 — GATE BEFORE JUDGING:** Demo tested on venue network in the last 15 minutes before judging.

---

# PHASE 4 — Tue 25 Aug, 3:00–5:00 PM 🚨 ELIMINATION ROUND

- ☐ Deliver the rehearsed 30-second opening
- ☐ Run the live demo exactly as rehearsed
- ☐ If it breaks live, switch to the backup video and narrate over it — don't panic-debug in front of judges
- ☐ Answer honestly if something isn't built yet

**✅ Checkpoint 4:** Demo delivered. Await 5:30 PM result.

---

# PHASE 5 — Tue 25 Aug, 6:00–9:00 PM (Development Phase-3, if you advance)

**Goal: the ML anemia-type classifier — scikit-learn + FastAPI.**

### Block A — Dataset & Training (~1.5 hrs)

- ☐ Kaggle dataset: "ehababoelnaga/anemia-types-classification"
- ☐ Check class balance, stratified train/test split
- ☐ Train baseline (Logistic Regression) + RandomForestClassifier (scikit-learn), compare via cross-validation
- ☐ Save `classification_report` (F1 per class) + confusion matrix image — pitch-deck material
- ☐ **If RF cross-val is unstable with limited data:** fall back to Logistic Regression only and say so honestly

**✅ Checkpoint 5A:** `anemia_type_model.joblib` saved, cross-validated, F1-per-class recorded honestly.

### Block B — Serve via FastAPI (~1 hr)

- ☐ FastAPI app, `POST /predict-type` accepting `{hb, mcv, mch, mchc}`, returning `{type, confidence}`
- ☐ Confidence gate: if confidence < 0.65, return `{type: null, confidence}`
- ☐ Test with curl/Postman
- ☐ **If FastAPI deployment eats too much time:** call the Python script as a subprocess from a Node route instead — same contract, different plumbing

**✅ Checkpoint 5B:** Endpoint returns a real prediction + confidence.

### Block C — Wire Into UI (~30–45 min)

- ☐ After severity badge appears, call the predict-type endpoint in parallel
- ☐ If confident, swap in a type-specific tip; if not, keep the generic tip
- ☐ Small honest label: *"Personalised for likely iron-deficiency pattern"* when confident, nothing extra when not

**✅ Checkpoint 5C:** End-to-end photo → badge → type-personalised tip (or graceful fallback) works live. Commit.

---

# PHASE 6 — Tue 25 Aug, 10:00 PM–2:00 AM (Development Phase-4)

### Block A — Child Screening Mode (~1.5 hrs)

- ☐ `config/childThresholds.json` — a second config file, `ruleEngine.js` untouched
- ☐ Child-appropriate food-tip branch in `foodSynergyTable.json` (e.g. moringa powder in porridge)
- ☐ Use Case switcher UI component (Self-Service / ASHA-Assisted / Child Screening)

**✅ Checkpoint 6A:** Switching to Child Screening visibly changes thresholds/tips via config swap only.

### Block B — Firebase Auth (only if time remains, ~1 hr)

- ☐ Basic Firebase Authentication for ASHA worker login, if genuinely needed for the demo narrative
- ☐ **Skip entirely without guilt** if Block A or hardening needs the time more

**✅ Checkpoint 6B (optional):** Login works, or explicitly marked skipped.

### Block C — Hardening Round 2 (~1.5 hrs)

- ☐ Re-run the full flow 3 more times including Child Mode
- ☐ Re-test cold incognito + hotspot fallback
- ☐ Update backup video if the flow changed meaningfully

**✅ Checkpoint 6C:** All three use cases tested end-to-end, no manual restarts.

---

# PHASE 7 — Wed 26 Aug, 3:00–8:00 AM (Development Phase-5)

**Final polish only — freeze feature scope.**

- ☐ Full rehearsal x3, including Q&A practice
- ☐ Fix only cosmetic/critical bugs
- ☐ Confirm backup video is current and works offline
- ☐ Re-pack: chargers, power banks, local repo + deck copies, IDs

**✅ Checkpoint 7:** Rehearsed three times, no open bugs on the critical path.

---

# PHASE 8 — Wed 26 Aug, 9:00–11:00 AM 🏆 FINAL JUDGING ROUND

- ☐ Deliver the polished pitch + live demo
- ☐ Highlight what's new since Round 1: ML classifier with honest confidence-gating, Child Screening, three working use cases
- ☐ Be ready to explain the safety architecture (deterministic rule engine vs advisory-only ML) — your strongest differentiator

**✅ Checkpoint 8:** Final demo delivered. Await results at 11:30 AM.

---

## If something slips — priority order

Cut from the bottom up, never the top:

1. **Core loop (scan → badge → tip → PDF)** — non-negotiable
2. **ML type-classifier with honest fallback** — your differentiation, protect once through Round 1
3. **Child Screening mode** — strong to have, survivable to lose
4. **Firebase Auth / Use Case toggle polish** — nice, but the system working matters more than the toggle looking polished

If something isn't ready, say so plainly on demo day. Honesty here reads
better to judges than a broken live feature.

---

## Quick reference — event logistics

- **Venue:** IILM University, Greater Noida — Gate No. 3 → SVH Hall
- **Reporting:** 8:00 AM sharp, 25 Aug — full team, college IDs required
- **Main Student Coordinator (Day 1 morning):** Anubhav Sachan
- **Main Student Coordinator (Hackathon ops):** Nikhil Kumar
