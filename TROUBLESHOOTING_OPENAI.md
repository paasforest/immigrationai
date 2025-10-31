# 🔧 Troubleshooting OpenAI Connection Issues

## Problem Summary

The OpenAI API is not working on your Hetzner production server. Based on the logs, the local development environment is working fine, but the production deployment needs attention.

---

## 🎯 Quick Diagnosis Steps

### Step 1: SSH into Your Hetzner Server

You need to access your Hetzner server to check the configuration. Based on the deployment guides, your code should be at:

```bash
# SSH into your Hetzner server
ssh root@YOUR_HETZNER_SERVER_IP

# Navigate to your backend directory
cd /opt/immigration_ai/backend
# OR if deployed differently:
cd ~/immigration_ai/backend
```

**Can't find your server IP?** Check your Hetzner cloud console at https://console.hetzner.cloud

---

## 🔍 Step 2: Check Environment Variables

The most common issue is that the `OPENAI_API_KEY` is missing or incorrect on the production server.

```bash
# Check if .env file exists
ls -la .env

# View the .env file (be careful - this contains secrets)
cat .env | grep OPENAI_API_KEY

# Check if the key is set
echo $OPENAI_API_KEY
```

**What to look for:**
- ✅ `OPENAI_API_KEY` should start with `sk-` and be a long string
- ❌ If it's missing, empty, or shows as `OPENAI_API_KEY=`, that's the problem!

---

## 🛠️ Step 3: Fix Missing API Key

If the API key is missing or incorrect, you need to add it:

```bash
# Edit the .env file
nano .env

# Add or update this line:
OPENAI_API_KEY=sk-your-actual-openai-api-key-here

# Save and exit (Ctrl+X, then Y, then Enter)
```

