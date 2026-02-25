# Immigration Platform
## AI-powered case management for immigration professionals

---

## Overview

The Immigration Platform is a comprehensive B2B2C (Business-to-Business-to-Consumer) SaaS solution designed specifically for immigration agencies, consultancies, and professionals managing visa applications for African clients. The platform streamlines the entire immigration case management process, from initial client onboarding through document collection, AI-powered checklist generation, and final visa submission.

Built with a focus on African immigration corridors, the platform provides specialized tools for credential evaluation, VAC appointment tracking, financial documentation assistance, and AI-powered document generation. It serves as a centralized hub where immigration professionals can manage multiple cases, collaborate with team members, and provide clients with a self-service portal to track their application progress.

---

## Who It's For

### Immigration Agencies & Consultancies (Primary Customers)
- Manage multiple client cases simultaneously
- Track document collection and submission deadlines
- Generate AI-powered checklists based on visa type and country
- Collaborate with team members on complex cases
- Access analytics and performance metrics
- Bill clients through integrated payment processing

### Individual Applicants (Self-Service Portal)
- Track their own visa application progress
- Upload required documents securely
- Communicate with their assigned professional
- View checklist items and completion status
- Access case updates and notifications

### Corporate HR Teams (Future)
- Manage employee visa applications at scale
- Track multiple applications across the organization
- Access bulk reporting and analytics

---

## Features

### Case Management
- Create and organize immigration cases by visa type, destination, and priority
- Assign cases to team members
- Track case status from open to approved/refused
- Set submission deadlines and track progress
- Reference number generation for easy case identification

### Document Management
- Secure file uploads with organization-scoped storage
- Document categorization (identity, financial, educational, employment, travel, supporting)
- Document status tracking (pending review, approved, rejected, expired)
- Expiry date tracking with alerts for expiring documents
- Document download and preview capabilities
- Link documents to checklist items

### AI Tools
- **AI Checklist Generator**: Generate comprehensive document checklists based on visa type, origin country, and destination
- **Credential Evaluation Guide**: Check university recognition status and get personalized evaluation roadmaps
- **Financial Documentation Assistant**: Analyze bank statements and generate sponsor letters
- **Document Improvement**: AI-powered suggestions for improving document quality

### Client Portal
- Self-service portal for applicants
- Real-time case status updates
- Secure document upload interface
- Direct messaging with assigned professional
- Checklist progress tracking

### Team Management
- Invite team members with role-based access
- Three user roles: Organization Admin, Professional, Applicant
- Team performance analytics
- Activity tracking and audit logs

### Billing
- Subscription-based pricing (Starter, Professional, Agency)
- Integration with PayFast, Stripe, and Yoco
- Usage tracking for AI features
- Invoice generation and payment history

### Africa-Specific Features
- **Credential Evaluation Guide**: Covers 14 major African universities and attestation processes for 8 African countries
- **VAC Tracker**: Find visa application centres and estimated wait times across 20+ centres in 10+ African cities
- **Financial Documentation Assistant**: Tailored for African banking systems and requirements
- **AI Checklist**: Includes Africa-specific document requirements (e.g., NYSC certificates for Nigeria)
- **Local Payment Methods**: Support for PayFast (South Africa) and Yoco

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 13 (React 18) | Server-side rendered React application |
| Backend | Node.js + Express | RESTful API server |
| Database | PostgreSQL | Primary data storage |
| ORM | Prisma | Type-safe database access |
| Auth | JWT (Access + Refresh tokens) | Secure authentication |
| AI | OpenAI GPT-4 | Document generation, checklist creation |
| Payments | Stripe, PayFast, Yoco | Payment processing |
| Email | Resend | Transactional emails |
| File Storage | Local filesystem (uploads/) | Document storage |
| Deployment | Vercel (Frontend), Hetzner VPS (Backend) | Production hosting |

---

## User Roles

| Role | Access Level | Description |
|------|--------------|-------------|
| org_admin | Full Access | Can manage organization settings, invite users, view analytics, manage billing |
| professional | Case Management | Can create and manage cases, communicate with clients, generate AI checklists |
| applicant | Self-Service | Can view assigned cases, upload documents, communicate with professionals |

