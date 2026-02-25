# 🚀 Quick Reference - Immigration AI Project

## 🌐 Production System (LIVE - DO NOT MODIFY)

| Component | URL/Location | Status |
|-----------|--------------|--------|
| **Frontend** | https://immigrationai.co.za | ✅ Live (Vercel) |
| **Backend API** | https://api.immigrationai.co.za | ✅ Live (Hetzner) |
| **Hetzner Server** | 78.46.183.41 | ✅ Running |
| **Backend Path** | `/var/www/immigrationai/backend` | ✅ Active |
| **Process Manager** | PM2 (`immigration-backend`) | ✅ Monitoring |
| **Database** | Supabase (PostgreSQL) | ✅ Connected |

## 🛠️ Local Development Setup

### Quick Start (Safe - Won't Affect Production)

```bash
# 1. Fix permissions
sudo chown -R $USER:$USER node_modules backend/node_modules

# 2. Install dependencies
npm install
cd backend && npm install

# 3. Run setup script (optional)
./setup-project.sh

# 4. Start frontend (connects to production API by default)
npm run dev
# Visit: http://localhost:3000
```

### Environment Configuration

**Frontend** (`.env.local` in root):
```env
NEXT_PUBLIC_API_URL=https://api.immigrationai.co.za
```

**Backend** (`backend/.env` - only if running local backend):
```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://...  # Use LOCAL database, NOT production!
```

## 📁 Key Directories

- `/home/immigrant/immigration_ai/` - Frontend (Next.js)
- `/home/immigrant/immigration_ai/backend/` - Backend (Express/TypeScript)
- `/var/www/immigrationai/backend/` - **Production backend on Hetzner**

## 🔧 Common Commands

### Local Development
```bash
# Frontend
npm run dev                    # Start frontend (port 3000)

# Backend (if running locally)
cd backend
npm run dev                    # Start backend (port 4000)
npm run build                  # Build TypeScript
npx prisma generate            # Generate Prisma client
```

### Production (Hetzner Server)
```bash
# SSH into server
ssh root@78.46.183.41

# Check backend status
pm2 status
pm2 logs immigration-backend

# Restart backend
pm2 restart immigration-backend

# View logs
pm2 logs immigration-backend --lines 100
```

## 📚 Documentation Files

- `LOCAL_DEVELOPMENT_SETUP.md` - Complete local setup guide
- `HETZNER_DEPLOYMENT_SUCCESS.md` - Production deployment info
- `PRODUCTION_ARCHITECTURE.md` - System architecture
- `DEPLOYMENT_CHECKLIST.md` - Deployment procedures
- `setup-project.sh` - Automated setup script

## ⚠️ Important Notes

1. **This local copy is for development only**
2. **Production is on Hetzner/Vercel - don't modify from here**
3. **Default `.env.local` points to production API** (safe for testing)
4. **Never use production database credentials locally**
5. **Frontend auto-deploys via Vercel** when you push to Git
6. **Backend requires manual deployment** to Hetzner

## 🐛 Troubleshooting

### Permission Errors
```bash
sudo chown -R $USER:$USER node_modules backend/node_modules
```

### Can't Connect to API
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify production backend: `curl https://api.immigrationai.co.za/health`

### Port in Use
```bash
lsof -i :3000  # Find process
kill -9 <PID>  # Kill it
```

## 🎯 Development Workflow

1. Make changes locally
2. Test with `npm run dev`
3. Commit to Git
4. Push - Vercel auto-deploys frontend
5. Deploy backend manually to Hetzner if needed

---

**Last Updated**: After project migration
**Status**: Local development environment ready
