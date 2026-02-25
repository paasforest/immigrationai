# 🔍 Google Search Console Setup Guide

## Why Google Search Console?

Google Search Console helps you:
- ✅ See how Google views your site
- ✅ Monitor search performance
- ✅ Track keyword rankings
- ✅ Identify and fix indexing issues
- ✅ Submit sitemaps
- ✅ Get alerts about site issues

---

## Step-by-Step Setup

### Step 1: Access Google Search Console

1. Go to: https://search.google.com/search-console
2. Sign in with your Google account
3. Click **"Add Property"**

### Step 2: Add Your Website

1. Choose **"URL prefix"** method
2. Enter: `https://www.immigrationai.co.za`
3. Click **"Continue"**

### Step 3: Verify Ownership

You have 3 options:

#### Option A: HTML Tag (Easiest)

1. Google will show you an HTML tag like:
   ```html
   <meta name="google-site-verification" content="YOUR_CODE_HERE" />
   ```

2. **Add to your code:**
   - I'll add this to `app/metadata.ts` in the `verification` field
   - Or you can add it manually to `app/layout.tsx` in the `<head>` section

3. After adding, click **"Verify"** in Google Search Console

#### Option B: HTML File Upload

1. Download the HTML file Google provides
2. Upload it to: `public/google-site-verification.html`
3. Make sure it's accessible at: `https://www.immigrationai.co.za/google-site-verification.html`
4. Click **"Verify"**

#### Option C: DNS Record

1. Add a TXT record to your domain's DNS
2. Google will provide the exact record to add
3. Wait for DNS propagation (can take up to 48 hours)
4. Click **"Verify"**

**Recommended: Option A (HTML Tag)** - Fastest and easiest!

### Step 4: Submit Sitemap

1. In Google Search Console, go to **"Sitemaps"** (left sidebar)
2. Enter: `sitemap.xml`
3. Click **"Submit"**
4. Wait for Google to process (usually within hours)

### Step 5: Request Indexing (Optional but Recommended)

1. Go to **"URL Inspection"** (left sidebar)
2. Enter your homepage URL: `https://www.immigrationai.co.za`
3. Click **"Test Live URL"**
4. If it's not indexed, click **"Request Indexing"**
5. Repeat for key pages:
   - `/pricing`
   - `/visa-eligibility/uk`
   - `/visa-eligibility/canada`
   - `/visa-eligibility/usa`

---

## What to Monitor

### Daily/Weekly Checks

1. **Performance Tab**
   - See which keywords you rank for
   - Track click-through rates
   - Monitor impressions and clicks

2. **Coverage Tab**
   - Check for indexing errors
   - See which pages are indexed
   - Fix any errors immediately

3. **Enhancements Tab**
   - Check structured data
   - Fix any schema errors
   - Monitor rich results

### Monthly Reviews

1. **Search Analytics**
   - Top performing keywords
   - Pages with most traffic
   - Countries sending traffic

2. **Mobile Usability**
   - Check for mobile issues
   - Fix any problems

3. **Core Web Vitals**
   - Monitor page speed
   - Fix performance issues

---

## Quick Actions After Setup

1. ✅ **Submit sitemap** (5 minutes)
2. ✅ **Request indexing for homepage** (2 minutes)
3. ✅ **Check mobile usability** (5 minutes)
4. ✅ **Review coverage report** (10 minutes)

**Total: ~20 minutes**

---

## Troubleshooting

### "Property not verified"
- Make sure verification code is in the HTML
- Wait a few minutes after adding
- Try a different verification method

### "Sitemap couldn't be fetched"
- Check that `https://www.immigrationai.co.za/sitemap.xml` is accessible
- Make sure it's a valid XML sitemap
- Wait 24 hours and try again

### "URL not indexed"
- Request indexing manually
- Check robots.txt isn't blocking it
- Ensure page has quality content
- Wait - indexing can take days/weeks

---

## Next Steps After Verification

1. **Set up email alerts**
   - Google Search Console → Settings → Users and permissions
   - Add email for notifications

2. **Link to Google Analytics**
   - Google Search Console → Settings → Google Analytics property
   - Link your GA4 property

3. **Monitor regularly**
   - Check weekly for new keywords
   - Review monthly for trends
   - Fix issues immediately

---

**Once verified, your site will start appearing in Google search results!** 🎉
