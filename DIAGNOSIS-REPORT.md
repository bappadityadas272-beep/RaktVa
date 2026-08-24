## SECTION 0: DIAGNOSIS PASS — Feature Wiring Status

| Feature | Wired? | Notes |
|---------|--------|-------|
| **1. Blood Report Scanner** | ❌ **NOT WIRED** | API exists (`/api/parse-report.js`) but upload component doesn't POST to it. Line 140: hardcoded demo values. Need to wire file upload → API → getSeverity() → render real badge |
| **2. Food Synergy Matcher** | ❌ **MISSING** | Config exists (`foodSynergyTable.json`) but no matcher function. Need to create `core/foodSynergy.js` with keyword matching logic |
| **3. Voice Input** | ⚠️ **PARTIAL** | Hook exists (`use-voice.ts`) and wired in UI. Transcript displays but inline keyword matching (lines 160-172) needs to use proper matcher from #2 |
| **4. PDF Generation** | ⚠️ **PARTIAL** | `generateDoctorPDF()` exists and is called (line 187), but uses hardcoded demo data. Need to pull from real session storage |
| **5. PHC Locator** | ✅ **WIRED** | Static map with pins exists (line 195). `phcLocations.json` has 5 locations. Only needs 3-5 more locations to reach 8-10 |
| **6. ML Classifier** | ❌ **MISSING** | No model, no training script, no `/predict-type` endpoint. Entire section needs building |
| **7. Child Mode** | ❌ **MISSING** | No `childThresholds.json`, no use-case toggle, no child-specific food tips |

---

## Priority Order (Runbook Sections 1-7)

**Group 1 (Critical wiring — 3 checkpoints):**
- Section 1: Wire blood scanner upload → API → rule engine → badge
- Section 2: Create foodSynergy.js matcher function  
- Section 3: Connect voice transcript to food matcher

**Group 2 (Data integration — 2 checkpoints):**
- Section 4: Wire PDF to real session storage data
- Section 5: Add 5 more PHC locations to reach 8-10 total

**Group 3 (ML + Child mode — 2 checkpoints):**
- Section 6: Train model + create API + wire with confidence gate
- Section 7: Add child thresholds + toggle + child food tips

**Group 4 (Final verification — 1 checkpoint):**
- Section 8: Full integration test on live URL

---

## Next Steps

Start Group 1 (Sections 1-3) — core feature wiring.
