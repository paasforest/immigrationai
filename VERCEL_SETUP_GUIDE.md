# 🚀 Vercel Setup Guide - Immigration AI Frontend

## Quick Setup (5 Minutes)

### Step 1: Prepare GitHub Repository

**Make sure your code is pushed to GitHub:**
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

---

### Step 2: Create Vercel Account

1. Go to https://vercel.com
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"** (recommended)
4. Authorize Vercel to access your repositories

---

### Step 3: Deploy Your Project

#### Automatic Deployment (Recommended)

1. In Vercel dashboard, click **"Add New Project"**
2. Select your `immigration_ai` repository
3. Click **"Import"**

Vercel auto-detects Next.js! ✅

#### Configure Project Settings

**Leave defaults or verify:**
- **Framework Preset**: Next.js ✅
- **Root Directory**: `./` ✅
- **Build Command**: `npm run build` ✅
- **Output Directory**: `.next` ✅
- **Install Command**: `npm install` ✅
- **Node Version**: 20.x ✅

Click **"Deploy"**

Wait 2-3 minutes for first deployment...

---

### Step 4: Configure Environment Variables

Once deployed, go to your project **Settings** → **Environment Variables**

Add these variables:

```bash
# Backend API URL (your Hetzner server)
NEXT_PUBLIC_API_URL="https://api.yourdomain.com"

# Frontend URL (auto-generated or your domain)
NEXT_PUBLIC_APP_URL="https://yourproject.vercel.app"

# Optional: Supabase (if using client-side)
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

#### For Each Environment:
- ✅ **Production**: Add variables
- ✅ **Preview**: Add same variables
- ✅ **Development**: Add same variables

**Click "Redeploy"** to apply changes

---

### Step 5: Custom Domain (Optional)

#### Connect Domain

1. Go to **Settings** → **Domains**
2. Enter your domain: `yourdomain.com`
3. Click **"Add"**

Vercel provides DNS records to add:
- **A Record**: Point to Vercel IP
- **CNAME**: Point to `yourproject.vercel.app`

#### Update DNS

In your domain registrar (e.g., Namecheap, GoDaddy):
1. Add the DNS records Vercel provides
2. Wait 24-48 hours for DNS propagation
3. SSL certificate auto-configures

---

## Continuous Deployment

### Automatic Deployments

**Every push to main branch:**
- ✅ Auto-deploys to production
- ✅ Build runs automatically
- ✅ Notifications sent (optional)

**Pull Requests:**
- ✅ Auto-creates preview deployment
- ✅ Unique URL for each PR
- ✅ Test before merging

**Push to trigger deployment:**
```bash
git push origin main
# Vercel automatically deploys!
```

---

## Environment-Specific Configs

### Production
- **URL**: `https://yourproject.vercel.app`
- **Branch**: `main`
- **Auto-deploy**: Yes

### Preview
- **URL**: `https://immigration-ai-git-branch-name.vercel.app`
- **Branch**: Any branch except main
- **Auto-deploy**: Yes (on push)

### Development
- **URL**: Localhost
- **Local**: `npm run dev`
- **For testing**: Local development

---

## Vercel Dashboard Features

### Deployments Tab
- View all deployments
- Redeploy previous version
- View build logs
- Download artifacts

### Analytics Tab
- Page views
- Unique visitors
- Performance metrics
- Top pages

### Functions Tab
- Serverless functions (if using)
- Logs and metrics
- Execution times

### Settings Tab
- Environment variables
- Build settings
- Domain configuration
- Team management

---

## Build Configuration

### vercel.json (Optional)

Create `vercel.json` in project root for custom config:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET, POST, PUT, DELETE" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type" }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```

**Usually not needed** - Next.js is auto-configured!

---

## Performance Optimizations

### Image Optimization
Vercel automatically:
- ✅ Optimizes Next.js Image components
- ✅ Generates multiple sizes
- ✅ Serves via global CDN
- ✅ Lazy loads images

### Static Optimization
- ✅ Pre-renders static pages
- ✅ Generates static HTML
- ✅ Caches on edge network
- ✅ Instant page loads

### Edge Network
- ✅ Global CDN (150+ locations)
- ✅ Automatic caching
- ✅ DDoS protection
- ✅ HTTP/2 and HTTP/3

---

## Monitoring & Analytics

### Vercel Analytics (Free Tier)
- Real-time analytics
- Page view tracking
- Performance metrics
- Web Vitals (Core Web Vitals)

Enable in `app/layout.tsx`:
```tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Error Tracking
Add Sentry for error tracking:
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] Code pushed to GitHub
- [ ] .env.local configured locally
- [ ] Build runs successfully locally
- [ ] All features tested

### Environment Variables
- [ ] Production variables added
- [ ] Preview variables added
- [ ] Development variables configured
- [ ] Sensitive keys secured

### DNS & Domain
- [ ] Domain connected (optional)
- [ ] DNS records updated
- [ ] SSL certificate active
- [ ] Domain verified

### Post-Deployment
- [ ] Frontend loads correctly
- [ ] API calls working
- [ ] Authentication works
- [ ] File uploads working
- [ ] Images loading
- [ ] No console errors

---

## Troubleshooting

### Build Fails
```bash
# Check build logs in Vercel dashboard
# Common issues:
# - Missing environment variables
# - Build command error
# - TypeScript errors
# - Missing dependencies
```

### API Calls Fail
```bash
# Verify NEXT_PUBLIC_API_URL is correct
# Check CORS on backend
# Verify backend is running
# Check browser console for errors
```

### Domain Not Working
```bash
# Check DNS records
# Wait for DNS propagation (24-48h)
# Verify domain in Vercel dashboard
# Try "Redeploy" in Vercel
```

---

## Free Tier Limits

✅ **Free tier includes:**
- Unlimited deployments
- 100GB bandwidth/month
- Serverless function execution
- DDoS protection
- SSL certificates
- Continuous deployment
- Preview deployments

**Upgrade to Pro ($20/month) when:**
- Need >100GB bandwidth
- Need team collaboration
- Want more advanced features
- Need support SLA

---

## Production Checklist

- [ ] ✅ Vercel account created
- [ ] ✅ GitHub repository connected
- [ ] ✅ Project deployed successfully
- [ ] ✅ Environment variables configured
- [ ] ✅ Custom domain connected (optional)
- [ ] ✅ SSL certificate active
- [ ] ✅ Analytics enabled
- [ ] ✅ Build logs reviewed
- [ ] ✅ Tested all features
- [ ] ✅ Performance optimized
- [ ] ✅ Monitoring set up

---

## Next: Full Stack Integration

Now connect all three:
1. ✅ **Supabase**: Database + Storage
2. ✅ **Vercel**: Frontend
3. ✅ **Hetzner**: Backend API

All ready to go! 🎉

**Total deployment time: ~15 minutes**
**Cost: €5/month total**


