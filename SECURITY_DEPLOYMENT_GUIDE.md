# 🔒 Critical Security Fixes - Deployment Guide

## 🚨 URGENT: Deploy These Security Fixes Immediately

Your production server needs these critical security updates to prevent:
- 🔴 **Authentication bypass attacks**
- 🔴 **Data leakage through logs**
- 🔴 **CORS security vulnerabilities**

---

## ⚡ Quick Deployment (5 Minutes)

### Option 1: Deploy from Hetzner Server (Recommended)

```bash
# 1. SSH into your Hetzner server
ssh root@YOUR_HETZNER_IP

# 2. Navigate to your backend directory
cd /opt/immigration_ai/backend

# 3. Pull latest security fixes
git pull origin main

# 4. Run the security deployment script
./deploy-security-fixes.sh
```

The script will:
- ✅ Check if JWT secrets are set
- ✅ Generate secure secrets if needed
- ✅ Update your .env file
- ✅ Build and deploy the fixes
- ✅ Restart your server with PM2

---

### Option 2: Manual Deployment

If you prefer manual control:

```bash
# 1. SSH into server
ssh root@YOUR_HETZNER_IP

# 2. Navigate to backend
cd /opt/immigration_ai/backend

# 3. Pull latest code
git pull origin main

# 4. Generate JWT secrets (if not already set)
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")

# 5. Update .env file
nano .env

# Add these lines (replace with your generated values):
JWT_SECRET=your-long-random-string-here
REFRESH_TOKEN_SECRET=your-different-long-random-string-here
NODE_ENV=production

# 6. Build and deploy
npm install
npx prisma generate
npm run build

# 7. Restart PM2
pm2 restart immigration-backend

# 8. Check logs
pm2 logs immigration-backend --lines 50
```

---

## ✅ Verification Checklist

After deployment, verify these:

### 1. Check Server is Running
```bash
pm2 status
# Should show: immigration-backend | online
```

### 2. Check Health Endpoint
```bash
curl http://localhost:4000/health
# Should return: {"status":"ok",...}
```

### 3. Check Logs for Errors
```bash
pm2 logs immigration-backend --lines 50
# Should NOT see "FATAL SECURITY ERROR"
```

### 4. Verify JWT Secrets
```bash
# On server
cd /opt/immigration_ai/backend
grep "JWT_SECRET" .env
# Should show long random strings (not "your-secret-key-change-this")
```

### 5. Test Authentication
Try logging in from your frontend - should work normally.

---

## 🚨 Troubleshooting

### Server Won't Start - "FATAL SECURITY ERROR"

**Problem**: JWT secrets not set or too short

**Solution**:
```bash
# Generate new secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Add to .env with at least 32 characters
JWT_SECRET=<generated-value-here>
REFRESH_TOKEN_SECRET=<different-generated-value-here>

# Restart
pm2 restart immigration-backend
```

### Server Keeps Restarting

**Check logs**:
```bash
pm2 logs immigration-backend --lines 100
```

**Common issues**:
1. Database connection failed → Check DATABASE_URL
2. Missing environment variables → Check .env file
3. Port already in use → Check if another process is using port 4000

### Users Can't Login After Update

**Don't worry!** This is expected if you changed JWT secrets.

**Solutions**:
1. **Option A** (Recommended): Users just need to login again
2. **Option B**: Use your old JWT secrets (if you had them before)

---

## 📋 What Changed

### 1. JWT Configuration (backend/src/config/jwt.ts)
**Before**:
```typescript
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
```

**After**:
```typescript
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be set...');
}
```

**Impact**: Server refuses to start without proper secrets

---

### 2. Query Logging (backend/src/config/database.ts)
**Before**:
```typescript
console.log('Executed query', { text, duration, rows });
```

**After**:
```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('Executed query', { text, duration, rows });
} else {
  console.log('Query executed', { duration, rows }); // No sensitive data
}
```

**Impact**: Sensitive data no longer leaked in production logs

---

### 3. CORS Security (backend/src/app.ts)
**Before**:
```typescript
origin: process.env.FRONTEND_URL || 'http://localhost:3000',
```

**After**:
```typescript
origin: function(origin, callback) {
  if (!origin || allowedOrigins.includes(origin)) {
    callback(null, true);
  } else {
    callback(new Error('Not allowed by CORS'));
  }
}
```

**Impact**: Only your frontend can access the API

---

## 🎯 Production Checklist

Ensure these are set on your Hetzner server:

```bash
# Required environment variables (.env file)
NODE_ENV=production
PORT=4000
JWT_SECRET=<64+ character random string>
REFRESH_TOKEN_SECRET=<different 64+ character random string>
DATABASE_URL=postgresql://...
FRONTEND_URL=https://your-domain.com
OPENAI_API_KEY=sk-...

# Optional but recommended
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
```

---

## 🚀 Deployment Commands Reference

```bash
# View logs
pm2 logs immigration-backend

# Check status
pm2 status

# Monitor in real-time
pm2 monit

# Restart if needed
pm2 restart immigration-backend

# Stop server
pm2 stop immigration-backend

# Start server
pm2 start immigration-backend

# View environment variables
pm2 env immigration-backend
```

---

## 📞 Support

If you encounter issues:

1. **Check logs**: `pm2 logs immigration-backend --lines 100`
2. **Check process**: `pm2 status`
3. **Check .env**: Ensure all required variables are set
4. **Test health**: `curl http://localhost:4000/health`
5. **Check firewall**: `sudo ufw status`

---

## ✅ Post-Deployment

After successful deployment:

1. ✅ Server is running (`pm2 status`)
2. ✅ Health endpoint responds
3. ✅ Users can login from frontend
4. ✅ No errors in PM2 logs
5. ✅ JWT secrets are secure (64+ chars)

**Your server is now secure! 🎉**

---

*Last Updated: November 3, 2025*
*Security Fixes Version: 1.0*

