# Immigration AI Backend - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Set up Environment Variables

Copy the example file and add your API keys:
```bash
cp .env.example .env
```

**Required API Keys:**
- **OpenAI**: Get from https://platform.openai.com/api-keys
- **Stripe**: Get from https://dashboard.stripe.com/apikeys
- **SendGrid**: Get from https://app.sendgrid.com/settings/api_keys

Edit `.env` and replace:
```bash
OPENAI_API_KEY=sk-your-actual-key-here
STRIPE_SECRET_KEY=sk_test_your-actual-key-here
SENDGRID_API_KEY=SG.your-actual-key-here
```

### Step 2: Set up PostgreSQL Database

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL (if not installed)
sudo apt-get install postgresql  # Ubuntu/Debian
brew install postgresql          # macOS

# Create database
createdb immigration_ai

# Update DATABASE_URL in .env:
DATABASE_URL=postgresql://postgres:password@localhost:5432/immigration_ai
```

**Option B: Use Supabase (Recommended)**
1. Go to https://supabase.com
2. Create a new project
3. Copy the connection string from Settings > Database
4. Update `.env`:
```bash
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
```

### Step 3: Run Database Migrations

```bash
npm run build
npm run migrate
```

You should see:
```
✅ Completed 001_create_users.sql
✅ Completed 002_create_documents.sql
✅ Completed 003_create_api_usage.sql
...
✨ All migrations completed successfully!
```

### Step 4: Start the Server

```bash
npm run dev
```

You should see:
```
🚀 Immigration AI Backend running on port 3001
📝 Environment: development
🔗 Frontend URL: http://localhost:3000
✅ Database connected successfully
```

### Step 5: Test the API

**Health Check:**
```bash
curl http://localhost:3001/health
```

**Create Account:**
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "fullName": "Test User"
  }'
```

**Generate SOP (requires token from signup):**
```bash
curl -X POST http://localhost:3001/api/documents/generate-sop \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "fullName": "John Doe",
    "countryOfResidence": "India",
    "targetCountry": "Canada",
    "purpose": "Study",
    "motivation": "I am passionate about pursuing higher education in computer science..."
  }'
```

## 🔧 Troubleshooting

### Database Connection Failed
- Check PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in `.env`
- Test connection: `psql $DATABASE_URL`

### OpenAI API Error
- Check API key is valid
- Verify you have credits: https://platform.openai.com/usage
- Check rate limits

### Port Already in Use
Change PORT in `.env`:
```bash
PORT=3002
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/user` - Get current user

### Documents
- `POST /api/documents/generate-sop` - Generate SOP
- `POST /api/documents/generate-cover-letter` - Generate cover letter
- `POST /api/documents/review-sop` - Review SOP
- `GET /api/documents` - List documents
- `GET /api/documents/:id` - Get document
- `DELETE /api/documents/:id` - Delete document

### Checklists (Public)
- `GET /api/checklists?country=Canada&visa_type=Student` - Get checklist

### Billing
- `POST /api/billing/checkout` - Create checkout session
- `GET /api/billing/portal` - Customer portal
- `GET /api/billing/usage` - Get usage stats

## 🎯 Next Steps

1. **Connect Frontend**: Update frontend to call backend API
2. **Configure Stripe**: Set up products and prices
3. **Set up Webhooks**: Configure Stripe webhooks
4. **Deploy**: Deploy to production

## 🆘 Need Help?

- Check full documentation in `README.md`
- Review error logs in `logs/` directory
- Check terminal output for errors

## 🎉 Success!

Your backend is now running! Open http://localhost:3001/health to verify.


