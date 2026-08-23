# RaktVa.ai - Anemia Screening & Nutrition Guidance

> Triage co-pilot for Anemia Mukt Bharat (AMB) · Test, Treat, Talk, Track

## 🚀 Quick Start

### Local Development

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`

### Deploy to Vercel

1. **Install Vercel CLI** (if not already installed):
```bash
npm install -g vercel
```

2. **Get Gemini API Key**:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key

3. **Deploy**:
```bash
vercel
```

4. **Set Environment Variable**:
```bash
vercel env add GEMINI_API_KEY
# Paste your API key when prompted
# Select Production, Preview, and Development
```

5. **Redeploy with env var**:
```bash
vercel --prod
```

## 📁 Project Structure

```
raktva-ai/
├── api/              # Vercel serverless functions
│   └── parse-report.js   # Gemini vision parsing
├── core/             # Rule engine (CLOSED after Phase 0)
│   └── ruleEngine.js     # Pure functions, no hardcoded data
├── config/           # Thresholds & lookup tables (OPEN, always)
│   └── adultThresholds.json
├── src/              # React frontend
│   ├── components/
│   │   ├── UploadScan.jsx
│   │   └── SeverityBadge.jsx
│   ├── App.jsx
│   └── main.jsx
└── public/           # Static assets
```

## ✅ Phase 0 Checkpoints (Complete)

- [x] **Block A**: Rule engine with WHO/ICMR thresholds (6/6 tests passing)
- [x] **Block B**: Gemini vision parsing with fallback to manual entry
- [x] **Block C**: React frontend with upload → severity badge flow

## 🎯 Current Status

**Phase 0 Complete** - Core loop working locally:
- Photo upload → Gemini API → Severity badge ✅
- Manual entry fallback ✅
- Rule engine validated ✅

**Next**: Deploy to Vercel for live testing (Phase 0 Checkpoint 0C)

## 🔧 Architecture Principles

1. **AI reads, never decides**: All medical decisions come from deterministic rule engine
2. **Open/Closed**: Core files closed after checkpoint, extend via config
3. **One file, one job**: No speculative code
4. **Config-driven**: Thresholds and messages live in JSON, not code

## 📝 Tech Stack

- **Frontend**: React + Vite
- **API**: Vercel Serverless Functions
- **Vision**: Gemini 1.5 Flash (swap: Claude/GPT-4V)
- **Rule Engine**: Pure JavaScript + JSON config
- **Deploy**: Vercel

## 🏥 Use Cases

1. **Self-Service**: Users scan their own CBC reports
2. **ASHA-Assisted**: Health workers help screen communities
3. **Child Screening**: Different thresholds for pediatric cases (Phase 6)

## 🔐 Environment Variables

```bash
GEMINI_API_KEY=your_key_here
```

## 📱 Testing

```bash
# Run rule engine tests
npm test
```

## 🎨 Manual Entry Mode

If the vision API fails or image is unclear, the app automatically falls back to manual hemoglobin entry.

---

Built for **SIH 2026 Internal Hackathon** · Team Vital Bytes · IILM University
