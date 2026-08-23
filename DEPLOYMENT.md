# Deployment Checklist - Phase 0 Block C

## ✅ Pre-Deployment (Complete)

- [x] Rule engine working (6/6 tests)
- [x] Frontend components created
- [x] API endpoint ready
- [x] Local dev server running
- [x] Git commits made

## 📋 Deployment Steps

### 1. Get Gemini API Key

Visit: https://makersuite.google.com/app/apikey

### 2. Deploy to Vercel

```bash
cd C:\Users\Lenovo\SIh
vercel
```

Follow prompts:
- Set up and deploy: Yes
- Which scope: (your account)
- Link to existing project: No
- Project name: raktva-ai
- Directory: ./
- Override settings: No

### 3. Add Environment Variable

```bash
vercel env add GEMINI_API_KEY
```

Paste your API key, select all environments (Production, Preview, Development)

### 4. Redeploy with Env Var

```bash
vercel --prod
```

### 5. Test on Phone

- [ ] Open deployed URL on phone
- [ ] Try manual entry: Hb = 9
- [ ] Verify Yellow/Moderate badge appears
- [ ] Try manual entry: Hb = 13
- [ ] Verify Green/Normal badge appears
- [ ] (Optional) Try photo upload if API key is set

## ✅ Checkpoint 0C Success Criteria

Live URL working with:
1. Manual entry → correct severity badge
2. Deployed on Vercel with public URL
3. Tested on actual mobile phone

## 🎯 After Deployment

Commit the deployment:

```bash
git tag phase-0-complete
git push origin main --tags
```

---

**Current Time**: 23 Aug 2026, 21:46 UTC (3:16 AM IST)
**Time Until Demo Day**: ~38 hours
**Phase 1 Start**: Tomorrow (24 Aug)
