# 🗄️ Supabase Setup Guide - Immigration AI

## Quick Setup (5 Minutes)

### Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Click "Sign In" (create account if needed - **free tier available**)
3. Click "New Project"
4. Fill in:
   - **Name**: `Immigration AI`
   - **Database Password**: Generate strong password ⚠️ **SAVE THIS!**
   - **Region**: Choose closest to your users:
     - EU Central (Falkenstein) - **Recommended for Hetzner**
     - US East (Ohio) - For US users
     - AP Southeast (Singapore) - For Asia
5. Click "Create new project"
6. Wait 2-3 minutes for provisioning

---

### Step 2: Configure Database

#### Get Connection String

1. In Supabase Dashboard → **Settings** → **Database****
2. Scroll down to **"Connection string"** → **URI**
3. Copy the URL that looks like:
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

**Important**: Use the **Pooler** port (6543) for connection pooling in production!

#### Configure Supabase API Keys

1. Go to **Settings** → **API**
2. Copy these two keys:
   - **anon/public key**: Starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: Starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

⚠️ **Keep service_role key SECRET** - it has full database access!

---

### Step 3: Create Storage Buckets

#### Create 4 Storage Buckets

1. Go to **Storage** → Click "New bucket"

Create these 4 buckets:

| Bucket Name | Public? | Purpose |
|-------------|---------|---------|
| `user-uploads` | ✅ YES | Profile images, user files |
| `documents` | ✅ YES | SOPs, letters, PDFs |
| `payment-proofs` | ❌ NO | Payment screenshots (private) |
| `temp-files` | ✅ YES | Temporary uploads |

**How to create:**
- Click "New bucket"
- Name: Enter bucket name
- Public bucket: Toggle ON/OFF
- Click "Create bucket"

---

### Step 4: Set Up Database Tables

#### Run Prisma Migrations

```bash
# On your Hetzner server
cd /opt/immigration_ai/backend

# Generate Prisma client
npx prisma generate

# Push schema to Supabase
npx prisma db push

# Or create migration
npx prisma migrate deploy
```

#### Verify Database

```bash
# Open Prisma Studio to view database
npx prisma studio

# This opens web interface at localhost:5555
# You'll see all your tables with data
```

---

### Step 5: Configure Storage Policies (Optional)

By default, all buckets are private. To make files accessible:

**In Supabase Dashboard → Storage → Policies:**

For each bucket you want to be accessible:

```sql
-- Allow public read access
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'bucket-name');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated Upload" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'bucket-name');
```

Or use the UI:
1. Go to **Storage** → Select bucket
2. Click **"Policies"** tab
3. Click **"New Policy"**
4. Choose template or write custom SQL

---

## Environment Variables for Backend

Update your Hetzner server `.env` file:

```bash
# Database (Supabase)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"

# Supabase API
SUPABASE_URL="https://[PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." # Get from API settings
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." # Get from API settings

# Storage Buckets (optional, defaults work fine)
STORAGE_BUCKET_USER_UPLOADS="user-uploads"
STORAGE_BUCKET_DOCUMENTS="documents"
STORAGE_BUCKET_PAYMENT_PROOFS="payment-proofs"
```

---

## Testing Supabase Setup

### Test Database Connection

```bash
# From Hetzner server
cd /opt/immigration_ai/backend
npx prisma studio

# Should open database GUI in browser
```

### Test Storage Upload

```bash
# Test upload via API
curl -X POST https://api.yourdomain.com/api/upload/profile-image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@test-image.jpg"
```

Check in Supabase Dashboard → Storage → user-uploads bucket

---

## Supabase Dashboard Features

### Database Tab
- View tables, run queries
- Filter data
- Export data
- Real-time subscriptions

### Storage Tab
- Upload/download files
- View file details
- Set file expiration
- Manage quotas

### API Tab
- REST API auto-generated
- GraphQL endpoint
- API documentation
- API settings

### Auth Tab
- User management
- Email templates
- OAuth providers
- Session management

### Settings Tab
- Database credentials
- API keys
- Security settings
- Billing

---

## Free Tier Limits

✅ **Free tier includes:**
- 500MB database
- 1GB file storage
- 2GB bandwidth
- 500MB database backups
- Community support

**Upgrade to Pro ($25/month) when:**
- Database exceeds 500MB
- Need >1GB file storage
- Need >50MB database backups
- Want daily backups
- Need priority support

---

## Backup Strategy

### Automatic Backups
Supabase automatically backs up daily (paid plans)
- Stored for 7 days (Pro plan)
- Can restore to any point in time
- Manual backups always available

### Manual Backup
```bash
# From your local machine
pg_dump "YOUR_DATABASE_URL" > backup.sql

# Restore
psql "YOUR_DATABASE_URL" < backup.sql
```

---

## Security Best Practices

### Database Security
- ✅ Use connection pooling (pooler port 6543)
- ✅ Enable SSL/TLS connections
- ✅ Use Row Level Security (RLS) for sensitive data
- ✅ Rotate database password regularly

### API Security
- ✅ Never expose service_role key to frontend
- ✅ Use anon key for client-side operations
- ✅ Validate file uploads on backend
- ✅ Set appropriate bucket policies

### Storage Security
- ✅ Make buckets private unless needed
- ✅ Validate file types and sizes
- ✅ Scan uploads for malware
- ✅ Set file expiration dates

---

## Monitoring Supabase

### Dashboard Metrics
- Database size
- Storage usage
- API requests
- Bandwidth usage
- Active connections

### Alerts
Set up alerts for:
- High database size (>400MB warning)
- Storage approaching limit
- High API request rate
- Unusual query patterns

---

## Troubleshooting

### Connection Issues
```bash
# Test connection
psql "YOUR_DATABASE_URL"

# Check Supabase status
# Visit: https://status.supabase.com
```

### Migration Failures
```bash
# Reset and re-run migrations
npx prisma migrate reset
npx prisma migrate deploy
```

### Storage Upload Failures
1. Check bucket exists in Supabase Dashboard
2. Verify service_role key is correct
3. Check file size (<10MB)
4. Verify file type is allowed

---

## Production Checklist

- [ ] ✅ Supabase project created
- [ ] ✅ Database password saved securely
- [ ] ✅ Connection string configured
- [ ] ✅ API keys added to backend
- [ ] ✅ Storage buckets created
- [ ] ✅ Database migrations run
- [ ] ✅ Storage policies configured
- [ ] ✅ Health check working
- [ ] ✅ File upload tested
- [ ] ✅ Backup strategy in place
- [ ] ✅ Monitoring alerts set up

---

## Next: Vercel Deployment

Once Supabase is set up, proceed to Vercel frontend deployment!

**Estimated time: 5 minutes**
**Cost: €0/month (free tier)**


