# 🏗️ Production Architecture: Supabase + Vercel + Hetzner

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         USER                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    Vercel (Frontend)                         │
│  - Next.js Application                                       │
│  - Edge Network (Global CDN)                                │
│  - Auto-scaling                                              │
│  - SSL Included                                              │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│              Hetzner VPS (Backend API)                       │
│  - Express.js API                                            │
│  - Authentication                                            │
│  - OpenAI Integration                                         │
│  - Business Logic                                             │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────┐
        │   Supabase (PostgreSQL + Storage)│
        │  - Database                      │
        │  - Images/Files Storage         │
        │  - Auto Backups                 │
        └─────────────────────────────────┘
```

---

## Why This Architecture Is Perfect

✅ **Vercel** = Best Next.js hosting (free tier, auto-scaling, global CDN)  
✅ **Supabase** = Database + File storage (images for user uploads, documents)  
✅ **Hetzner** = Cheap, powerful backend API  
✅ **Result** = Fast, cheap, scalable, professional

---

## Step 1: Supabase Setup (Database + Storage)

### 1.1 Create Supabase Project
```bash
1. Go to https://supabase.com
2. Create new project: "Immigration AI"
3. Choose region (Falkenstein, Germany recommended)
4. Copy DATABASE_URL and ANON_KEY
```

### 1.2 Create Storage Buckets
```bash
# In Supabase Dashboard → Storage → Create Bucket

Buckets needed:
1. user-uploads      (for profile images)
2. documents         (for SOPs, letters, etc.)
3. payment-proofs    (for payment screenshots)
4. temp-files        (for temporary uploads)
```

### 1.3 Configure Storage Policies
```sql
-- Allow authenticated users to upload their own files
CREATE POLICY "Users can upload to user-uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'user-uploads');

-- Allow users to read their own files
CREATE POLICY "Users can read own uploads"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'user-uploads');
```

### 1.4 Get Connection Strings
```bash
# Database URL
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres

# Storage URLs
https://[PROJECT-REF].supabase.co/storage/v1/object/public/
```

### 1.5 Run Migrations
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy  # Creates all tables in Supabase
```

---

## Step 2: Deploy Backend to Hetzner

### 2.1 Create Hetzner VPS
```bash
- Size: CX21 (€4.87/month) or CX31 (€11.78/month)
- OS: Ubuntu 22.04
- Location: Falkenstein, Germany (closest to Supabase)
```

### 2.2 Server Setup
```bash
# SSH into server
ssh root@YOUR_SERVER_IP

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install nginx
sudo apt install nginx -y
```

### 2.3 Deploy Backend
```bash
# Clone repo
cd /opt
git clone https://github.com/YOUR_REPO/immigration_ai.git
cd immigration_ai/backend

# Install dependencies
npm install

# Build
npm run build

# Create .env file
nano .env
```

### 2.4 Backend .env Configuration
```bash
# Database (Supabase)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"

# Supabase Storage
SUPABASE_URL="https://[PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_KEY="your-service-key-here"

# Supabase Storage Buckets
STORAGE_BUCKET_USER_UPLOADS="user-uploads"
STORAGE_BUCKET_DOCUMENTS="documents"
STORAGE_BUCKET_PAYMENT_PROOFS="payment-proofs"

# JWT Secrets
JWT_SECRET="generate-strong-random-string-min-32-chars"
JWT_REFRESH_SECRET="generate-strong-random-string-min-32-chars"

# OpenAI
OPENAI_API_KEY="sk-your-openai-api-key"

# Frontend URL (Vercel)
FRONTEND_URL="https://yourdomain.vercel.app"

# Node
NODE_ENV=production
PORT=4000
```

### 2.5 Start with PM2
```bash
npx prisma generate
pm2 start dist/app.js --name immigration-backend
pm2 save
pm2 startup
```

### 2.6 Configure Nginx Reverse Proxy
```bash
sudo nano /etc/nginx/sites-available/immigration-api
```

Add configuration:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    # Increase upload limits for file uploads
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/immigration-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Connect GitHub to Vercel
1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "Add New Project"
4. Import your repository
5. Configure project:

```bash
# Vercel will auto-detect Next.js
Framework Preset: Next.js
Root Directory: ./
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### 3.2 Configure Environment Variables in Vercel
Go to Project Settings → Environment Variables:

```bash
# Backend API
NEXT_PUBLIC_API_URL="https://api.yourdomain.com"

