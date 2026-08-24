# 🚀 RaktVa.ai - Deployment Guide
**Last Updated:** 23 Aug 2026, 23:49 UTC (5:19 AM IST)

---

## ✅ **PRE-DEPLOYMENT CHECKLIST**

Before deploying, verify:

- ✅ All code committed (18 commits)
- ✅ Production build successful (776KB)
- ✅ Tests passing (6/6)
- ✅ No console errors
- ✅ TypeScript clean
- ✅ Security verified (no secrets in git)

**Status:** READY TO DEPLOY ✅

---

## 🎯 **DEPLOYMENT OPTIONS**

### **Option 1: GitHub Web + Vercel (Recommended - 10 min)**

Easiest method, no CLI required.

### **Option 2: VS Code Extension (10 min)**

If you have GitHub extension installed.

### **Option 3: Vercel CLI (5 min)**

Fastest if you have `vercel` CLI installed.

---

## 📋 **OPTION 1: GitHub Web Interface** (Recommended)

### **Step 1: Create GitHub Repository (3 min)**

1. Visit https://github.com/new
2. Repository name: `raktva-ai`
3. Description: "RaktVa.ai - Anemia screening for Anemia Mukt Bharat (SIH 2026)"
4. Visibility: **Public**
5. **Do NOT initialize** with README/gitignore (we already have them)
6. Click "Create repository"

### **Step 2: Upload Code (5 min)**

**Method A: GitHub Web Upload**

1. On the new repository page, click "uploading an existing file"
2. Drag & drop your entire `C:\Users\Lenovo\SIh` folder
3. Commit message: "Initial commit - Phase 0 + Phase 1 complete"
4. Click "Commit changes"

**Method B: Git Command Line** (if you have git configured)

```bash
cd C:\Users\Lenovo\SIh
git remote add origin https://github.com/YOUR_USERNAME/raktva-ai.git
git push -u origin main
```

### **Step 3: Deploy to Vercel (2 min)**

1. Visit https://vercel.com/new
2. Click "Import Git Repository"
3. Select "GitHub" → Find `raktva-ai`
4. Click "Import"
5. **Framework Preset:** Vite (should auto-detect)
6. **Build Command:** `npm run build` (auto-detected)
7. **Output Directory:** `dist` (auto-detected)
8. Click "Deploy"

Wait 2-3 minutes for deployment to complete.

---

## 🔐 **STEP 4: Add Environment Variables**

### **In Vercel Dashboard:**

1. Go to your project → "Settings" → "Environment Variables"
2. Add the following:

| Key | Value | Environments |
|-----|-------|--------------|
| `GEMINI_API_KEY` | [Your Gemini API key] | Production + Preview + Development |

3. Click "Save"
4. Redeploy the project (Deployments → Latest → Redeploy)

### **Get Gemini API Key:**

1. Visit https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key
4. Paste into Vercel environment variables

---

## 📋 **OPTION 2: VS Code Extension**

### **Prerequisites:**

- GitHub extension installed in VS Code
- GitHub account connected

### **Steps:**

1. Open VS Code
2. Open folder: `C:\Users\Lenovo\SIh`
3. Open Source Control panel (Ctrl+Shift+G)
4. Click "Publish to GitHub"
5. Choose "Publish to GitHub Public Repository"
6. Repository name: `raktva-ai`
7. Wait for upload to complete

Then follow **Option 1, Step 3** to deploy to Vercel.

---

## 📋 **OPTION 3: Vercel CLI** (Fastest)

### **Prerequisites:**

Install Vercel CLI:

```bash
npm i -g vercel
```

### **Steps:**

```bash
# Navigate to project
cd C:\Users\Lenovo\SIh

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? [Your account]
# - Link to existing project? No
# - Project name? raktva-ai
# - Directory? ./
# - Override settings? No
```

### **Add Environment Variables:**

```bash
# Add GEMINI_API_KEY
vercel env add GEMINI_API_KEY

# When prompted:
# - Value: [paste your Gemini API key]
# - Environments: Production, Preview, Development (select all)
```

