# CLAUDE.md — Project Context for RaktVa.ai (Anemia-AI)

Read this fully before writing any code. This file is the source of truth for
*what* this project is and *how* it must be structured. `RUNBOOK.md` is the
source of truth for *what order* to build things in. Don't duplicate one
inside the other.

---

## What this project is

RaktVa.ai is a triage co-pilot for anemia and nutrient deficiency, built for
India's Anemia Mukt Bharat (T4: Test, Treat, Talk, Track) strategy. A user (or
an ASHA worker on their behalf) photographs a CBC lab report or speaks their
meals/symptoms. The app extracts structured values, classifies severity
against WHO/ICMR thresholds, gives one practical food-swap tip, and generates
a one-page PDF for the next doctor visit.

**The one rule that matters more than any other:** AI only *reads* data. It
never *decides* anything medical. All severity/referral/urgency decisions come
from a plain, deterministic rule engine that a doctor can read line by line.
If you're ever unsure whether something should be an LLM call or a rule-engine
lookup — it's a rule-engine lookup.

---

## System architecture (5 layers)

```
Client capture  →  AI parsing (read-only)  →  Rule engine (ours, deterministic)  →  Storage  →  Output
```

1. **Client capture** — camera (photo), mic (Web Speech API), manual text, GPS
2. **AI parsing** — vision LLM call extracts `{hb, ferritin, mcv, mchc}` from a
   photo as JSON; NLP extracts `{meal_items, symptoms}` from transcribed
   speech. Both are prompted to return **JSON only**, nothing else. Any
   response that fails schema validation triggers a manual-entry fallback —
   never a guess.
3. **Rule engine** — pure functions over config data (see Open/Closed below).
   Decides severity band, referral urgency, food tip, follow-up question.
4. **Storage** — session history (Firestore or local JSON for demo): Hb
   readings, meals, symptoms, timestamps.
5. **Output** — severity badge + calm message, one-page PDF (jsPDF), map of
   nearby PHC/Janaushadhi Kendra (Leaflet + static JSON).

---

## Open for extension, closed for modification

This is the single most important structural rule. Once a **core** file is
written and checkpointed (per RUNBOOK.md), **do not edit it again** to add a
new feature. New behaviour is added by adding new **config** files or new
**routes/components**, never by reopening core logic. This keeps the codebase
small, keeps old checkpoints trustworthy, and keeps token usage low — you
never need to re-read and re-reason about a big core file that's already
working.

| Layer | Status | Rule |
|---|---|---|
| `/core/ruleEngine.js` | **CLOSED** after Phase 0 | Pure functions only: `getSeverity(hb, config)`, `getFoodTip(meal, config)`. Never hardcode a threshold or food item inside this file. |
| `/config/*.json` | **OPEN, always** | Thresholds, food-synergy tables, follow-up trees. Adding Child Mode = adding `childThresholds.json`, NOT editing `ruleEngine.js`. |
| `/api/*.js` | **OPEN — add, don't edit** | Each endpoint is one file, one job. `predict-type.js` (ML, added later) must not touch `parse-report.js`. |
| `/components/*.jsx` | **OPEN — add, don't edit** | One screen/feature per file. Adding the Use Case toggle = a new component that reads config, not a rewrite of existing screens. |

If a feature genuinely requires changing a closed file's *interface* (not just
its data), stop and flag it explicitly rather than quietly refactoring — that's
a deliberate exception, not routine work.

---

## Minimal folder structure (do not add layers beyond this)

```
/core
  ruleEngine.js          # closed after Phase 0 — pure functions, no data inside
/config
  adultThresholds.json
  childThresholds.json   # added Phase 6
  foodSynergyTable.json
  followUpTree.json
/api
  parse-report.js        # vision OCR endpoint
  predict-type.js        # ML classifier endpoint, added Phase 5
/components
  UploadScan.jsx
  SeverityBadge.jsx
  VoiceLogger.jsx
  DoctorPDF.jsx
  Locator.jsx
  UseCaseToggle.jsx      # added Phase 6
/public
  phcLocations.json
App.jsx                  # wires components together — thin, no logic
```

No Redux, no ORM, no TypeScript build step, no component library beyond what's
already agreed (React + plain CSS or Tailwind). If you think you need a new
abstraction layer, you probably don't — this is a 2-day build, not a product
launch.

---

## Coding constraints (token + clutter discipline)

- **One file, one job.** If a file is doing two things, split it — but don't
  create a file for something that's three lines used once.
- **No speculative generality.** Don't add config options, feature flags, or
  parameters for things not in `RUNBOOK.md`. Build what's asked, not what
  might be asked later.
- **Edit, don't regenerate.** Once a file exists and works, use targeted edits
  for changes — don't rewrite the whole file from scratch unless it's
  genuinely broken.
- **No explanatory essays mid-build.** After finishing a block, report status
  in a few lines (what changed, what was tested, what's next) — not a full
  walkthrough of the code. Save the detail for when something's actually
  wrong.
- **Comments only where the *why* isn't obvious** (e.g. why a threshold is
  0.65, not what a for-loop does).
- **Work one Runbook block at a time.** Finish the block's checkpoint, commit,
  stop, and wait — don't cascade into the next block unprompted.

---

## Tech stack (primary — see RUNBOOK.md for swap-freedom details)

Frontend: React (HTML5/CSS3/JS). App/API server: Node.js + Express. Vision/NLP
parsing: Gemini API, prompted for JSON-only output (Claude/GPT-4V are
acceptable swaps if Gemini is blocked). ML model: scikit-learn, served via a
small FastAPI app (a Node+subprocess call is an acceptable swap). Rule engine:
plain JS modules + JSON config — no ML, no external calls. Database: MongoDB
Atlas free tier (local JSON is an acceptable swap for demo speed). Auth:
Firebase Authentication — optional, only if time remains. PDF: jsPDF
(client-side). Maps: Leaflet.js + static JSON. Version control: Git + GitHub,
commit after every checkpoint. Deploy: Vercel.

RUNBOOK.md has the full swap-freedom table with explicit fallbacks per layer —
check there before deciding to swap something. Swaps are allowed and expected
under time pressure; silently doing so without a commit message is not.

---

## Where the actual build order lives

See `RUNBOOK.md` for phases, blocks, and checkpoints. This file does not
repeat that schedule — if the two ever conflict, `RUNBOOK.md` wins on
sequencing, this file wins on structure/architecture.