---

## Supported Immigration Corridors

| Origin Country | Destination | Visa Types |
|----------------|-------------|------------|
| Nigeria | UK, Canada, USA, Germany, UAE | Student, Skilled Worker, Visitor, Family |
| Ghana | UK, Canada, USA, Germany, UAE | Student, Skilled Worker, Visitor, Family |
| Kenya | UK, Canada, USA, Germany, UAE | Student, Skilled Worker, Visitor, Family |
| South Africa | UK, Canada, USA, Germany, UAE | Student, Skilled Worker, Visitor, Family |
| Ethiopia | UK, Canada, USA, Germany, UAE | Student, Skilled Worker, Visitor, Family |
| Zimbabwe | UK, Canada, USA, Germany, UAE | Student, Skilled Worker, Visitor, Family |
| Uganda | UK, Canada, USA, Germany, UAE | Student, Skilled Worker, Visitor, Family |
| Tanzania | UK, Canada, USA, Germany, UAE | Student, Skilled Worker, Visitor, Family |

---

## Getting Started

### Prerequisites
- Node.js 18+ (recommended: 20.x)
- PostgreSQL 14+ (or Supabase account)
- OpenAI API key
- Resend API key (for emails)
- Git

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/immigration_ai.git
cd immigration_ai
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env` with your values:
```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/immigration_ai
JWT_SECRET=your_jwt_secret_minimum_32_characters
JWT_REFRESH_SECRET=your_refresh_token_secret_minimum_32_characters
OPENAI_API_KEY=sk-your-openai-api-key
RESEND_API_KEY=re_your-resend-api-key
FRONTEND_URL=http://localhost:3000
```

Run database migrations:
```bash
npx prisma migrate dev
```

Start the development server:
```bash
npm run dev
```

The backend will run on `http://localhost:4000`

### 3. Frontend setup

```bash
# From project root
npm install
```

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

---

## API Reference

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| POST | `/api/auth/refresh` | Refresh access token | Public |
| GET | `/api/auth/me` | Get current user | Required |

### Cases
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/cases` | List all cases (with filters) | Required |
| GET | `/api/cases/:id` | Get case details | Required |
| POST | `/api/cases` | Create new case | Required |
| PUT | `/api/cases/:id` | Update case | Required |
| GET | `/api/cases/stats` | Get case statistics | Required |

### Documents
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/case-documents` | List all documents (org-scoped) | Required |
| GET | `/api/case-documents/case/:caseId` | Get documents for a case | Required |
| POST | `/api/case-documents/upload` | Upload document | Required |
| PUT | `/api/case-documents/:id` | Update document | Required |
| DELETE | `/api/case-documents/:id` | Delete document | Required |
| GET | `/api/case-documents/:id/download` | Download document | Required |

### Tasks
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/tasks` | List all tasks (org-scoped) | Required |
| GET | `/api/tasks/case/:caseId` | Get tasks for a case | Required |
| POST | `/api/tasks` | Create task | Required |
| PUT | `/api/tasks/:id` | Update task | Required |
| DELETE | `/api/tasks/:id` | Delete task | Required |
| GET | `/api/tasks/upcoming` | Get upcoming deadlines | Required |

### Checklists
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/checklists` | Create checklist | Required |
| GET | `/api/checklists/case/:caseId` | Get checklists for case | Required |
| PUT | `/api/checklists/items/:id` | Update checklist item | Required |
| DELETE | `/api/checklists/:id` | Delete checklist | Required |

### AI Features
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/ai/generate-checklist` | Generate AI checklist | Required |
| POST | `/api/ai/improve-document` | Improve document with AI | Required |
| POST | `/api/ai/analyze-financial` | Analyze financial documents | Required |
| POST | `/api/ai/sponsor-letter` | Generate sponsor letter | Required |

### Credential Evaluation
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/credentials/evaluation-bodies` | Get evaluation bodies | Required |
| GET | `/api/credentials/university-check` | Check university recognition | Required |
| GET | `/api/credentials/attestation-steps` | Get attestation steps | Required |
| POST | `/api/credentials/generate-guide` | Generate credential guide | Required |