# Supabase (if needed in frontend)
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Optional
NEXT_PUBLIC_APP_URL="https://yourdomain.vercel.app"
```

### 3.3 Deploy
Click "Deploy" - Vercel will handle the rest!

---

## Step 4: Add Image/File Upload to Your Backend

Create a new service for Supabase Storage integration:

```typescript
// backend/src/services/supabaseStorage.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export class SupabaseStorageService {
  
  // Upload file to Supabase Storage
  async uploadFile(
    bucket: string,
    fileName: string,
    fileBuffer: Buffer,
    userId: string
  ): Promise<string> {
    const path = `${userId}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, fileBuffer, {
        contentType: 'image/jpeg', // Adjust based on file type
        upsert: false
      });

    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return urlData.publicUrl;
  }

  // Delete file from Supabase Storage
  async deleteFile(bucket: string, filePath: string): Promise<void> {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  // Get file URL
  getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  }
}

export const supabaseStorageService = new SupabaseStorageService();
```

### Install Supabase Client
```bash
cd backend
npm install @supabase/supabase-js
```

---

## Step 5: Add File Upload API Endpoint

```typescript
// backend/src/routes/upload.routes.ts
import { Router } from 'express';
import multer from 'multer';
import { authenticateJWT } from '../middleware/auth';
import { supabaseStorageService } from '../services/supabaseStorage';

const router = Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// All routes require authentication
router.use(authenticateJWT);

// Upload profile image
router.post('/profile-image', upload.single('image'), async (req, res) => {
  try {
    const userId = req.user?.userId;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileName = `profile-${Date.now()}.jpg`;
    const url = await supabaseStorageService.uploadFile(
      'user-uploads',
      fileName,
      file.buffer,
      userId!
    );

    res.json({ success: true, url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Upload document
router.post('/document', upload.single('document'), async (req, res) => {
  try {
    const userId = req.user?.userId;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileName = `doc-${Date.now()}.pdf`;
    const url = await supabaseStorageService.uploadFile(
      'documents',
      fileName,
      file.buffer,
      userId!
    );

    res.json({ success: true, url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

Add to main app:
```typescript
// backend/src/app.ts
import uploadRoutes from './routes/upload.routes';

// Add after other routes
app.use('/api/upload', uploadRoutes);
```

---

## Step 6: Add File Upload to Frontend

Create a component for image uploads:

```typescript
// components/ImageUpload.tsx
'use client';

import { useState } from 'react';

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
}

export function ImageUpload({ onUploadComplete }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload/profile-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: formData,
      });

      const data = await response.json();
      onUploadComplete(data.url);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
    </div>
  );
}
```

---

## Cost Breakdown

### Vercel (Frontend)
- **Free Tier**: 100GB bandwidth, unlimited requests
- **Pro**: $20/month (only if you need more bandwidth)
- **Perfect for**: Your Next.js app
- **Estimated**: **€0/month**

### Hetzner (Backend)
- **CX21**: €4.87/month (2GB RAM, sufficient for API)
- **CX31**: €11.78/month (4GB RAM, if you scale)
- **Estimated**: **€5–12/month**

### Supabase (Database + Storage)
- **Free Tier**: 500MB database, 1GB file storage
- **Pro**: $25/month (more storage + daily backups)
- **Estimated**: **€0–25/month**

### Total: **€5–37/month**
*(Likely €5/month if you stay on free tiers)*

---

## Security Checklist

✅ SSL Certificates (free from Let's Encrypt)  
✅ Environment variables for all secrets  
✅ Row Level Security in Supabase  
✅ CORS configured properly  
✅ Rate limiting enabled (already in your code)  
✅ File upload size limits  
✅ Content type validation  

---

## Performance Optimization

### 1. Enable Supabase Connection Pooling
```bash
# Use this URL for production (in your .env)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
```
*Note: Pooler port is 6543, not 5432*

### 2. Enable Caching
Add Redis to Hetzner for session caching (optional but recommended)

### 3. CDN for Images
Supabase provides automatic CDN for your uploaded files

---

## Monitoring

### Vercel Analytics
- Built-in analytics dashboard
- Page views, performance metrics
- Error tracking

### Hetzner Monitoring
```bash
pm2 monit          # Real-time backend monitoring
pm2 logs           # View logs
htop                # CPU/Memory usage
```

### Supabase Dashboard
- Database connections
- Storage usage
- API requests
- Real-time monitoring

---

## Deployment Workflow

### Development
```bash
# Local development
npm run dev         # Frontend
npm run dev         # Backend (in backend/ folder)

# Use local Supabase instance or your remote project
```

### Staging
```bash
# Deploy backend to Hetzner
cd backend && pm2 restart immigration-backend

# Deploy frontend to Vercel (staging branch)
git push origin staging
```

### Production
```bash
# Auto-deploys on push to main
git push origin main
```

---

## Recommended Next Steps

1. **Set up Supabase project** (database + storage)
2. **Deploy backend to Hetzner** (follow Step 2)
3. **Deploy frontend to Vercel** (follow Step 3)
4. **Add image upload feature** (Step 4-5)
5. **Configure domain** (point to Vercel)
6. **Set up monitoring** (optional but recommended)
7. **Enable SSL** (automatic on Vercel, manual on Hetzner with Certbot)

---

**This architecture gives you the best of all worlds! 🚀**


