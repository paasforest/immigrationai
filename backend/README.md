# Immigration AI Backend

Backend API for the Immigration AI platform - AI-powered immigration document generation and management.

## Features

- 🔐 **Authentication**: JWT-based auth with refresh tokens
- 📝 **Document Generation**: SOP, Cover Letters with OpenAI GPT-4
- 🔍 **Document Review**: AI-powered SOP feedback and suggestions
- ✅ **Checklists**: Country-specific visa requirement checklists
- 💳 **Billing**: Stripe integration for subscriptions
- 📊 **Usage Tracking**: Monitor API usage and limits
- 📧 **Email Notifications**: SendGrid email service
- 🛡️ **Security**: Rate limiting, input validation, error handling

## Tech Stack

- **Node.js** + **Express** + **TypeScript**
- **PostgreSQL** - Database
- **OpenAI GPT-4** - AI document generation
- **Stripe** - Payment processing
- **SendGrid** - Email service
- **JWT** - Authentication
- **Redis** - Rate limiting

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- OpenAI API key
- Stripe account
- SendGrid account

### Installation

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your API keys:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/immigration_ai
   JWT_SECRET=your_jwt_secret_here
   OPENAI_API_KEY=sk-your-key
   STRIPE_SECRET_KEY=sk_test_your-key
   SENDGRID_API_KEY=SG.your-key
   FRONTEND_URL=http://localhost:3000
   ```

3. **Create PostgreSQL database:**
   ```bash
   createdb immigration_ai
   ```

4. **Run migrations:**
   ```bash
   npm run build
   npm run migrate
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

   Server will start on `http://localhost:3001`

## API Documentation

### Authentication Endpoints

```
POST /api/auth/signup          - Create new account
POST /api/auth/login           - Login
POST /api/auth/logout          - Logout
POST /api/auth/refresh         - Refresh access token
GET  /api/auth/user            - Get current user
POST /api/auth/reset-password  - Request password reset
POST /api/auth/confirm-reset   - Confirm password reset
```

### Document Endpoints (Protected)

```
POST   /api/documents/generate-sop          - Generate Statement of Purpose
POST   /api/documents/generate-cover-letter - Generate Cover Letter
POST   /api/documents/review-sop            - Review SOP
GET    /api/documents                       - List user's documents
GET    /api/documents/:id                   - Get single document
DELETE /api/documents/:id                   - Delete document
```

### Checklist Endpoints (Public)

```
GET /api/checklists?country=X&visa_type=Y  - Get visa checklist
GET /api/checklists/all                    - List all checklists
```

### Billing Endpoints (Protected)

```
POST /api/billing/checkout  - Create Stripe checkout session
GET  /api/billing/portal    - Get customer portal URL
GET  /api/billing/usage     - Get current usage and limits
POST /api/billing/webhook   - Stripe webhook handler
```

## Project Structure

```
backend/
├── src/
│   ├── config/         # Database, OpenAI, Stripe, JWT config
│   ├── middleware/     # Auth, error handling, rate limiting
│   ├── routes/         # API routes
│   ├── controllers/    # Request handlers
│   ├── services/       # Business logic
│   ├── models/         # Type definitions
│   ├── prompts/        # OpenAI prompts
│   ├── utils/          # Helpers, validators, logger
│   ├── types/          # TypeScript types
│   ├── scripts/        # Migration scripts
│   └── app.ts          # Main entry point
├── migrations/         # Database migrations
├── seeds/             # Database seeds
└── logs/              # Application logs
```

## Database Schema

- **users** - User accounts and profiles
- **documents** - Generated documents (SOPs, cover letters, reviews)
- **api_usage** - OpenAI API usage tracking
- **subscriptions** - Stripe subscription data
- **checklists** - Visa requirement checklists
- **refresh_tokens** - JWT refresh token management
- **password_reset_tokens** - Password reset tokens

## Subscription Plans

### Free Plan
- 3 documents per month
- 10,000 tokens per month
- Basic templates
- Standard support

### Pro Plan ($29/month)
- Unlimited documents
- 500,000 tokens per month
- Advanced AI suggestions
- Priority support
- Document history
- Custom templates

### Enterprise Plan (Custom)
- Everything in Pro
- Unlimited tokens
- API access
- Dedicated support
- Custom integrations
- SLA guarantee

## Development

### Run in development mode:
```bash
npm run dev
```

### Build for production:
```bash
npm run build
```

### Start production server:
```bash
npm start
```

### Run migrations:
```bash
npm run migrate
```

## Environment Variables

Required environment variables:

- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3001)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRE` - JWT expiration (default: 7d)
- `REFRESH_TOKEN_SECRET` - Refresh token secret
- `OPENAI_API_KEY` - OpenAI API key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `SENDGRID_API_KEY` - SendGrid API key
- `FRONTEND_URL` - Frontend URL for CORS
- `FROM_EMAIL` - Email sender address

## Security Features

- ✅ Helmet.js security headers
- ✅ CORS configuration
- ✅ Rate limiting per IP and per user
- ✅ Input validation with Zod
- ✅ JWT authentication with refresh tokens
- ✅ Password hashing with bcrypt
- ✅ SQL injection prevention
- ✅ Error handling and logging

## Error Handling

All errors return a consistent format:

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human readable error message",
  "statusCode": 400
}
```

## Logging

Winston logger is configured with:
- Console output in development
- File output (`logs/error.log`, `logs/combined.log`)
- Structured JSON logging
- Error stack traces

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT License