**Where to get your OpenAI API Key:**
1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (you'll only see it once!)
4. Paste it into your `.env` file

---

## 🔄 Step 4: Restart PM2 Process

After updating the `.env` file, restart your backend:

```bash
# Check current PM2 status
pm2 status

# Restart the backend
pm2 restart immigration-backend

# OR if it's not running:
pm2 start dist/app.js --name immigration-backend

# View logs to see if it starts successfully
pm2 logs immigration-backend --lines 50
```

---

## 🔍 Step 5: Verify the Fix

Test if OpenAI is now working:

```bash
# Check the logs for errors
pm2 logs immigration-backend --lines 100 | grep -i "openai"

# Try a test API call
curl http://localhost:4000/health

# Test if OpenAI integration works
curl -X POST http://localhost:4000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, test"}'
```

---

## 📊 Common Error Messages & Solutions

### Error: "OPENAI_API_KEY is not set"

**Problem:** The environment variable is not configured.

**Solution:** 
1. Check your `.env` file has `OPENAI_API_KEY=sk-...`
2. Restart PM2: `pm2 restart immigration-backend`
3. Verify with: `pm2 logs immigration-backend`

---

### Error: "Incorrect API key provided"

**Problem:** The API key is invalid or expired.

**Solution:**
1. Generate a new API key at https://platform.openai.com/api-keys
2. Update `.env` file with the new key
3. Restart PM2

---

### Error: "Rate limit exceeded"

**Problem:** You've used up your OpenAI quota.

**Solution:**
1. Check your usage at https://platform.openai.com/usage
2. Add billing credits if needed
3. Wait for the rate limit to reset

---

### Error: "Failed to connect to OpenAI"

**Problem:** Network connectivity or firewall issue.

**Solution:**
1. Check if your server can reach OpenAI: `curl https://api.openai.com/v1/models`
2. Check firewall rules: `sudo ufw status`
3. Ensure port 443 (HTTPS) is open

---

## 🌐 Frontend Configuration Check

Also verify that your frontend on Vercel is pointing to the correct backend URL:

1. **Go to your Vercel dashboard**
2. **Select your project** (immigration_ai)
3. **Go to Settings → Environment Variables**
4. **Check `NEXT_PUBLIC_API_URL`** is set to:
   - Your Hetzner IP: `http://YOUR_SERVER_IP:4000` (if testing)
   - Or your domain: `https://api.yourdomain.com` (if SSL is configured)

---

## 🚨 Emergency Testing

If you need to test quickly without SSH access:

### Test 1: Check if backend is reachable

From your local machine:
```bash
curl https://api.yourdomain.com/health
# OR if no domain:
curl http://YOUR_HETZNER_IP:4000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-XX...",
  "uptime": 12345
}
```

### Test 2: Check OpenAI endpoint

```bash
curl -X POST http://YOUR_HETZNER_IP:4000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'
```

**If this fails**, the issue is definitely on the Hetzner server.

---

## 📝 Additional Checks

### Check 1: Verify PM2 is Running

```bash
pm2 status
pm2 logs immigration-backend --lines 50
```

Should show:
- ✅ `immigration-backend` is `online`
- ✅ Recent startup logs
- ✅ Database connection successful
- ✅ No OpenAI errors

### Check 2: Verify Build is Current

```bash
# Pull latest code
git pull origin main

# Rebuild
npm run build

# Restart
pm2 restart immigration-backend
```

### Check 3: Check Server Resources

```bash
# Check memory usage
free -h

# Check disk space
df -h

# Check if Node.js is running
ps aux | grep node
```

---

## 🔗 Important Files Reference

Based on your project structure:

**Backend Directory:**
- `/opt/immigration_ai/backend/` or `~/immigration_ai/backend/`
- `.env` file location
- `dist/` folder with compiled code
- `logs/` folder with PM2 logs

**Key Files:**
- `backend/.env` - Environment variables
- `backend/src/services/aiService.ts` - OpenAI integration
- `backend/src/config/openai.ts` - OpenAI configuration

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ PM2 shows `immigration-backend` as `online`
2. ✅ No "OPENAI_API_KEY is not set" errors in logs
3. ✅ Health check returns `{"status":"ok"}`
4. ✅ Frontend can generate SOPs successfully
5. ✅ Users report no errors when using AI features

---

## 🆘 Still Not Working?

If you've tried everything above and it's still not working:

1. **Check Hetzner Server Logs:**
   ```bash
   pm2 logs immigration-backend --err --lines 200
   ```

2. **Test OpenAI from Server:**
   ```bash
   # SSH into Hetzner
   curl -X POST https://api.openai.com/v1/chat/completions \
     -H "Authorization: Bearer $OPENAI_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"test"}],"max_tokens":10}'
   ```

3. **Check Network Connectivity:**
   ```bash
   ping api.openai.com
   ```

4. **Contact Support:**
   - Share the error logs
   - Share your server's region
   - Share any firewall configuration

---

## 📞 Quick Reference Commands

```bash
# SSH into Hetzner
ssh root@YOUR_SERVER_IP

# Navigate to backend
cd /opt/immigration_ai/backend

# Edit environment variables
nano .env

# Check PM2 status
pm2 status

# Restart backend
pm2 restart immigration-backend

# View logs
pm2 logs immigration-backend

# Check environment variables are loaded
pm2 env 0

# Test health
curl http://localhost:4000/health

# Pull latest code and redeploy
git pull origin main
npm run build
pm2 restart immigration-backend
```

---

## 🎯 Most Likely Issue

Based on the symptoms described, **95% of the time**, the issue is:

**The `OPENAI_API_KEY` is missing or incorrect in the `.env` file on your Hetzner server.**

Fix it by:
1. SSH into Hetzner
2. Edit `.env` file
3. Add/correct `OPENAI_API_KEY=sk-...`
4. Restart PM2
5. Test

This should resolve the issue immediately!

---

**Need more help?** Check the error logs and share what you see. The logs will tell you exactly what's wrong.


