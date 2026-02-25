# 🚀 Quick Setup Instructions

## ⚠️ IMPORTANT: Fix Permissions First!

Your `node_modules` directories are owned by `root` (from the previous system). You need to fix this:

```bash
cd /home/immigrant/immigration_ai
sudo chown -R $USER:$USER node_modules
sudo chown -R $USER:$USER backend/node_modules
```

## 📦 Install Missing Dependencies

After fixing permissions, install dependencies:

```bash
# Frontend
cd /home/immigrant/immigration_ai
npm install

# Backend  
cd /home/immigrant/immigration_ai/backend
npm install
```

## 🔧 Or Use the Automated Script

I've created a setup script that does everything:

```bash
cd /home/immigrant/immigration_ai
./setup-project.sh
```

## ✅ What's Already Working

- ✅ Node.js v18.19.1 installed
- ✅ npm installed
- ✅ Project structure intact
- ✅ Environment files exist
- ✅ Prisma client generated
- ✅ All code files present

## ⚠️ What Needs Attention

1. **Permissions**: `node_modules` owned by root (needs fixing)
2. **Dependencies**: May need reinstalling after permission fix
3. **Port Configuration**: 
   - Backend defaults to port **4000** (or 3001 if PORT env var is set)
   - Frontend API client defaults to port **4000**
   - Make sure `.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:4000` (or match your backend port)

## 🎯 Next Steps

1. Run the setup script or manually fix permissions
2. Install dependencies
3. Verify environment variables in `backend/.env` and `.env.local`
4. Start backend: `cd backend && npm run dev`
5. Start frontend: `npm run dev`

See `PROJECT_SETUP_GUIDE.md` for detailed instructions.
