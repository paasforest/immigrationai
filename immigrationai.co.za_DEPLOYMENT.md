# 🚀 Deployment Guide for immigrationai.co.za

## Domain: `immigrationai.co.za`

### **Architecture**
```
immigrationai.co.za       → Vercel (Frontend)
api.immigrationai.co.za   → Hetzner (Backend API)
Database                  → Supabase (PostgreSQL + Storage)
```

---

## Step 1: Buy Domain

### Where to Buy `.co.za`:
- **GoDaddy SA** - https://www.godaddy.com/en-za
- **Domains.co.za** - https://domains.co.za
- **Afrihost** - https://www.afrihost.com

**Price**: R80-120/year (~$4-6/year)

### Purchase Steps:
1. Search for `immigrationai.co.za`
2. Add to cart and checkout
3. Complete registration (needs SA ID number)
4. Get DNS management access

---

## Step 2: Configure DNS Records

Log into your domain registrar's DNS management panel:

### **Records to Add:**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | (Vercel IP - get from Vercel) | Auto |
| CNAME | www | immigrationai.vercel.app | Auto |
| A | api | (Your Hetzner server IP) | Auto |

**Note**: After connecting domain to Vercel, they'll provide the exact A record IP.

---

## Step 3: Setup Supabase (Database)

See detailed guide: `SUPABASE_SETUP_GUIDE.md`

Quick steps:
1. Create project at supabase.com
2. Get DATABASE_URL
3. Create storage buckets:
   - `user-uploads` (public)
   - `documents` (public)
   - `payment-proofs` (private)
   - `temp-files` (public)
4. Copy API keys

---

## Step 4: Setup Hetzner (Backend)

See detailed guide: `DEPLOYMENT_COMPLETE.md`

### **Quick Deployment:**

```bash
# 1. SSH into Hetzner server
ssh root@YOUR_HETZNER_IP

# 2. Run setup script
cd /opt/immigration_ai/backend
bash setup-hetzner.sh

# 3. Clone and configure
git clone YOUR_REPO immigration_ai
cd immigration_ai/backend
cp .env.production.example .env
nano .env

# 4. Fill in these values:
DATABASE_URL="from-supabase"
SUPABASE_URL="from-supabase"
SUPABASE_SERVICE_KEY="from-supabase"
JWT_SECRET="generate-random-string"
OPENAI_API_KEY="your-openai-key"
FRONTEND_URL="https://immigrationai.co.za"

# 5. Install and build
npm install
npx prisma generate
npm run build

# 6. Start with PM2
pm2 start dist/app.js --name immigration-backend
pm2 save
pm2 startup
```

### **Configure Nginx:**

```bash
# Edit the template
sudo nano /etc/nginx/sites-available/immigration-api
```

Change to:
```nginx
server_name api.immigrationai.co.za;
```

```bash
# Enable and restart
sudo ln -s /etc/nginx/sites-available/immigration-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### **Get SSL Certificate:**

```bash
sudo certbot --nginx -d api.immigrationai.co.za
```

---

## Step 5: Setup Vercel (Frontend)

### **Deploy to Vercel:**

1. Go to https://vercel.com
2. Import your GitHub repository
3. Vercel will auto-detect Next.js
4. Click **Deploy**

### **Connect Custom Domain:**

1. Go to **Settings** → **Domains**
2. Enter: `immigrationai.co.za`
3. Add `www.immigrationai.co.za` too
4. Vercel provides DNS instructions

### **Add DNS Records:**

Go to your domain registrar and add:
- **A Record**: `@` → IP provided by Vercel
- **CNAME**: `www` → `immigrationai.vercel.app`

Wait 5-60 minutes for DNS to propagate.

### **Configure Environment Variables:**

Vercel Dashboard → **Settings** → **Environment Variables**:

```bash
NEXT_PUBLIC_API_URL="https://api.immigrationai.co.za"
NEXT_PUBLIC_APP_URL="https://immigrationai.co.za"
```

Click **Redeploy** to apply changes.

---

## Step 6: Update Backend Environment

On Hetzner server:

```bash
cd /opt/immigration_ai/backend
nano .env

# Update:
FRONTEND_URL="https://immigrationai.co.za"

# Restart
pm2 restart immigration-backend
```

---

## Step 7: Test Everything

### **Test Frontend:**
```bash
curl https://immigrationai.co.za
# Should return HTML
```

### **Test Backend:**
```bash
curl https://api.immigrationai.co.za/health
# Should return: {"status":"ok",...}
```

### **Test in Browser:**
1. Visit: https://immigrationai.co.za
2. Try signing up
3. Generate a SOP
4. Upload a file

---

## Cost Breakdown

| Service | Cost |
|---------|------|
| Domain (.co.za) | R80-120/year (~$5/year) |
| Vercel (Frontend) | **Free** |
| Hetzner (Backend) | €5/month (~R100/month) |
| Supabase (Database) | **Free** |
| **Total** | **~R100/month** |

---

## Monitoring

### **Check Backend Status:**
```bash
ssh root@YOUR_HETZNER_IP
pm2 status
pm2 logs immigration-backend
```

### **Check Nginx:**
```bash
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

### **Check Supabase:**
- Dashboard → Database → Check tables
- Dashboard → Storage → Check buckets

---

## Success Criteria

✅ **Frontend** loads at https://immigrationai.co.za  
✅ **Backend API** responds at https://api.immigrationai.co.za/health  
✅ SSL certificates active (green lock)  
✅ Users can signup and login  
✅ SOP generation works  
✅ File uploads to Supabase  
✅ Database connection stable  

---

## Troubleshooting

### **Domain Not Loading:**
- Check DNS propagation: https://www.whatsmydns.net
- Verify DNS records in registrar
- Wait up to 48 hours for full propagation

### **SSL Not Working:**
```bash
# Re-run certbot
sudo certbot --nginx -d api.immigrationai.co.za --force-renewal
```

### **Backend Not Responding:**
```bash
# Check PM2
pm2 status
pm2 logs immigration-backend

# Restart if needed
pm2 restart immigration-backend
```

---

## Next Steps After Launch

1. **Marketing**: Start with SA market
2. **SEO**: Optimize for immigration keywords
3. **Analytics**: Track user behavior
4. **Monitor**: Watch performance and errors
5. **Iterate**: Add features based on feedback

---

**You're all set to deploy immigrationai.co.za!** 🚀

For detailed guides:
- Hetzner: See `backend/README_DEPLOYMENT.md`
- Supabase: See `SUPABASE_SETUP_GUIDE.md`
- Vercel: See `VERCEL_SETUP_GUIDE.md`