### VAC Tracker
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/vac/centres` | Get VAC centres | Required |
| GET | `/api/vac/wait-times` | Get wait times | Required |
| GET | `/api/vac/booking-links` | Get booking links | Required |

### Analytics
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/immigration-analytics/overview` | Get overview stats | org_admin |
| GET | `/api/immigration-analytics/trends` | Get case trends | org_admin |
| GET | `/api/immigration-analytics/professionals` | Get professional performance | org_admin |

### Organizations
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/organizations/me` | Get my organization | Required |
| PUT | `/api/organizations/me` | Update organization | Required |
| GET | `/api/organizations/me/users` | Get organization users | Required |
| POST | `/api/organizations/me/invite` | Invite user | org_admin |

### Billing
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/billing/subscription` | Get subscription details | Required |
| GET | `/api/billing/plans` | Get available plans | Required |
| POST | `/api/billing/initiate` | Initiate payment | Required |
| DELETE | `/api/billing/cancel` | Cancel subscription | Required |

---

## Subscription Plans

| Feature | Starter (R299/month) | Professional (R699/month) | Agency (R1499/month) |
|---------|---------------------|---------------------------|---------------------|
| Cases per month | 10 | 50 | Unlimited |
| Team members | 2 | 5 | Unlimited |
| AI Checklist generations | 20 | 100 | Unlimited |
| AI Document improvements | 10 | 50 | Unlimited |
| Storage | 5GB | 25GB | 100GB |
| Support | Email | Email + Priority | Email + Priority + Phone |

---

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed production deployment instructions.

### Quick Summary
- **Frontend**: Deploy to Vercel (automatic from Git)
- **Backend**: Deploy to Hetzner VPS using PM2
- **Database**: Use Supabase (PostgreSQL) or self-hosted PostgreSQL

---

## Africa-Specific Features

### Credential Evaluation Guide
- Covers 14 major African universities (University of Lagos, University of Ghana, University of Nairobi, etc.)
- Attestation processes for 8 African countries (Nigeria, Ghana, Kenya, South Africa, Ethiopia, Zimbabwe, Uganda, Tanzania)
- Recognition status for UK, Canada, and USA
- AI-powered personalized evaluation roadmaps

### VAC Tracker
- 20+ visa application centres across 10+ African cities
- Estimated wait times based on historical data
- Direct booking links to official portals
- Tips for each destination country

### Financial Documentation Assistant
- Tailored for African banking systems
- Support for multiple currencies (NGN, GHS, KES, ZAR, etc.)
- Sponsor letter generation with local context
- Bank statement analysis

### AI Checklist with Africa-Specific Requirements
- NYSC discharge/exemption certificates for Nigeria
- Birth certificate apostille requirements
- Sponsor letter templates for African contexts
- Local bank statement requirements

### Local Payment Methods
- **PayFast**: South African payment gateway
- **Yoco**: South African card payments
- **Stripe**: International card payments

---

## Environment Variables

### Backend (.env)

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `development` or `production` |
| `PORT` | No | Server port (default: 4000) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | JWT signing secret (min 32 chars) |
| `JWT_REFRESH_SECRET` | Yes | Refresh token secret (min 32 chars) |
| `OPENAI_API_KEY` | Yes | OpenAI API key |
| `RESEND_API_KEY` | Yes | Resend API key for emails |
| `FRONTEND_URL` | Yes | Frontend URL (e.g., `https://immigrationai.co.za`) |
| `STRIPE_SECRET_KEY` | No | Stripe secret key |
| `PAYFAST_MERCHANT_ID` | No | PayFast merchant ID |
| `YOCO_SECRET_KEY` | No | Yoco secret key |

### Frontend (.env.local)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | No | Stripe publishable key |
| `NEXT_PUBLIC_GA_ID` | No | Google Analytics ID |

---

## License

MIT License

---

## Support

For support, email support@immigrationai.co.za or visit https://immigrationai.co.za
