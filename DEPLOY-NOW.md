# 🚀 Deployment Guide - RaktVa.ai

## Current Status (23 Aug 2026, 22:04 UTC / 3:34 AM IST)

✅ **Code Ready:** All integrated and committed  
✅ **Build Tested:** Production build successful  
⏳ **GitHub:** Manual setup required (gh CLI not installed)  
⏳ **Vercel:** Deployment in progress

---

## 📋 Step 1: Push to GitHub (Manual)

Since GitHub CLI (`gh`) is not installed, follow these steps:

### Option A: Using GitHub Desktop (Recommended)
1. Open GitHub Desktop
2. Click **File → Add Local Repository**
3. Select: `C:\Users\Lenovo\SIh`
4. Click **Publish Repository**
5. Name: `raktva-ai`
6. Description: "Smart anemia screening co-pilot for Anemia Mukt Bharat"
7. Make it **Public**
8. Click **Publish**

### Option B: Using Git Command Line
1. **Create repo on GitHub.com:**
   - Visit: https://github.com/new
   - Repository name: `raktva-ai`
   - Description: "Smart anemia screening co-pilot for Anemia Mukt Bharat"
   - Make it **Public**
   - Do NOT initialize with README (we have one)
   - Click **Create repository**

2. **Push from terminal:**
```bash
cd C:\Users\Lenovo\SIh
git remote add origin https://github.com/YOUR_USERNAME/raktva-ai.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

---

## 🚀 Step 2: Deploy to Vercel

### If Vercel CLI deployment succeeds:
1. Note the deployment URL from the output
2. Visit the URL to test
3. Add environment variable:
   ```bash
   vercel env add GEMINI_API_KEY
   ```
   - Paste your Gemini API key
   - Select: **Production**, **Preview**, **Development** (all three)
   - Redeploy: `vercel --prod`

### If Vercel CLI fails (not logged in):
1. **Login to Vercel:**
   ```bash
   vercel login
   ```
   Follow the browser authentication flow

2. **Deploy:**
   ```bash
   cd C:\Users\Lenovo\SIh
   vercel --prod
   ```

3. **Add environment variable:**
   ```bash
   vercel env add GEMINI_API_KEY
   ```

---

## 🔗 Step 3: Connect GitHub to Vercel (After GitHub push)

### Method 1: Vercel Dashboard (Recommended)
1. Visit: https://vercel.com/dashboard
2. Click **Add New... → Project**
3. **Import Git Repository**
4. Select **GitHub** → Find `raktva-ai`
5. Click **Import**
6. **Environment Variables:**
   - Add `GEMINI_API_KEY` = `your_key_here`
7. Click **Deploy**

### Method 2: Link Existing Vercel Project
If you already deployed via CLI:
1. Visit: https://vercel.com/dashboard
2. Find your `raktva-ai` project
3. Go to **Settings → Git**
4. Click **Connect Git Repository**
5. Select your GitHub `raktva-ai` repo
6. Click **Connect**

---

## 🔑 Step 4: Get Gemini API Key

If you don't have one yet:
1. Visit: https://makersuite.google.com/app/apikey
2. Click **Create API Key**
3. Copy the key
4. Add to Vercel (see Step 2 or 3)

---

## ✅ Step 5: Verify Deployment

### Test the Live URL:
1. **Dashboard:** `https://your-project.vercel.app/`
2. **Diagnosis:** `https://your-project.vercel.app/diagnosis`
3. **Nutrition:** `https://your-project.vercel.app/nutrition`

### Test Features:
- ✅ Dashboard loads (should work immediately)
- ✅ Dark/light mode toggle works
- ✅ Navigation between modules works
- ✅ Manual Hb entry works (no API key needed)
- 🔑 Photo upload (needs GEMINI_API_KEY)

---

## 🐛 Troubleshooting

### Build fails on Vercel:
- Check build logs in Vercel dashboard
- Ensure all dependencies in `package.json`
- TypeScript errors shown in logs

### API not working:
- Verify `GEMINI_API_KEY` is set in Vercel
- Check Vercel function logs
- Ensure `api/parse-report.js` deployed correctly

### 404 on routes:
- Vercel should auto-detect `vercel.json` rewrites
- Check `vercel.json` exists and is committed

---

## 📝 Quick Checklist

- [ ] Code committed locally (7 commits)
- [ ] GitHub repo created
- [ ] Code pushed to GitHub
- [ ] Vercel project deployed
- [ ] GitHub connected to Vercel
- [ ] GEMINI_API_KEY added to Vercel
- [ ] Live URL tested on phone
- [ ] Manual entry tested (Hb=9 → Yellow badge)
- [ ] Photo upload tested (with API key)

---

## 🎯 Final Verification

Once deployed, test this flow:

### Test 1: Manual Entry (No API key needed)
1. Go to Dashboard
2. Click "Start a new triage"
3. Click "Enter values manually"
4. Enter Hb: `9`
5. **Expected:** Yellow/Moderate badge with appropriate message

### Test 2: Photo Upload (Requires API key)
1. Go to Diagnosis module
2. Upload a CBC report image
3. **Expected:** Values extracted or fallback to manual entry

### Test 3: Mobile Responsiveness
1. Open on mobile phone
2. Test navigation
3. Test all modules load correctly

---

## 📞 Support

- **Vercel Docs:** https://vercel.com/docs
- **GitHub Docs:** https://docs.github.com
- **Gemini API:** https://ai.google.dev/docs

---

**Current Project Location:** `C:\Users\Lenovo\SIh`  
**Last Commit:** `00b2e5a` - docs: Add comprehensive project progress report  
**Build Status:** ✅ Production-ready  
**Next:** Push to GitHub + Deploy to Vercel

---

*Generated: 23 Aug 2026, 22:04 UTC (3:34 AM IST)*
