# 🎉 Immigration AI - Setup Complete!

## ✅ What's Running

### Frontend (Next.js)
- **URL:** http://localhost:3000
- **Status:** ✅ Running
- **Pages:** 
  - Landing page: http://localhost:3000
  - Login: http://localhost:3000/auth/login
  - Signup: http://localhost:3000/auth/signup
  - Dashboard: http://localhost:3000/dashboard

### Backend (Express + TypeScript)
- **URL:** http://localhost:4000
- **API Base:** http://localhost:4000/api
- **Status:** ✅ Running
- **Health Check:** http://localhost:4000/health

### Database (PostgreSQL via Docker)
- **Host:** localhost:5432
- **Database:** immigration_ai
- **User:** immigration_user
- **Password:** dev_password_123
- **Status:** ✅ Running in Docker container `immigration-db`

---

## 🚀 Quick Start Commands

### Start Everything
```bash
# Terminal 1 - Frontend
cd /home/paas/immigration_ai
npm run dev

# Terminal 2 - Backend
cd /home/paas/immigration_ai/backend
npx ts-node --transpile-only src/app.ts

# PostgreSQL (already running in Docker)
docker ps | grep immigration-db
```

### Stop Everything
```bash
# Stop frontend (Ctrl+C in Terminal 1)
# Stop backend (Ctrl+C in Terminal 2)

# Stop PostgreSQL
docker stop immigration-db

# To remove PostgreSQL (WARNING: deletes all data)
docker rm immigration-db
```

### Restart PostgreSQL
```bash
docker start immigration-db
```

---

## 📊 Database Management

### View Database Tables
```bash
docker exec immigration-db psql -U immigration_user -d immigration_ai -c "\dt"
```

### Access PostgreSQL Shell
```bash
docker exec -it immigration-db psql -U immigration_user -d immigration_ai
```

### Run Prisma Commands
```bash
cd /home/paas/immigration_ai/backend

# Sync schema to database
npx prisma db push

# Open Prisma Studio (GUI for database)
npx prisma studio

# Generate Prisma Client
npx prisma generate

# Create a migration
npx prisma migrate dev --name description_of_change
```

---

## 🧪 Test the API

### Health Check
```bash
curl http://localhost:4000/health
```

### Create an Account
```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "fullName": "John Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

---

## 📁 Project Structure

```
immigration_ai/
├── app/                    # Next.js frontend pages
├── components/             # React components
├── contexts/              # React contexts (AuthContext)
├── lib/                   # Frontend utilities
│   └── api/              # API client functions
├── backend/               # Express backend
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Express middleware
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── types/        # TypeScript types
│   │   ├── utils/        # Utility functions
│   │   └── app.ts        # Express app entry point
│   ├── prisma/
│   │   └── schema.prisma # Database schema
│   └── .env              # Backend environment variables
└── .env.local            # Frontend environment variables
```

---

## 🔧 Configuration Files

### Backend .env
```env
DATABASE_URL="postgresql://immigration_user:dev_password_123@localhost:5432/immigration_ai"
NODE_ENV=development
PORT=4000
JWT_SECRET=dev_jwt_secret_change_in_production
JWT_EXPIRE=7d
REFRESH_TOKEN_SECRET=dev_refresh_secret_change_in_production
REFRESH_TOKEN_EXPIRE=30d
OPENAI_API_KEY=sk-mock-key-for-testing
STRIPE_SECRET_KEY=sk_test_mock
STRIPE_WEBHOOK_SECRET=whsec_mock
SENDGRID_API_KEY=SG.mock
FROM_EMAIL=noreply@immigrationai.com
FRONTEND_URL=http://localhost:3000
```

### Frontend .env.local
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_APP_NAME=Immigration AI
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🐛 Common Issues & Fixes

### Backend won't start - "Unable to compile TypeScript"
**Solution:** Use `ts-node --transpile-only` flag
```bash
cd backend
npx ts-node --transpile-only src/app.ts
```

### Database connection error
**Solution:** Make sure PostgreSQL container is running
```bash
docker ps | grep immigration-db
# If not running:
docker start immigration-db
```

### Port already in use
**Solution:** Kill the process using the port
```bash
# For port 4000 (backend)
lsof -ti:4000 | xargs kill -9

# For port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

### Frontend can't connect to backend
**Solution:** Check .env.local has correct API URL
```bash
cat .env.local
# Should show: NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## 🎯 Next Steps - To Add Real API Keys

### 1. OpenAI (for document generation)
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Update `backend/.env`:
   ```env
   OPENAI_API_KEY=sk-proj-your-real-key-here
   ```

### 2. Stripe (for billing)
1. Go to https://dashboard.stripe.com/test/apikeys
2. Get your test keys
3. Update `backend/.env`:
   ```env
   STRIPE_SECRET_KEY=sk_test_your-real-key
   STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
   ```

### 3. SendGrid (for emails)
1. Go to https://app.sendgrid.com/settings/api_keys
2. Create a new API key
3. Update `backend/.env`:
   ```env
   SENDGRID_API_KEY=SG.your-real-key
   FROM_EMAIL=noreply@yourdomain.com
   ```

---

## 📦 Deployment to Hetzner

### 1. Install PostgreSQL on Server
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Create Database
```bash
sudo -u postgres psql
CREATE DATABASE immigration_ai;
CREATE USER immigration_user WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE immigration_ai TO immigration_user;
\q
```

### 3. Deploy Backend
```bash
cd backend
npm install
npm run build
NODE_ENV=production node dist/app.js
```

### 4. Deploy Frontend
```bash
npm install
npm run build
npm start
```

### 5. Use PM2 for Process Management
```bash
npm install -g pm2
pm2 start backend/dist/app.js --name immigration-backend
pm2 start npm --name immigration-frontend -- start
pm2 save
pm2 startup
```

---

## 📚 Documentation

- **Prisma Docs:** https://www.prisma.io/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Express Docs:** https://expressjs.com
- **Docker Docs:** https://docs.docker.com

---

## ✨ Features Implemented

### Authentication
- ✅ User registration
- ✅ Login with JWT
- ✅ Refresh tokens
- ✅ Password hashing (bcrypt)
- ✅ Protected routes

### Document Generation
- ✅ SOP Generator
- ✅ Cover Letter Generator
- ✅ Document Review
- ✅ Visa Checklist

### Billing (Stripe Integration)
- ✅ Subscription plans (Free, Pro, Enterprise)
- ✅ Payment processing
- ✅ Usage tracking

### Database
- ✅ PostgreSQL with Prisma ORM
- ✅ User management
- ✅ Document storage
- ✅ API usage tracking
- ✅ Subscription management

---

**🎊 Your Immigration AI platform is ready for development!**

**Questions?** Check the README files or documentation links above.