### **Redeploy with Environment Variables:**

```bash
vercel --prod
```

---

## 🧪 **POST-DEPLOYMENT VERIFICATION**

### **Step 1: Test Live URL**

You'll get a URL like: `https://raktva-ai.vercel.app`

**Test these features:**

1. **Dashboard loads** → Home page with stats
2. **Diagnosis module** → Upload a file (won't parse without API key, but should accept file)
3. **Nutrition module** → Click voice button (should request mic access)
4. **Briefing module** → Click "Download PDF" (should download)
5. **Dark mode toggle** → Should switch themes
6. **Mobile responsive** → Test on phone or resize browser

### **Step 2: Test with GEMINI_API_KEY**

After adding the environment variable and redeploying:

1. Visit Diagnosis module
2. Upload a CBC report image
3. Should extract Hb value and show severity badge

### **Step 3: Check Vercel Logs**

If anything doesn't work:

1. Go to Vercel Dashboard
2. Select your project
3. Click "Logs" tab
4. Check for errors

---

## 🐛 **TROUBLESHOOTING**

### **Issue: Build fails on Vercel**

**Solution:**
- Check Vercel build logs
- Ensure all dependencies in `package.json`
- Verify Node.js version compatibility

### **Issue: API endpoint not working**

**Solution:**
- Check environment variables are set
- Verify API key is valid
- Check Vercel Function logs

### **Issue: 404 on routes**

**Solution:**
- Ensure `vercel.json` has correct rewrite rules
- Check if `dist/` folder contains built files locally

### **Issue: Environment variables not loading**

**Solution:**
- Redeploy after adding variables
- Check variable names match exactly
- Ensure variables are enabled for "Production" environment

---

## 📊 **DEPLOYMENT CHECKLIST**

- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] First deployment successful
- [ ] GEMINI_API_KEY added
- [ ] Redeployed with env vars
- [ ] Live URL tested
- [ ] Dashboard loads
- [ ] Voice input works
- [ ] PDF download works
- [ ] Mobile responsive verified
- [ ] Dark mode works

---

## 🎯 **EXPECTED DEPLOYMENT TIMES**

| Step | Time |
|------|------|
| GitHub repository creation | 1 min |
| Code upload to GitHub | 3 min |
| Vercel project setup | 1 min |
| First deployment | 2-3 min |
| Add environment variables | 1 min |
| Redeploy | 2-3 min |
| **Total** | **10-12 minutes** |

---

## 📞 **USEFUL LINKS**

- **GitHub:** https://github.com/new
- **Vercel:** https://vercel.com/new
- **Gemini API:** https://makersuite.google.com/app/apikey
- **Vercel Docs:** https://vercel.com/docs
- **Vercel CLI:** https://vercel.com/docs/cli

---

## 🚨 **IMPORTANT NOTES**

### **Security:**
- ✅ Never commit `.env` file to git
- ✅ Use Vercel environment variables for secrets
- ✅ Keep API keys in Vercel Dashboard only

### **Environment Variables:**
- Must be added in Vercel Dashboard
- Require redeploy after changes
- Can be different for Production/Preview/Development

### **Vercel Free Tier Limits:**
- 100 deployments per day
- 100 GB bandwidth per month
- Serverless function timeout: 10s (hobby), 60s+ (pro)
- Should be sufficient for demo and initial testing

---

## 🎉 **AFTER SUCCESSFUL DEPLOYMENT**

1. **Share the URL** with your team
2. **Test all features** on mobile and desktop
3. **Rehearse your demo** using the live URL
4. **Monitor Vercel logs** during demo day
5. **Keep a backup** of the GitHub repo

---

**Next Steps:**
- Deploy now and get some rest! 😴
- Test tomorrow morning before demo
- Phase 2-8 available for polish if needed

---

**Team:** Vital Bytes  
**Project:** RaktVa.ai  
**Status:** Ready to Deploy 🚀

*Generated: 23 Aug 2026, 23:49 UTC (5:19 AM IST)*
