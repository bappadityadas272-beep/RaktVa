# RaktVa.ai Integration Plan - Phase 0 + Replit Dashboard

## Current Status: 23 Aug 2026, 21:58 UTC (3:28 AM IST)

## Two Code Bases to Merge:

### 1. Phase 0 Code (C:\Users\Lenovo\SIh) ✅ Complete
- **Rule Engine**: `core/ruleEngine.js` (CLOSED, 6/6 tests passing)
- **Config**: `config/adultThresholds.json` (WHO/ICMR thresholds)
- **API**: `api/parse-report.js` (Gemini vision parsing)
- **Frontend**: React components (UploadScan, SeverityBadge) - basic UI
- **Stack**: React + Vite, JavaScript, simple styling

### 2. Replit Dashboard (C:\Users\Lenovo\Downloads\raktva-ai-extracted) 
- **Full Clinical Dashboard**: 5 modules (Diagnosis, Nutrition, Briefing, Watchlist, Vault)
- **Professional UI**: TypeScript, Tailwind CSS, Radix UI components
- **Complete UX**: Dark mode, responsive, animations
- **Stack**: React + Vite, TypeScript, comprehensive UI library
- **Pages**: Dashboard, Diagnosis, Nutrition, Briefing, Watchlist, Vault

## Integration Strategy:

### Phase 1: Use Replit Dashboard as Base ✅
**Reason**: Professional UI, complete navigation, TypeScript foundation

### Phase 2: Port Phase 0 Core Logic
1. Copy `core/ruleEngine.js` → Convert to TypeScript
2. Copy `config/adultThresholds.json` → Keep as-is
3. Copy `api/parse-report.js` → Keep for Vercel deployment
4. **Connect** Replit's DiagnosisPage to real API + rule engine

### Phase 3: Feature Mapping
| Replit Dashboard | Phase 0 Code | Action |
|---|---|---|
| DiagnosisPage (upload UI) | api/parse-report.js | **Connect** real Gemini API |
| DiagnosisPage (severity display) | core/ruleEngine.js | **Wire** real rule engine |
| NutritionPage (food tips) | config/foodSynergyTable.json | **Create** config file |
| BriefingPage (PDF) | To be built Phase 1 | Mark as "Coming in Phase 1" |
| Dashboard (stats) | Demo data | Keep demo data for now |

### Phase 4: Security & Environment
1. Remove any hardcoded API keys from Replit code
2. Use `.env` for GEMINI_API_KEY
3. Add `.env.example` 
4. Update `.gitignore`

### Phase 5: Deployment Structure
```
raktva-ai/ (final merged)
├── api/              ← Phase 0 API (Vercel serverless)
├── core/             ← Phase 0 rule engine (convert to TS)
├── config/           ← Phase 0 configs (JSON)
├── src/              ← Replit dashboard (TypeScript)
│   ├── components/   ← Replit UI components
│   ├── pages/        ← Replit pages
│   ├── App.tsx       ← Replit main app
│   └── lib/          ← Utilities
├── public/           ← Assets
├── package.json      ← Merged dependencies
├── vercel.json       ← Deployment config
└── tsconfig.json     ← TypeScript config
```

## Implementation Steps:

1. **Copy Replit dashboard to SIh project** ✓
2. **Add Phase 0 dependencies to package.json** ✓
3. **Port core/ruleEngine.js to TypeScript** ✓
4. **Wire DiagnosisPage to real API** ✓
5. **Add environment variable handling** ✓
6. **Test locally** ✓
7. **Deploy to Vercel** ✓
8. **Push to GitHub** ✓
9. **Generate final progress markdown** ✓

## Timeline:
- **Start**: 23 Aug, 22:00 UTC (3:30 AM IST)
- **Target**: 23 Aug, 23:30 UTC (5:00 AM IST)
- **Duration**: ~1.5 hours

---

**Decision**: Merge Replit dashboard (professional UI) with Phase 0 core (working rule engine + API)
