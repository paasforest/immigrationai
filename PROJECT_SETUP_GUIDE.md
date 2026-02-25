# 🚀 Immigration AI - Project Setup Guide

## 📋 Project Overview

This is a **full-stack Immigration AI platform** built with:
- **Frontend**: Next.js 13.5.1 (React 18, TypeScript)
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **AI**: OpenAI GPT-4 for document generation
- **Payments**: Stripe integration
- **Email**: SendGrid integration

## 🔍 Current Project Status

### ✅ What's Already Installed
- Node.js v18.19.1
- npm installed
- Frontend `node_modules` exists
- Backend `node_modules` exists
- Prisma client generated
- Environment files exist (`.env` in backend, `.env.local` in frontend)

### ⚠️ Known Issues
- **Permissions Issue**: `node_modules` directories are owned by `root` (from previous system)
  - **Solution**: Run the setup script to fix permissions

## 🛠️ Quick Setup (Run This First!)

### Option 1: Automated Setup Script (Recommended)

```bash
cd /home/immigrant/immigration_ai
./setup-project.sh
```

This script will:
1. Fix permissions on `node_modules`
2. Install/update frontend dependencies
3. Install/update backend dependencies
4. Generate Prisma client
5. Create environment file templates if missing
6. Verify system requirements

### Option 2: Manual Setup

#### Step 1: Fix Permissions
```bash
cd /home/immigrant/immigration_ai
sudo chown -R $USER:$USER node_modules
sudo chown -R $USER:$USER backend/node_modules
```

#### Step 2: Install Dependencies
```bash
# Frontend
cd /home/immigrant/immigration_ai
npm install

# Backend
cd /home/immigrant/immigration_ai/backend
npm install
```

#### Step 3: Generate Prisma Client
```bash
cd /home/immigrant/immigration_ai/backend
npx prisma generate
```

## 📁 Project Structure

```
immigration_ai/
├── app/                    # Next.js app directory (pages)
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── documents/         # Document generation tools
│   ├── admin/             # Admin panel
│   └── payment/           # Payment pages
├── components/            # React components
├── lib/                   # Utilities and API clients
├── contexts/              # React contexts (Auth, etc.)
├── hooks/                 # Custom React hooks
├── backend/               # Backend API
│   ├── src/
│   │   ├── app.ts         # Express app entry point
│   │   ├── config/        # Configuration (DB, JWT, OpenAI, Stripe)
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # Route handlers
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Auth, error handling, rate limiting
│   │   └── prompts/       # OpenAI prompts
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── migrations/    # Database migrations
│   └── .env              # Backend environment variables
├── package.json           # Frontend dependencies
└── .env.local            # Frontend environment variables
```

## 🔐 Environment Variables

### Backend (`.env` in `backend/`)

**Required:**
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/immigration_ai
JWT_SECRET=your_jwt_secret_minimum_32_characters
REFRESH_TOKEN_SECRET=your_refresh_token_secret_minimum_32_characters
```

**Optional (for full functionality):**
```env
OPENAI_API_KEY=sk-your-key
STRIPE_SECRET_KEY=sk_test_your-key
SENDGRID_API_KEY=SG.your-key
FRONTEND_URL=http://localhost:3000
FROM_EMAIL=noreply@immigrationai.com
```

### Frontend (`.env.local` in root)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-key
```

**Note**: The backend runs on port **3001** by default (or 4000 if PORT is not set), but the frontend API client defaults to port 4000. Make sure these match!

## 🗄️ Database Setup

### Option 1: Supabase (Recommended - Easiest)
1. Go to https://supabase.com
2. Create a new project
3. Copy the connection string from Settings > Database
4. Update `DATABASE_URL` in `backend/.env`

### Option 2: Local PostgreSQL
```bash
# Install PostgreSQL (if not installed)
sudo apt-get install postgresql postgresql-contrib

# Create database
createdb immigration_ai

# Update DATABASE_URL in backend/.env
```

### Run Migrations
```bash
cd /home/immigrant/immigration_ai/backend
npm run build
npm run migrate
```

## 🚀 Running the Project

### Start Backend
```bash
cd /home/immigrant/immigration_ai/backend
npm run dev
```
Backend will run on: `http://localhost:3001` (or port specified in `.env`)

### Start Frontend
```bash
cd /home/immigrant/immigration_ai
npm run dev
```
Frontend will run on: `http://localhost:3000`

## ✅ Verification Checklist

After setup, verify:

- [ ] Frontend dependencies installed (`npm list` in root)
- [ ] Backend dependencies installed (`npm list` in backend)
- [ ] Prisma client generated (`ls backend/node_modules/.prisma`)
- [ ] Backend `.env` file exists and has required variables
- [ ] Frontend `.env.local` exists and has `NEXT_PUBLIC_API_URL`
- [ ] Database is accessible (backend can connect)
- [ ] Backend starts without errors (`npm run dev` in backend)
- [ ] Frontend starts without errors (`npm run dev` in root)
- [ ] Can access `http://localhost:3000` (frontend)
- [ ] Can access `http://localhost:3001/health` (backend health check)

## 🐛 Troubleshooting

### Permission Denied Errors
```bash
# Fix ownership
sudo chown -R $USER:$USER node_modules
sudo chown -R $USER:$USER backend/node_modules
```

### Port Already in Use
```bash
# Check what's using the port
lsof -i :3001
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Database Connection Error
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Check `DATABASE_URL` in `backend/.env` is correct
- Ensure database exists: `psql -l | grep immigration_ai`

### Prisma Client Not Generated
```bash
cd backend
npx prisma generate
```

### Module Not Found Errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Same for backend
cd backend
rm -rf node_modules package-lock.json
npm install
```

## 📚 Key Documentation Files

- `START_HERE.md` - Quick start guide
- `backend/README.md` - Backend API documentation
- `backend/QUICKSTART.md` - Backend quick start
- `COMPLETE_SETUP_SUMMARY.md` - Detailed setup summary

## 🎯 Next Steps After Setup

1. **Configure Environment Variables**
   - Update `backend/.env` with real API keys
   - Update `.env.local` with frontend config

2. **Set Up Database**
   - Create database (Supabase or local)
   - Run migrations

3. **Test the Application**
   - Start both servers
   - Create a test account
   - Try generating a document

4. **Review Features**
   - Check `AI_FEATURES_COMPLETE.md` for available features
   - Review `DEPLOYMENT_CHECKLIST.md` if deploying

## 💡 Important Notes

- **Port Configuration**: Backend defaults to port 3001, but can be changed via `PORT` in `.env`
- **JWT Secrets**: Must be at least 32 characters long and different from each other
- **Database**: Prisma is used for ORM - always run `prisma generate` after schema changes
- **TypeScript**: Both frontend and backend use TypeScript - run `npm run typecheck` to verify

## 🆘 Need Help?

1. Check the troubleshooting section above
2. Review `START_HERE.md` for detailed instructions
3. Check backend logs: `backend/logs/error.log`
4. Check frontend console for errors

---

**Last Updated**: After project migration to new system
**Status**: Ready for setup and verification
